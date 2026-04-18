import { motion } from 'framer-motion';
import { PlayCircle, Clock } from 'lucide-react';

const mockRequests = [
  { id: 1, subject: 'React Hooks', desc: 'Need help understanding useEffect dependencies.', bounty: 50, time: '2m ago', tags: ['Frontend', 'React'] },
  { id: 2, subject: 'Calculus 101', desc: 'Stuck on derivatives chain rule. Quick 15m session?', bounty: 100, time: '5m ago', tags: ['Math', 'Calculus'] },
  { id: 3, subject: 'Python Pandas', desc: 'Merging dataframes is throwing a key error.', bounty: 75, time: '12m ago', tags: ['Data Science', 'Python'] },
  { id: 4, subject: 'Figma Auto-layout', desc: 'My cards are squishing when resizing.', bounty: 40, time: '20m ago', tags: ['Design', 'Figma'] },
];

export default function LiveRequestsFeed() {
  return (
    <div className="glass-card h-full p-6 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-sage/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-navy">Live Help Requests</h2>
          <p className="text-navy/60 text-sm mt-1">Jump in and start earning credits</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full text-red-600 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
        {mockRequests.map((req, i) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            className="group p-5 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-navy">{req.subject}</h3>
              <div className="font-mono font-bold text-navy bg-white/80 px-3 py-1 rounded-lg border border-white/50">
                {req.bounty} ◈
              </div>
            </div>
            
            <p className="text-navy/70 text-sm mb-4 line-clamp-2">
              {req.desc}
            </p>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {req.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-navy/5 text-navy/60 font-semibold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-xs text-navy/40 font-medium">
                  <Clock size={12} /> {req.time}
                </span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-navy text-primary p-2 rounded-full shadow-lg hover:scale-105 active:scale-95">
                  <PlayCircle size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
