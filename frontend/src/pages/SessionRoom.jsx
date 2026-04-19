// SessionRoom.jsx — PeerTutor Live Session Nexus
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, addDoc, onSnapshot, query, orderBy, doc,
  serverTimestamp, getDoc, setDoc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare,
  Pen, Hand, CheckCircle, X, BookOpen, Flag, Sun, Moon, Key,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
  ],
};

const REACTIONS = ['🔥','👏','💡','🚀','⭐','🎉'];

const AI_CAPTIONS = [
  'Let me explain this concept step by step…',
  'Notice how the algorithm handles edge cases here.',
  'This is a key pattern you will see repeatedly.',
  'Any questions so far? Let me know in chat.',
  'Let\'s break this down into smaller pieces.',
  'The time complexity here is O(n log n).',
  'Great, now let\'s move to the next section.',
];

function getUser() {
  try { return JSON.parse(localStorage.getItem('peertutor_user') || '{}'); }
  catch { return {}; }
}

// ── Floating emoji reaction ─────────────────────────────────────────────────
function FloatingReaction({ emoji, id, onDone }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -180, scale: 1.6 }}
      transition={{ duration: 2.2, ease: 'easeOut' }}
      onAnimationComplete={onDone}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 text-4xl pointer-events-none z-50 select-none"
    >
      {emoji}
    </motion.div>
  );
}

// ── Collaborative Whiteboard ────────────────────────────────────────────────
function Whiteboard({ sessionId }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastPos   = useRef(null);
  const [color, setColor] = useState('#FFCA3A');
  const [size, setSize]   = useState(3);

  // Listen for remote strokes
  useEffect(() => {
    const q = query(
      collection(db, 'sessions', sessionId, 'canvas_events'),
      orderBy('timestamp', 'asc'),
    );
    const unsub = onSnapshot(q, snap => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      snap.docChanges().forEach(change => {
        if (change.type !== 'added') return;
        const d = change.doc.data();
        if (d.type === 'clear') { ctx.clearRect(0,0,canvas.width,canvas.height); return; }
        ctx.beginPath();
        ctx.moveTo(d.x0, d.y0);
        ctx.lineTo(d.x1, d.y1);
        ctx.strokeStyle = d.color;
        ctx.lineWidth   = d.width;
        ctx.lineCap     = 'round';
        ctx.stroke();
      });
    });
    return () => unsub();
  }, [sessionId]);

  function getPos(e, canvas) {
    const r = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] ?? e;
    // Scale coordinates to match internal canvas resolution
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    return { x: (touch.clientX - r.left) * scaleX, y: (touch.clientY - r.top) * scaleY };
  }

  function startDraw(e) {
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  }

  async function draw(e) {
    if (!drawing.current) return;
    const pos = getPos(e, canvasRef.current);
    const lp  = lastPos.current;
    // Draw locally immediately
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(lp.x, lp.y); ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.stroke();
    // Sync to Firestore
    try {
      await addDoc(collection(db, 'sessions', sessionId, 'canvas_events'), {
        type: 'draw', x0: lp.x, y0: lp.y, x1: pos.x, y1: pos.y,
        color, width: size, timestamp: serverTimestamp(),
      });
    } catch {}
    lastPos.current = pos;
  }

  function stopDraw() { drawing.current = false; lastPos.current = null; }

  async function clearCanvas() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
    try {
      await addDoc(collection(db, 'sessions', sessionId, 'canvas_events'), {
        type: 'clear', timestamp: serverTimestamp(),
      });
    } catch {}
  }

  return (
    <div className="nexus-whiteboard-wrap">
      <div className="nexus-wb-toolbar">
        <span className="nexus-panel-label">🎨 Shared Canvas</span>
        <div className="flex items-center gap-2">
          {['#FFCA3A','#669BBC','#34d399','#f87171','#ffffff'].map(c => (
            <button key={c} onClick={() => setColor(c)}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125"
              style={{ background: c, borderColor: color===c ? '#fff' : 'transparent' }} />
          ))}
          <input type="range" min={1} max={16} value={size}
            onChange={e => setSize(Number(e.target.value))}
            className="w-20 accent-[#FFCA3A]" />
          <button onClick={clearCanvas}
            className="text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
            Clear
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef} width={800} height={420}
        className="nexus-canvas"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
      />
    </div>
  );
}

// ── Chat Sidebar ────────────────────────────────────────────────────────────
function ChatPanel({ sessionId, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const bottomRef               = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'sessions', sessionId, 'messages'),
      orderBy('timestamp', 'asc'),
    );
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [sessionId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, 'sessions', sessionId, 'messages'), {
        uid: user.uid || 'anon', displayName: user.full_name || 'Peer',
        text: text.trim(), timestamp: serverTimestamp(),
      });
    } catch {}
    setText('');
  }

  return (
    <motion.div initial={{ x: 340 }} animate={{ x: 0 }} exit={{ x: 340 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="nexus-chat-panel">
      <div className="nexus-chat-header">
        <span className="nexus-panel-label flex items-center gap-2">
          <MessageSquare size={14} /> Chat Cosmos
        </span>
        <button onClick={onClose} className="text-[#94a9bd] hover:text-white"><X size={16} /></button>
      </div>
      <div className="nexus-chat-messages">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === messages.length-1 ? 0 : 0 }}
              className={`nexus-chat-msg ${m.uid === (user.uid||'anon') ? 'nexus-chat-mine' : 'nexus-chat-theirs'}`}>
              <span className="nexus-chat-name">{m.displayName}</span>
              <span className="nexus-chat-text">{m.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="nexus-chat-form">
        <input value={text} onChange={e => setText(e.target.value)}
          placeholder="Send a message…" className="nexus-chat-input" />
        <button type="submit" className="nexus-chat-send">→</button>
      </form>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Main SessionRoom
// ═══════════════════════════════════════════════════════════════════════════
export default function SessionRoom() {
  const { sessionId } = useParams();
  const navigate      = useNavigate();
  const user          = getUser();

  // ── Refs ──────────────────────────────────────────────────────────────────
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStream    = useRef(null);
  const pcRef          = useRef(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [sessionData, setSessionData]     = useState(null);
  const [role, setRole]                   = useState(null); // 'initiator' | 'responder'
  const [connected, setConnected]         = useState(false);
  const [peerWaiting, setPeerWaiting]     = useState(true);

  const [muted, setMuted]       = useState(false);
  const [camOff, setCamOff]     = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBoard, setShowBoard] = useState(false);

  const [caption, setCaption]           = useState('');
  const [handRaised, setHandRaised]     = useState(false);
  const [reactions, setReactions]       = useState([]);
  const [xpToast, setXpToast]           = useState(null);
  const [peerLeft, setPeerLeft]         = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [lightTheme, setLightTheme]     = useState(false);
  const [showReport, setShowReport]     = useState(false);
  const [reportText, setReportText]     = useState('');
  const [reportSent, setReportSent]     = useState(false);
  const [elapsed, setElapsed]           = useState(0);


  // ── Load session metadata ─────────────────────────────────────────────────
  useEffect(() => {
    getDoc(doc(db, 'sessions', sessionId)).then(d => {
      if (d.exists()) setSessionData({ id: d.id, ...d.data() });
    }).catch(console.warn);
  }, [sessionId]);

  // ── AI Caption simulation ─────────────────────────────────────────────────
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setCaption(AI_CAPTIONS[i % AI_CAPTIONS.length]);
      i++;
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // ── Session timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // ── WebRTC via Firestore Signaling ────────────────────────────────────────
  useEffect(() => {
    let destroyed = false;
    const unsubs = [];

    async function start() {
      // 1. Get local media
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;
      } catch (err) {
        console.warn('Camera/mic not available:', err.message);
      }

      if (destroyed) return;

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      if (localStream.current) {
        localStream.current.getTracks().forEach(t => pc.addTrack(t, localStream.current));
      }

      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
          setConnected(true);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') setConnected(false);
      };

      // 3. Firestore signaling docs
      const callDoc      = doc(db, 'sessions', sessionId, 'rtc', 'call');
      const callerCands  = collection(db, 'sessions', sessionId, 'callerCandidates');
      const calleeCands  = collection(db, 'sessions', sessionId, 'calleeCandidates');

      const callSnap = await getDoc(callDoc);
      const isCaller = !callSnap.exists() || !callSnap.data()?.offer;

      setRole(isCaller ? 'initiator' : 'responder');

      if (isCaller) {
        // ── Caller flow ──
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) addDoc(callerCands, candidate.toJSON()).catch(() => {});
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await setDoc(callDoc, { offer: { type: offer.type, sdp: offer.sdp }, createdAt: serverTimestamp() });
        setPeerWaiting(true);

        // Listen for answer
        unsubs.push(onSnapshot(callDoc, async (snap) => {
          const data = snap.data();
          if (data?.answer && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(console.warn);
            setPeerWaiting(false);
          }
        }));

        // Listen for callee ICE candidates
        unsubs.push(onSnapshot(calleeCands, (snap) => {
          snap.docChanges().forEach(async (ch) => {
            if (ch.type === 'added') {
              await pc.addIceCandidate(new RTCIceCandidate(ch.doc.data())).catch(console.warn);
            }
          });
        }));

      } else {
        // ── Callee flow ──
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) addDoc(calleeCands, candidate.toJSON()).catch(() => {});
        };

        const offerData = callSnap.data().offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerData));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await updateDoc(callDoc, { answer: { type: answer.type, sdp: answer.sdp } });
        setPeerWaiting(false);

        // Listen for caller ICE candidates
        unsubs.push(onSnapshot(callerCands, (snap) => {
          snap.docChanges().forEach(async (ch) => {
            if (ch.type === 'added') {
              await pc.addIceCandidate(new RTCIceCandidate(ch.doc.data())).catch(console.warn);
            }
          });
        }));
      }

      // 4. Listen for Firestore events (hand-raise, reactions, peer-left)
      const eventsRef = collection(db, 'sessions', sessionId, 'events');
      const eventsQ   = query(eventsRef, orderBy('timestamp', 'asc'));
      const myUid = getUser().uid || 'anon';
      unsubs.push(onSnapshot(eventsQ, (snap) => {
        snap.docChanges().forEach((ch) => {
          if (ch.type !== 'added') return;
          const d = ch.doc.data();
          if (d.uid === myUid) return; // ignore own events
          if (d.type === 'hand-raise') { setHandRaised(true); setTimeout(() => setHandRaised(false), 5000); }
          if (d.type === 'reaction')   { addReaction(d.emoji); }
          if (d.type === 'peer-left')  { setPeerLeft(true); setConnected(false); }
        });
      }));
    }

    start();

    return () => {
      destroyed = true;
      pcRef.current?.close();
      localStream.current?.getTracks().forEach(t => t.stop());
      unsubs.forEach(u => u());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Controls ──────────────────────────────────────────────────────────────
  function toggleMute() {
    const track = localStream.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMuted(m => !m); }
  }

  function toggleCam() {
    const track = localStream.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOff(c => !c); }
  }

  function raiseHand() {
    const myUid = getUser().uid || 'anon';
    addDoc(collection(db, 'sessions', sessionId, 'events'), {
      type: 'hand-raise', uid: myUid, timestamp: serverTimestamp(),
    }).catch(() => {});
    setHandRaised(true);
    setTimeout(() => setHandRaised(false), 5000);
  }

  function addReaction(emoji) {
    const id = Date.now() + Math.random();
    setReactions(r => [...r, { id, emoji }]);
  }

  function sendReaction(emoji) {
    addReaction(emoji);
    const myUid = getUser().uid || 'anon';
    addDoc(collection(db, 'sessions', sessionId, 'events'), {
      type: 'reaction', emoji, uid: myUid, timestamp: serverTimestamp(),
    }).catch(() => {});
  }

  async function handleComplete() {
    setSessionEnded(true);
    setXpToast('+10 Reputation  +5 Peer Credits!');
    const myUid = getUser().uid || 'anon';
    addDoc(collection(db, 'sessions', sessionId, 'events'), {
      type: 'peer-left', uid: myUid, timestamp: serverTimestamp(),
    }).catch(() => {});
    pcRef.current?.close();
    localStream.current?.getTracks().forEach(t => t.stop());
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    fetch(`${API_BASE}/complete-session`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, uid_host: myUid, uid_joiner: '' }),
      signal: ctrl.signal,
    }).catch(() => {});
    setTimeout(() => navigate('/profile'), 2500);
  }

  function handleLeave() {
    const myUid = getUser().uid || 'anon';
    addDoc(collection(db, 'sessions', sessionId, 'events'), {
      type: 'peer-left', uid: myUid, timestamp: serverTimestamp(),
    }).catch(() => {});
    pcRef.current?.close();
    localStream.current?.getTracks().forEach(t => t.stop());
    navigate('/profile');
  }

  async function submitReport() {
    if (!reportText.trim()) return;
    try {
      await addDoc(collection(db, 'reports'), {
        sessionId, reportedBy: user.uid || 'anon',
        reporterName: user.full_name || 'Anonymous',
        reason: reportText.trim(), timestamp: serverTimestamp(),
      });
      setReportSent(true);
      setTimeout(() => { setShowReport(false); setReportSent(false); setReportText(''); }, 2000);
    } catch {}
  }

  const timerStr = `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;

  const T = lightTheme
    ? { bg:'#f8fafc', card:'rgba(0,0,0,0.04)', text:'#1e293b', sub:'#64748b', border:'rgba(0,0,0,0.1)', header:'rgba(248,250,252,0.85)' }
    : { bg:'#09264A', card:'rgba(255,255,255,0.04)', text:'#e8f4fd', sub:'#94a9bd', border:'rgba(255,255,255,0.12)', header:'rgba(9,38,74,0.7)' };

  return (
    <div className={`nexus-root${lightTheme ? ' nexus-light' : ''}`} style={{ background: T.bg }}>
      <div className="nexus-bg" style={lightTheme ? { background:'#f1f5f9' } : undefined} />

      {/* Header */}
      <header className="nexus-header" style={{ background: T.header, borderColor: T.border }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FFCA3A] flex items-center justify-center">
            <BookOpen size={16} className="text-[#09264A]" />
          </div>
          <span className="font-extrabold text-lg" style={{ color: T.text }}>PeerTutor</span>
          {!sessionEnded && <span className="nexus-live-badge"><span className="nexus-live-dot" /> LIVE</span>}
          <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg" style={{ background: T.card, color: T.sub, border: `1px solid ${T.border}` }}>{timerStr}</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: T.sub }}>
          {sessionData?.title || 'Session Room'}
          {sessionData?.accessCode && (
            <span className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-lg bg-[#FFCA3A]/15 text-[#FFCA3A] border border-[#FFCA3A]/30">
              <Key size={10} /> {sessionData.accessCode}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLightTheme(t => !t)} className="nexus-ctrl-btn w-9 h-9" style={{ borderColor: T.border, background: T.card, color: T.text }}>
            {lightTheme ? <Moon size={14}/> : <Sun size={14}/>}
          </button>
          <button onClick={() => setShowReport(true)} className="nexus-ctrl-btn w-9 h-9" style={{ borderColor: T.border, background: T.card, color: '#f87171' }}>
            <Flag size={14}/>
          </button>
          <button onClick={handleLeave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold hover:bg-red-500/30 transition-all">
            <Phone size={14} /> Leave
          </button>
        </div>
      </header>

      {/* Notifications */}
      <AnimatePresence>
        {handRaised && (
          <motion.div initial={{ y:-60,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:-60,opacity:0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-[#FFCA3A]/20 border border-[#FFCA3A]/50 text-[#FFCA3A] font-bold text-sm backdrop-blur-xl">
            Your peer raised their hand!
          </motion.div>
        )}
        {peerLeft && (
          <motion.div initial={{ y:-60,opacity:0 }} animate={{ y:0,opacity:1 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-sm backdrop-blur-xl">
            Your peer disconnected
          </motion.div>
        )}
        {xpToast && (
          <motion.div initial={{ scale:0.7,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.7,opacity:0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl bg-[#34d399]/20 border border-[#34d399]/50 text-[#34d399] font-extrabold text-base backdrop-blur-xl">
            {xpToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowReport(false)} />
            <motion.div initial={{ scale:0.85,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.85,opacity:0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-2xl p-6 border flex flex-col gap-3" style={{ background: lightTheme ? '#fff' : 'rgba(9,38,74,0.97)', borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold" style={{ color: T.text }}>Report Session</h3>
                  <button onClick={() => setShowReport(false)} style={{ color: T.sub }}><X size={18}/></button>
                </div>
                {reportSent ? (
                  <p className="text-sm text-[#34d399] font-bold py-4 text-center">Report sent to admin. Thank you.</p>
                ) : (
                  <>
                    <textarea value={reportText} onChange={e => setReportText(e.target.value)}
                      placeholder="Describe the issue..." rows={4}
                      className="w-full px-3 py-2 rounded-xl text-sm resize-none outline-none"
                      style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                    <button onClick={submitReport} disabled={!reportText.trim()}
                      className="w-full py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-40">
                      Submit Report
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="nexus-main">
        <div className="nexus-video-col">

          {/* Equal Video Grid */}
          <div className="nexus-video-grid">
            {/* Remote */}
            <div className="nexus-video-frame nexus-video-equal" style={{ borderColor: T.border, background: T.card }}>
              <div className="nexus-video-label">Peer</div>
              <video ref={remoteVideoRef} autoPlay playsInline className="nexus-video" />
              {!connected && (
                <div className="nexus-video-placeholder">
                  {peerWaiting ? (
                    <div className="text-center">
                      <motion.div animate={{ scale:[1,1.15,1] }} transition={{ duration:2,repeat:Infinity }}
                        className="w-14 h-14 rounded-full bg-[#FFCA3A]/20 border-2 border-[#FFCA3A]/50 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">...</span>
                      </motion.div>
                      <p style={{ color: T.sub }} className="text-sm">Waiting for peer</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <motion.div animate={{ rotate:360 }} transition={{ duration:1.5,repeat:Infinity,ease:'linear' }}
                        className="w-8 h-8 border-2 border-[#FFCA3A] border-t-transparent rounded-full mx-auto mb-2" />
                      <p style={{ color: T.sub }} className="text-xs">Connecting...</p>
                    </div>
                  )}
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div key={caption} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }} className="nexus-caption-bar">
                  {caption}
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <AnimatePresence>
                  {reactions.map(r => (
                    <FloatingReaction key={r.id} emoji={r.emoji} id={r.id}
                      onDone={() => setReactions(p => p.filter(x => x.id !== r.id))} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Local */}
            <div className="nexus-video-frame nexus-video-equal" style={{ borderColor: T.border, background: T.card }}>
              <div className="nexus-video-label">You</div>
              <video ref={localVideoRef} autoPlay playsInline muted className="nexus-video" style={{ transform:'scaleX(-1)' }} />
              {camOff && (
                <div className="nexus-video-placeholder">
                  <VideoOff size={28} style={{ color: T.sub }} />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="nexus-controls" style={{ background: T.card, borderColor: T.border }}>
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={toggleMute}
              className={`nexus-ctrl-btn ${muted ? 'nexus-ctrl-danger' : ''}`} style={!muted ? { borderColor: T.border, color: T.text } : undefined}>
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </motion.button>
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={toggleCam}
              className={`nexus-ctrl-btn ${camOff ? 'nexus-ctrl-danger' : ''}`} style={!camOff ? { borderColor: T.border, color: T.text } : undefined}>
              {camOff ? <VideoOff size={18} /> : <Video size={18} />}
            </motion.button>
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={() => setShowChat(c => !c)}
              className={`nexus-ctrl-btn ${showChat ? 'nexus-ctrl-active' : ''}`} style={!showChat ? { borderColor: T.border, color: T.text } : undefined}>
              <MessageSquare size={18} />
            </motion.button>
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={() => setShowBoard(b => !b)}
              className={`nexus-ctrl-btn ${showBoard ? 'nexus-ctrl-active' : ''}`} style={!showBoard ? { borderColor: T.border, color: T.text } : undefined}>
              <Pen size={18} />
            </motion.button>
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={raiseHand}
              className="nexus-ctrl-btn" style={{ borderColor: T.border, color: T.text }}>
              <Hand size={18} />
            </motion.button>
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={handleComplete}
              disabled={sessionEnded} className="nexus-complete-btn" style={sessionEnded ? { opacity:0.5, pointerEvents:'none' } : undefined}>
              <CheckCircle size={16} /> {sessionEnded ? 'Session Ended' : 'End Session'}
            </motion.button>
          </div>

          {/* Emoji Reactions */}
          <div className="nexus-emoji-row">
            {REACTIONS.map(e => (
              <motion.button key={e} whileHover={{ scale:1.3 }} whileTap={{ scale:0.8 }} onClick={() => sendReaction(e)}
                className="text-2xl cursor-pointer select-none rounded-xl p-2 transition-all" style={{ background: T.card }}>
                {e}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <ChatPanel key="chat" sessionId={sessionId} user={user} onClose={() => setShowChat(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* Whiteboard */}
      <AnimatePresence>
        {showBoard && (
          <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:40 }} className="nexus-board-section">
            <Whiteboard sessionId={sessionId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
