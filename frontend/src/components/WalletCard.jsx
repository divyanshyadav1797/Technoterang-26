import { TrendingUp } from 'lucide-react';

export default function WalletCard() {
  return (
    <div className="glass-card p-6 h-full flex flex-col justify-between relative overflow-hidden bg-white/60">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-navy/60 mb-1">Knowledge Credits</h3>
          <div className="text-3xl font-mono font-bold text-navy">2,450 <span className="text-lg text-navy/50">◈</span></div>
        </div>
        <div className="p-2 bg-sage/30 rounded-xl text-green-600">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-semibold text-navy/50 uppercase tracking-wider">This Week</span>
          <span className="text-sm font-bold text-green-600">+350 ◈</span>
        </div>
        
        {/* Simple CSS Sparkline */}
        <div className="h-10 w-full flex items-end gap-1">
          {[40, 60, 30, 80, 50, 90, 100].map((h, i) => (
            <div 
              key={i} 
              className="flex-1 bg-navy/20 rounded-t-sm transition-all duration-500 hover:bg-navy"
              style={{ height: `${h}%` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
