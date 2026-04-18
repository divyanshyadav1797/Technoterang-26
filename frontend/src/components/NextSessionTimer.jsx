import { motion } from 'framer-motion';
import { Video, Calendar } from 'lucide-react';

export default function NextSessionTimer() {
  return (
    <div className="glass-card p-6 h-full flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-navy to-navy/90 text-primary">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-sm font-semibold mb-1">
            <Calendar size={16} />
            <span>Upcoming Session</span>
          </div>
          <h3 className="text-xl font-bold">Advanced UI Design</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
          <span className="font-bold text-sm">JS</span>
        </div>
      </div>

      <div className="relative z-10 mt-6">
        <div className="flex gap-4">
          {['00', '14', '32'].map((time, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                <span className="font-mono text-3xl font-bold tracking-tighter">{time}</span>
              </div>
              <span className="text-[10px] text-white/50 uppercase tracking-widest mt-2 font-semibold">
                {['Hours', 'Mins', 'Secs'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex justify-between items-center">
        <div>
          <p className="text-sm text-white/70">Mentee: <span className="text-white font-medium">Jane Doe</span></p>
        </div>
        <button className="flex items-center gap-2 bg-white text-navy px-4 py-2 rounded-xl font-bold text-sm hover:bg-white/90 transition-colors shadow-lg shadow-white/10">
          <Video size={16} />
          Join Room
        </button>
      </div>
    </div>
  );
}
