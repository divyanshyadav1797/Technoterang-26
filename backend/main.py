# ─────────────────────────────────────────────────────────────────
#  PeerTutor — FastAPI Backend  |  main.py
#
#  Folder layout:
#    backend/
#    ├── main.py
#    ├── requirements.txt
#    ├── .env                       ← create from .env.example
#    └── peer-2-peer-data-firebase-adminsdk-fbsvc-*.json
#
#  Run:
#    uvicorn main:app --reload --port 8000
#
#  API Docs: http://localhost:8000/docs
# ─────────────────────────────────────────────────────────────────

import os
import uuid
import json
import asyncio
import requests as http_requests
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import auth, credentials, firestore

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv

# ── Load .env ─────────────────────────────────────────────
load_dotenv()

# Firebase Web API Key — needed to verify passwords via REST API.
FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY", "")

# ── Firebase Admin Initialisation ─────────────────────────
# Searches for any Firebase Admin SDK JSON in the backend directory.
# If none is found, the server still starts — Firebase-dependent
# endpoints will return HTTP 503 with a helpful error message.

_FIREBASE_OK = False
db = None

_backend_dir = Path(__file__).parent
_cred_files = list(_backend_dir.glob("*-firebase-adminsdk-*.json"))

if _cred_files:
    SERVICE_ACCOUNT_PATH = _cred_files[0]
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(str(SERVICE_ACCOUNT_PATH))
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        _FIREBASE_OK = True
        print(f"[OK] Firebase initialised with: {SERVICE_ACCOUNT_PATH.name}")
    except Exception as exc:
        print(f"[WARN] Firebase init failed: {exc}")
else:
    print(
        "[WARN] No Firebase service-account JSON found in backend/.\n"
        "   Place your *-firebase-adminsdk-*.json file here.\n"
        "   WebSocket signaling will work; Firestore endpoints will return 503."
    )


def _require_firebase():
    """Call at the top of any endpoint that needs Firestore / Auth."""
    if not _FIREBASE_OK or db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Firebase is not configured. Place your service-account JSON "
                "in the backend/ directory and restart the server."
            ),
        )

# ── FastAPI App ────────────────────────────────────────────
app = FastAPI(
    title="PeerTutor API",
    description="Backend for the PeerTutor P2P Micro-Tutoring Platform",
    version="2.0.0",
)

# ── CORS ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        # Vercel production deployments
        "https://frontend-tau-seven-81.vercel.app",
        "https://frontend-e5cpqns3q-vinayavasthi007-5531s-projects.vercel.app",
        # Allow all Vercel preview deployments for this project
        "https://*.vercel.app",
        # Render self-origin
        "https://technoterang-26.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════
#  In-Memory WebRTC Signaling Room Registry
#  rooms: { room_id: [WebSocket, WebSocket] }
# ══════════════════════════════════════════════════════════

rooms: Dict[str, List[WebSocket]] = {}


# ══════════════════════════════════════════════════════════
#  Pydantic Models
# ══════════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    full_name: str  = Field(..., min_length=2, max_length=100, example="Jane Doe")
    email:     EmailStr = Field(..., example="jane@example.com")
    password:  str  = Field(..., min_length=6, example="supersecret123")


class LoginRequest(BaseModel):
    # Frontend signs in via Firebase JS SDK and sends the verified ID token.
    # Backend verifies it and returns the Firestore user profile.
    id_token: str = Field(..., min_length=1)


class UserProfile(BaseModel):
    uid:             str
    full_name:       str
    email:           str
    role:            str
    created_at:      str | None = None
    reputation_score: int = 0
    peer_credits:    int = 0


class RegisterResponse(BaseModel):
    message: str
    user:    UserProfile


class LoginResponse(BaseModel):
    message:  str
    id_token: str
    user:     UserProfile


class CreateSessionRequest(BaseModel):
    id:          str = Field(default_factory=lambda: str(uuid.uuid4()))
    title:       str
    subject:     str
    description: str = ""
    tags:        List[str] = []
    isPublic:    bool = True
    accessCode:  str = ""
    createdBy:   str              # uid
    createdByName: str = "Unknown"
    day:         str = ""
    startHour:   int = 9
    endHour:     int = 10
    imageUrl:    str = ""


class VerifyKeyRequest(BaseModel):
    session_id:  str
    access_code: str


class CompleteSessionRequest(BaseModel):
    session_id:   str
    uid_host:     str
    uid_joiner:   str


# ══════════════════════════════════════════════════════════
#  Helper: sign in via Firebase Auth REST API
# ══════════════════════════════════════════════════════════

def firebase_sign_in(email: str, password: str) -> dict:
    if not FIREBASE_WEB_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "FIREBASE_WEB_API_KEY is not set in the backend .env file. "
                "Get it from Firebase Console → Project Settings → General."
            ),
        )

    url = (
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
        f"?key={FIREBASE_WEB_API_KEY}"
    )
    resp = http_requests.post(
        url,
        json={"email": email, "password": password, "returnSecureToken": True},
        timeout=10,
    )

    if resp.status_code != 200:
        error = resp.json().get("error", {}).get("message", "UNKNOWN")
        if error in ("EMAIL_NOT_FOUND", "INVALID_LOGIN_CREDENTIALS", "INVALID_PASSWORD"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Firebase sign-in error: {error}",
        )

    return resp.json()


# ══════════════════════════════════════════════════════════
#  Endpoints — Health
# ══════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "PeerTutor API v2.0"}


# ══════════════════════════════════════════════════════════
#  Endpoints — Auth
# ══════════════════════════════════════════════════════════

@app.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Auth"],
)
async def register(payload: RegisterRequest):
    _require_firebase()
    try:
        fb_user = auth.create_user(
            email=payload.email,
            password=payload.password,
            display_name=payload.full_name,
        )
    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Firebase Auth error: {exc}",
        )

    user_doc = {
        "uid":             fb_user.uid,
        "full_name":       payload.full_name,
        "email":           payload.email,
        "role":            "student",
        "created_at":      firestore.SERVER_TIMESTAMP,
        "reputation_score": 0,
        "peer_credits":    0,
    }

    try:
        db.collection("users").document(fb_user.uid).set(user_doc)
    except Exception as exc:
        auth.delete_user(fb_user.uid)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Firestore write failed: {exc}",
        )

    profile = UserProfile(
        uid=fb_user.uid,
        full_name=payload.full_name,
        email=payload.email,
        role="student",
    )

    return RegisterResponse(
        message="Account created successfully! Welcome to PeerTutor.",
        user=profile,
    )


@app.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    tags=["Auth"],
)
async def login(payload: LoginRequest):
    _require_firebase()

    # Verify the Firebase ID token the JS SDK already issued
    try:
        decoded = auth.verify_id_token(payload.id_token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}"
        )

    uid = decoded["uid"]

    # Fetch Firestore profile
    try:
        doc = db.collection("users").document(uid).get()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Firestore read failed: {exc}")

    # Auto-create a profile if the user registered directly through Firebase
    # (e.g. Google OAuth) and doesn't have a Firestore doc yet.
    if not doc.exists:
        fb_user = auth.get_user(uid)
        new_profile = {
            "uid":              uid,
            "full_name":        fb_user.display_name or fb_user.email.split("@")[0],
            "email":            fb_user.email or "",
            "role":             "student",
            "reputation_score": 0,
            "peer_credits":     0,
            "created_at":       firestore.SERVER_TIMESTAMP,
        }
        db.collection("users").document(uid).set(new_profile)
        data = new_profile
        data["created_at"] = None  # SERVER_TIMESTAMP resolves async
    else:
        data = doc.to_dict()

    created_at = None
    if data.get("created_at"):
        try:
            created_at = data["created_at"].isoformat()
        except Exception:
            created_at = str(data["created_at"])

    profile = UserProfile(
        uid=uid,
        full_name=data.get("full_name", ""),
        email=data.get("email", ""),
        role=data.get("role", "student"),
        created_at=created_at,
        reputation_score=data.get("reputation_score", 0),
        peer_credits=data.get("peer_credits", 0),
    )

    return LoginResponse(
        message=f"Welcome back, {profile.full_name}!",
        id_token=payload.id_token,
        user=profile,
    )


# ══════════════════════════════════════════════════════════
#  Endpoints — Users
# ══════════════════════════════════════════════════════════

@app.get(
    "/users/{uid}",
    response_model=UserProfile,
    tags=["Users"],
)
async def get_user(uid: str):
    _require_firebase()
    try:
        doc = db.collection("users").document(uid).get()
    except Exception as exc:
        raise HTTPException(500, detail=str(exc))

    if not doc.exists:
        raise HTTPException(404, detail="User not found.")

    data = doc.to_dict()

    created_at = None
    if data.get("created_at"):
        try:
            created_at = data["created_at"].isoformat()
        except Exception:
            created_at = str(data["created_at"])

    return UserProfile(
        uid=uid,
        full_name=data.get("full_name", ""),
        email=data.get("email", ""),
        role=data.get("role", "student"),
        created_at=created_at,
        reputation_score=data.get("reputation_score", 0),
        peer_credits=data.get("peer_credits", 0),
    )


# ══════════════════════════════════════════════════════════
#  Endpoints — Sessions (Firestore)
# ══════════════════════════════════════════════════════════

@app.post(
    "/sessions",
    status_code=status.HTTP_201_CREATED,
    tags=["Sessions"],
)
async def create_session(payload: CreateSessionRequest):
    """
    Writes a new session document to Firestore 'sessions' collection.
    Called by SessionLauncher after local state is updated.
    """
    _require_firebase()
    session_doc = {
        "id":           payload.id,
        "title":        payload.title,
        "subject":      payload.subject,
        "description":  payload.description,
        "tags":         payload.tags,
        "isPublic":     payload.isPublic,
        "accessCode":   payload.accessCode,
        "createdBy":    payload.createdBy,
        "createdByName": payload.createdByName,
        "day":          payload.day,
        "startHour":    payload.startHour,
        "endHour":      payload.endHour,
        "imageUrl":     payload.imageUrl,
        "status":       "waiting",
        "participants": [payload.createdBy],
        "handRaised":   False,
        "createdAt":    firestore.SERVER_TIMESTAMP,
    }
    try:
        db.collection("sessions").document(payload.id).set(session_doc)
    except Exception as exc:
        raise HTTPException(500, detail=f"Firestore write failed: {exc}")

    return {"message": "Session created.", "session_id": payload.id}


@app.get("/sessions", tags=["Sessions"])
async def list_public_sessions():
    """
    Returns all public sessions ordered by creation time (newest first).
    Primarily used as a fallback REST call; the frontend uses Firestore
    onSnapshot listeners for real-time updates.
    """
    _require_firebase()
    try:
        docs = (
            db.collection("sessions")
            .where("isPublic", "==", True)
            .where("status", "in", ["waiting", "live"])
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
            .limit(50)
            .stream()
        )
        sessions = []
        for doc in docs:
            d = doc.to_dict()
            # Serialise timestamps
            if d.get("createdAt"):
                try:
                    d["createdAt"] = d["createdAt"].isoformat()
                except Exception:
                    d["createdAt"] = str(d["createdAt"])
            sessions.append(d)
        return {"sessions": sessions}
    except Exception as exc:
        raise HTTPException(500, detail=str(exc))


@app.post("/verify-key", tags=["Sessions"])
async def verify_key(payload: VerifyKeyRequest):
    """
    Validates an access code for a private session.
    Returns 200 + {valid: true} on success, 403 on mismatch.
    """
    _require_firebase()
    try:
        doc = db.collection("sessions").document(payload.session_id).get()
    except Exception as exc:
        raise HTTPException(500, detail=str(exc))

    if not doc.exists:
        raise HTTPException(404, detail="Session not found.")

    data = doc.to_dict()
    stored_code = data.get("accessCode", "")

    if stored_code != payload.access_code:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid access code. Please try again.",
        )

    return {"valid": True, "session": data}


@app.post("/complete-session", tags=["Sessions"])
async def complete_session(payload: CompleteSessionRequest):
    """
    Marks session as 'complete' and awards reputation_score (+10) and
    peer_credits (+5) to both the host and joiner.
    """
    _require_firebase()
    REPUTATION_REWARD = 10
    CREDITS_REWARD    = 5

    try:
        # Mark session complete
        db.collection("sessions").document(payload.session_id).update({
            "status": "complete",
            "completedAt": firestore.SERVER_TIMESTAMP,
        })

        # Award both participants
        for uid in [payload.uid_host, payload.uid_joiner]:
            if not uid:
                continue
            user_ref = db.collection("users").document(uid)
            user_doc = user_ref.get()
            if user_doc.exists:
                current = user_doc.to_dict()
                user_ref.update({
                    "reputation_score": current.get("reputation_score", 0) + REPUTATION_REWARD,
                    "peer_credits":     current.get("peer_credits", 0) + CREDITS_REWARD,
                })
            else:
                # Initialise if missing (shouldn't happen, but be safe)
                user_ref.set({
                    "reputation_score": REPUTATION_REWARD,
                    "peer_credits":     CREDITS_REWARD,
                }, merge=True)

    except Exception as exc:
        raise HTTPException(500, detail=f"Failed to complete session: {exc}")

    return {
        "message": "Session complete! Both users awarded.",
        "reputation_awarded": REPUTATION_REWARD,
        "credits_awarded":    CREDITS_REWARD,
    }


# ══════════════════════════════════════════════════════════
#  WebSocket — WebRTC Signaling Server
#
#  Protocol:
#    Client → Server: JSON { type, payload }
#    Server → Other peer: same JSON forwarded verbatim
#
#  Message types:
#    "join"        — first message sent by joining client (no forwarding)
#    "offer"       — SDP offer from Initiator  → Responder
#    "answer"      — SDP answer from Responder → Initiator
#    "ice"         — ICE candidate exchange (both directions)
#    "hand-raise"  — hand raise notification
#    "reaction"    — emoji reaction broadcast
#    "complete"    — session complete signal
# ══════════════════════════════════════════════════════════

@app.websocket("/ws/signal/{room_id}")
async def websocket_signaling(websocket: WebSocket, room_id: str):
    await websocket.accept()

    # Add to room (max 2 peers)
    if room_id not in rooms:
        rooms[room_id] = []

    if len(rooms[room_id]) >= 2:
        await websocket.send_text(json.dumps({
            "type": "error",
            "payload": {"message": "Room is full (max 2 participants)."}
        }))
        await websocket.close()
        return

    rooms[room_id].append(websocket)
    peer_index = len(rooms[room_id]) - 1  # 0 = host, 1 = joiner

    # Notify the joining peer of its role
    await websocket.send_text(json.dumps({
        "type":    "role",
        "payload": {
            "role":       "initiator" if peer_index == 0 else "responder",
            "peerCount":  len(rooms[room_id]),
        }
    }))

    # If a second peer just joined, notify the first peer
    if peer_index == 1:
        host_ws = rooms[room_id][0]
        try:
            await host_ws.send_text(json.dumps({
                "type":    "peer-joined",
                "payload": {"peerCount": 2}
            }))
        except Exception:
            pass

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            # Broadcast to the OTHER peer in the same room
            peers = rooms.get(room_id, [])
            for peer_ws in peers:
                if peer_ws is not websocket:
                    try:
                        await peer_ws.send_text(raw)
                    except Exception:
                        pass

    except WebSocketDisconnect:
        # Clean up room entry
        if room_id in rooms:
            rooms[room_id] = [ws for ws in rooms[room_id] if ws is not websocket]
            if not rooms[room_id]:
                del rooms[room_id]
            else:
                # Notify remaining peer
                remaining = rooms[room_id][0]
                try:
                    await remaining.send_text(json.dumps({
                        "type":    "peer-left",
                        "payload": {"message": "Your peer has disconnected."}
                    }))
                except Exception:
                    pass
    except Exception:
        # Silently handle other errors
        if room_id in rooms:
            rooms[room_id] = [ws for ws in rooms[room_id] if ws is not websocket]
            if not rooms[room_id]:
                del rooms[room_id]
