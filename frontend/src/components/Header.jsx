import { Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="flex justify-between items-center py-4 mb-6 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 max-w-xl"
      >
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-navy/40 group-focus-within:text-navy transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 rounded-3xl bg-white/50 backdrop-blur-md border border-white/60 text-navy placeholder-navy/40 focus:outline-none focus:ring-2 focus:ring-navy/20 shadow-[0_4px_24px_0_rgba(0,0,0,0.02)] transition-all"
            placeholder="Find a Topic (e.g. React Hooks, Calc 101)..."
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-6 ml-8"
      >
        <div className="glass-card px-6 py-3 flex items-center gap-3">
          <span className="text-sm font-semibold text-navy/60">Balance</span>
          <span className="font-mono font-bold text-lg text-navy">1,250 ◈</span>
        </div>
        
        <button className="relative p-3 rounded-full bg-white/50 backdrop-blur-md border border-white/60 text-navy hover:bg-white transition-colors shadow-sm">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        </button>
      </motion.div>
    </header>
  );
}
