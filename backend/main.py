# ─────────────────────────────────────────────────────────────────
#  PeerTutor — FastAPI Backend  |  main.py
#
#  Folder layout:
#    backend/
#    ├── main.py
#    ├── requirements.txt
#    ├── .env                       ← create from .env.example
#    └── peer-2-peer-data-firebase-adminsdk-fbsvc-131558db09.json
#
#  Run:
#    uvicorn main:app --reload --port 8000
#
#  API Docs: http://localhost:8000/docs
# ─────────────────────────────────────────────────────────────────

import os
import requests as http_requests
from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials, firestore

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv

# ── Load .env ─────────────────────────────────────────────
load_dotenv()

# Firebase Web API Key — needed to verify passwords via REST API.
# Get this from: Firebase Console → Project Settings → General → Web API Key
FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY", "")

# ── Firebase Admin Initialisation ─────────────────────────
SERVICE_ACCOUNT_PATH = (
    Path(__file__).parent
    / "peer-2-peer-data-firebase-adminsdk-fbsvc-5f70a997c7.json"
)

if not firebase_admin._apps:
    cred = credentials.Certificate(str(SERVICE_ACCOUNT_PATH))
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ── FastAPI App ────────────────────────────────────────────
app = FastAPI(
    title="PeerTutor API",
    description="Backend for the PeerTutor P2P Micro-Tutoring Platform",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════
#  Pydantic Models
# ══════════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    full_name: str  = Field(..., min_length=2, max_length=100, example="Jane Doe")
    email:     EmailStr = Field(..., example="jane@example.com")
    password:  str  = Field(..., min_length=6, example="supersecret123")


class LoginRequest(BaseModel):
    email:    EmailStr = Field(..., example="jane@example.com")
    password: str      = Field(..., min_length=1, example="supersecret123")


class UserProfile(BaseModel):
    uid:        str
    full_name:  str
    email:      str
    role:       str
    created_at: str | None = None


class RegisterResponse(BaseModel):
    message: str
    user:    UserProfile


class LoginResponse(BaseModel):
    message:  str
    id_token: str          # Firebase ID token — store in frontend
    user:     UserProfile


# ══════════════════════════════════════════════════════════
#  Helper: sign in via Firebase Auth REST API
# ══════════════════════════════════════════════════════════

def firebase_sign_in(email: str, password: str) -> dict:
    """
    Uses Firebase Auth REST API to sign in with email + password.
    Returns the raw Firebase response dict (contains idToken, localId, etc.)

    Requires FIREBASE_WEB_API_KEY in .env
    Get it from: Firebase Console → Project Settings → General → Web API Key
    """
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

    return resp.json()   # keys: idToken, localId, email, refreshToken, expiresIn


# ══════════════════════════════════════════════════════════
#  Endpoints
# ══════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "PeerTutor API v1.0"}


# ── POST /register ─────────────────────────────────────────
@app.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Auth"],
)
async def register(payload: RegisterRequest):
    """
    1. Creates user in Firebase Auth.
    2. Stores profile in Firestore `users` collection.
    3. Returns the saved profile.
    """
    # Create Firebase Auth user
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

    # Build and save Firestore document
    user_doc = {
        "uid":        fb_user.uid,
        "full_name":  payload.full_name,
        "email":      payload.email,
        "role":       "student",
        "created_at": firestore.SERVER_TIMESTAMP,
    }

    try:
        db.collection("users").document(fb_user.uid).set(user_doc)
    except Exception as exc:
        auth.delete_user(fb_user.uid)   # rollback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Firestore write failed: {exc}",
        )

    # Fetch back so we get a serialisable version (SERVER_TIMESTAMP → None ok for now)
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


# ── POST /login ────────────────────────────────────────────
@app.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    tags=["Auth"],
)
async def login(payload: LoginRequest):
    """
    1. Verifies email + password via Firebase Auth REST API.
    2. Fetches the full profile from Firestore.
    3. Returns the profile + Firebase ID token.
    """
    # Step 1 — verify credentials
    firebase_resp = firebase_sign_in(payload.email, payload.password)
    uid      = firebase_resp["localId"]
    id_token = firebase_resp["idToken"]

    # Step 2 — fetch profile from Firestore
    try:
        doc = db.collection("users").document(uid).get()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Firestore read failed: {exc}",
        )

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please register first.",
        )

    data = doc.to_dict()

    # Serialise Firestore timestamp to ISO string (if present)
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
    )

    return LoginResponse(
        message=f"Welcome back, {profile.full_name}!",
        id_token=id_token,
        user=profile,
    )


# ── GET /users/{uid} ───────────────────────────────────────
@app.get(
    "/users/{uid}",
    response_model=UserProfile,
    tags=["Users"],
)
async def get_user(uid: str):
    """
    Fetch any user profile by UID from Firestore.
    Useful for the dashboard page after login.
    """
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
    )
