import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useState } from 'react';

export default function RequestHelpModal({ isOpen, onClose }) {
  const [topic, setTopic] = useState('');
  const [desc, setDesc] = useState('');
  const [bounty, setBounty] = useState(50);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-primary rounded-3xl shadow-2xl z-[101] overflow-hidden border border-white"
          >
            <div className="px-6 py-4 border-b border-navy/10 flex justify-between items-center bg-white/50">
              <h2 className="text-xl font-bold text-navy">Request Help</h2>
              <button onClick={onClose} className="p-2 hover:bg-navy/5 rounded-full text-navy/60 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy/70 mb-2">Subject / Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. React useEffect hook" 
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-white focus:outline-none focus:border-navy/30 focus:ring-2 focus:ring-navy/10 transition-all text-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy/70 mb-2">Description</label>
                <textarea 
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe where you're stuck..." 
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-white focus:outline-none focus:border-navy/30 focus:ring-2 focus:ring-navy/10 transition-all text-navy resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy/70 mb-2">Bounty (Credits)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="10" 
                    max="500" 
                    step="10"
                    value={bounty}
                    onChange={(e) => setBounty(Number(e.target.value))}
                    className="flex-1 accent-navy"
                  />
                  <div className="font-mono font-bold text-navy bg-navy/5 px-4 py-2 rounded-xl">
                    {bounty} ◈
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-4 mt-4 bg-navy text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-navy/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-navy/20"
              >
                <Send size={18} />
                Post Request
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
