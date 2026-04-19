// SessionRoom.jsx — PeerTutor Live Session Nexus
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SimplePeer from 'simple-peer';
import {
  collection, addDoc, onSnapshot, query, orderBy, doc,
  updateDoc, serverTimestamp, getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare,
  Pen, Hand, CheckCircle, X, BookOpen,
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';
const WS_BASE  = 'ws://localhost:8000';

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
    return { x: touch.clientX - r.left, y: touch.clientY - r.top };
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
  const peerRef        = useRef(null);
  const wsRef          = useRef(null);

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
  const [engagement, setEngagement]     = useState(87);
  const [handRaised, setHandRaised]     = useState(false);
  const [reactions, setReactions]       = useState([]);
  const [bothComplete, setBothComplete] = useState({ host: false, joiner: false });
  const [xpToast, setXpToast]           = useState(null);
  const [peerLeft, setPeerLeft]         = useState(false);

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

  // ── Engagement meter simulation ───────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setEngagement(prev => Math.max(20, Math.min(100, prev + (Math.random() > 0.5 ? 5 : -7))));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // ── WebRTC + Signaling ────────────────────────────────────────────────────
  useEffect(() => {
    let destroyed = false;

    async function start() {
      // Get local media
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current;
        }
      } catch (err) {
        console.warn('Camera/mic not available:', err.message);
      }

      // Connect to signaling server
      const ws = new WebSocket(`${WS_BASE}/ws/signal/${sessionId}`);
      wsRef.current = ws;

      ws.onmessage = (evt) => {
        if (destroyed) return;
        const msg = JSON.parse(evt.data);

        if (msg.type === 'role') {
          const isInitiator = msg.payload.role === 'initiator';
          setRole(msg.payload.role);
          if (msg.payload.peerCount === 2) {
            setPeerWaiting(false);
            initPeer(isInitiator, ws);
          }
        }

        if (msg.type === 'peer-joined') {
          setPeerWaiting(false);
          if (role === 'initiator' || peerRef.current === null) {
            initPeer(true, ws);
          }
        }

        if (msg.type === 'offer' || msg.type === 'answer' || msg.type === 'ice') {
          if (peerRef.current) {
            try { peerRef.current.signal(msg.payload); } catch {}
          }
        }

        if (msg.type === 'peer-left') { setPeerLeft(true); setConnected(false); }
        if (msg.type === 'hand-raise') { setHandRaised(true); setTimeout(() => setHandRaised(false), 5000); }
        if (msg.type === 'reaction')   { addReaction(msg.payload.emoji); }
        if (msg.type === 'complete')   { setBothComplete(p => ({ ...p, joiner: true })); }
      };

      ws.onerror = () => console.warn('WS error');
    }

    start();

    return () => {
      destroyed = true;
      peerRef.current?.destroy();
      wsRef.current?.close();
      localStream.current?.getTracks().forEach(t => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  function initPeer(initiator, ws) {
    if (peerRef.current) return;

    const peer = new SimplePeer({
      initiator,
      trickle:  true,
      stream:   localStream.current || undefined,
    });

    peer.on('signal', data => {
      const type = data.type === 'offer' ? 'offer' : data.type === 'answer' ? 'answer' : 'ice';
      ws.send(JSON.stringify({ type, payload: data }));
    });

    peer.on('stream', remoteStream => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setConnected(true);
    });

    peer.on('error', err => console.warn('Peer error:', err.message));
    peer.on('close', () => setConnected(false));

    peerRef.current = peer;
  }

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
    wsRef.current?.send(JSON.stringify({ type: 'hand-raise', payload: {} }));
    setHandRaised(true);
    setTimeout(() => setHandRaised(false), 5000);
  }

  function addReaction(emoji) {
    const id = Date.now() + Math.random();
    setReactions(r => [...r, { id, emoji }]);
  }

  function sendReaction(emoji) {
    addReaction(emoji);
    wsRef.current?.send(JSON.stringify({ type: 'reaction', payload: { emoji } }));
  }

  async function handleComplete() {
    setBothComplete(p => ({ ...p, host: true }));
    wsRef.current?.send(JSON.stringify({ type: 'complete', payload: {} }));
    try {
      const storedUser = getUser();
      await fetch(`${API_BASE}/complete-session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          uid_host:   storedUser.uid || '',
          uid_joiner: '',
        }),
      });
      setXpToast('+10 Reputation • +5 Peer Credits! 🎉');
      setTimeout(() => setXpToast(null), 5000);
    } catch {}
  }

  function handleLeave() {
    peerRef.current?.destroy();
    wsRef.current?.close();
    localStream.current?.getTracks().forEach(t => t.stop());
    navigate('/profile');
  }

  const engagementColor = engagement > 70 ? '#34d399' : engagement > 40 ? '#FFCA3A' : '#f87171';

  return (
    <div className="nexus-root">
      {/* ── Cosmos Background ─────────────────────────────────────────────── */}
      <div className="nexus-bg" />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="nexus-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FFCA3A] flex items-center justify-center">
            <BookOpen size={16} className="text-[#09264A]" />
          </div>
          <span className="font-extrabold text-[#e8f4fd] text-lg">PeerTutor</span>
          <span className="nexus-live-badge">
            <span className="nexus-live-dot" /> LIVE
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#94a9bd]">
          {sessionData?.title || 'Session Room'} · {sessionId.slice(0, 8)}…
        </div>
        <button onClick={handleLeave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold hover:bg-red-500/30 transition-all">
          <Phone size={14} /> Leave
        </button>
      </header>

      {/* ── Notifications ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {handRaised && (
          <motion.div initial={{ y:-60,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:-60,opacity:0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-[#FFCA3A]/20 border border-[#FFCA3A]/50 text-[#FFCA3A] font-bold text-sm backdrop-blur-xl">
            ✋ Your peer raised their hand!
          </motion.div>
        )}
        {peerLeft && (
          <motion.div initial={{ y:-60,opacity:0 }} animate={{ y:0,opacity:1 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-sm backdrop-blur-xl">
            ⚠️ Your peer disconnected
          </motion.div>
        )}
        {xpToast && (
          <motion.div initial={{ scale:0.7,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.7,opacity:0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl bg-[#34d399]/20 border border-[#34d399]/50 text-[#34d399] font-extrabold text-base backdrop-blur-xl">
            {xpToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ───────────────────────────────────────────────────── */}
      <div className="nexus-main">

        {/* ── Video Column ──────────────────────────────────────────────── */}
        <div className="nexus-video-col">

          {/* Tutor Video */}
          <div className="nexus-video-frame">
            <div className="nexus-video-label">🏫 Tutor</div>
            <video ref={remoteVideoRef} autoPlay playsInline
              className="nexus-video" style={{ transform:'scaleX(-1)' }} />
            {!connected && (
              <div className="nexus-video-placeholder">
                {peerWaiting ? (
                  <div className="text-center">
                    <motion.div animate={{ scale:[1,1.15,1] }} transition={{ duration:2,repeat:Infinity }}
                      className="w-16 h-16 rounded-full bg-[#FFCA3A]/20 border-2 border-[#FFCA3A]/50 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">⏳</span>
                    </motion.div>
                    <p className="text-[#94a9bd] text-sm">Waiting for peer…</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <motion.div animate={{ rotate:360 }} transition={{ duration:1.5,repeat:Infinity,ease:'linear' }}
                      className="w-10 h-10 border-2 border-[#FFCA3A] border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-[#94a9bd] text-xs">Connecting…</p>
                  </div>
                )}
              </div>
            )}
            {/* AI Captions */}
            <AnimatePresence mode="wait">
              <motion.div key={caption}
                initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
                className="nexus-caption-bar">
                🤖 {caption}
              </motion.div>
            </AnimatePresence>
            {/* Floating reactions */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <AnimatePresence>
                {reactions.map(r => (
                  <FloatingReaction key={r.id} emoji={r.emoji} id={r.id}
                    onDone={() => setReactions(p => p.filter(x => x.id !== r.id))} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Local Video */}
          <div className="nexus-video-frame nexus-video-local">
            <div className="nexus-video-label">🎓 You</div>
            <video ref={localVideoRef} autoPlay playsInline muted
              className="nexus-video" style={{ transform:'scaleX(-1)' }} />
            {camOff && (
              <div className="nexus-video-placeholder">
                <VideoOff size={28} className="text-[#94a9bd]" />
              </div>
            )}
          </div>

          {/* Engagement Meter */}
          <div className="nexus-engagement">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-widest text-[#669BBC] font-bold">
                🧠 AI Focus Monitor
              </span>
              <span className="text-xs font-extrabold" style={{ color: engagementColor }}>
                {engagement}%
              </span>
            </div>
            <div className="nexus-engagement-track">
              <motion.div className="nexus-engagement-fill"
                animate={{ width: `${engagement}%`, backgroundColor: engagementColor }}
                transition={{ duration: 0.8 }} />
            </div>
            {engagement < 40 && (
              <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="text-[10px] text-red-400 mt-1 font-semibold">
                ⚠️ Learner seems distracted — consider pausing!
              </motion.p>
            )}
          </div>

          {/* Controls */}
          <div className="nexus-controls">
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
              onClick={toggleMute}
              className={`nexus-ctrl-btn ${muted ? 'nexus-ctrl-danger' : ''}`}>
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </motion.button>
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
              onClick={toggleCam}
              className={`nexus-ctrl-btn ${camOff ? 'nexus-ctrl-danger' : ''}`}>
              {camOff ? <VideoOff size={18} /> : <Video size={18} />}
            </motion.button>
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
              onClick={() => setShowChat(c => !c)}
              className={`nexus-ctrl-btn ${showChat ? 'nexus-ctrl-active' : ''}`}>
              <MessageSquare size={18} />
            </motion.button>
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
              onClick={() => setShowBoard(b => !b)}
              className={`nexus-ctrl-btn ${showBoard ? 'nexus-ctrl-active' : ''}`}>
              <Pen size={18} />
            </motion.button>
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
              onClick={raiseHand}
              className="nexus-ctrl-btn">
              <Hand size={18} />
            </motion.button>
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={handleComplete}
              className="nexus-complete-btn">
              <CheckCircle size={16} /> Complete Session
            </motion.button>
          </div>

          {/* Emoji Reactions */}
          <div className="nexus-emoji-row">
            {REACTIONS.map(e => (
              <motion.button key={e} whileHover={{ scale:1.3 }} whileTap={{ scale:0.8 }}
                onClick={() => sendReaction(e)}
                className="text-2xl cursor-pointer select-none bg-white/5 rounded-xl p-2 hover:bg-white/10 transition-all">
                {e}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Sidebar (Chat / Whiteboard) ────────────────────────────────── */}
        <AnimatePresence>
          {showChat && (
            <ChatPanel key="chat" sessionId={sessionId} user={user}
              onClose={() => setShowChat(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* ── Whiteboard Panel (full-width below) ───────────────────────────── */}
      <AnimatePresence>
        {showBoard && (
          <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:40 }}
            className="nexus-board-section">
            <Whiteboard sessionId={sessionId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
