import { motion } from 'framer-motion';
import { Video, Mic, MicOff, PhoneOff, MonitorUp, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

export default function MicroSessionView({ onLeave }) {
  const [micOn, setMicOn] = useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="absolute inset-4 z-[60] bg-navy rounded-3xl overflow-hidden flex shadow-2xl"
    >
      {/* Main Video/Whiteboard Area */}
      <div className="flex-1 flex flex-col relative bg-black/20">
        <div className="p-6 flex justify-between items-center absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-navy/80 to-transparent">
          <div>
            <h2 className="text-white font-bold text-xl drop-shadow-md">Advanced UI Design</h2>
            <div className="flex items-center gap-2 text-white/70 text-sm mt-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live • 14:32 elapsed
            </div>
          </div>
          <div className="bg-navy/40 backdrop-blur-md px-4 py-2 rounded-xl text-white font-mono text-sm border border-white/10">
            Bounty: 150 ◈
          </div>
        </div>

        {/* Video Placeholder */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="w-64 h-64 bg-sage/10 rounded-full blur-3xl absolute"></div>
          <div className="text-center relative z-10">
            <div className="w-24 h-24 mx-auto bg-sage/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl mb-4">
              <Video size={40} className="text-white/50" />
            </div>
            <p className="text-white/50 font-medium">Waiting for other participant to turn on camera...</p>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 flex justify-center items-center gap-4 absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-navy/80 to-transparent">
          <button 
            onClick={() => setMicOn(!micOn)}
            className={`p-4 rounded-2xl backdrop-blur-md border transition-all ${micOn ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'}`}
          >
            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          
          <button className="p-4 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all">
            <MonitorUp size={24} />
          </button>
          
          <button 
            onClick={onLeave}
            className="p-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 px-8 font-bold"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>

      {/* Side Chat Panel */}
      <div className="w-80 bg-white/5 border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-2 text-white">
          <MessageSquare size={18} />
          <h3 className="font-bold">Session Chat</h3>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          <div className="text-center text-xs text-white/30 my-2">Session started</div>
          
          <div className="flex flex-col gap-1 items-start">
            <div className="bg-white/10 text-white/90 text-sm px-4 py-2 rounded-2xl rounded-tl-none inline-block">
              Hey! I'm struggling with the framer motion variants.
            </div>
            <span className="text-[10px] text-white/30 ml-1">Jane • 12:01 PM</span>
          </div>
          
          <div className="flex flex-col gap-1 items-end">
            <div className="bg-sage/20 text-sage-light text-sm px-4 py-2 rounded-2xl rounded-tr-none inline-block">
              Sure thing, I can help with that. Are you sharing your screen?
            </div>
            <span className="text-[10px] text-white/30 mr-1">You • 12:02 PM</span>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-sage/40 transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
