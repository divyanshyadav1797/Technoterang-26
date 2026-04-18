import { Medal, CheckCircle2 } from 'lucide-react';

const mentors = [
  { id: 1, name: 'Dr. Sarah K.', subject: 'Physics', rating: 4.9, avatar: 'SK' },
  { id: 2, name: 'Mike Chen', subject: 'React', rating: 4.8, avatar: 'MC' },
  { id: 3, name: 'Emma W.', subject: 'Calculus', rating: 4.8, avatar: 'EW' },
];

export default function LeaderboardCard() {
  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Medal className="text-yellow-500" size={24} />
        <h3 className="text-lg font-bold text-navy">Top Mentors</h3>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {mentors.map((mentor, i) => (
          <div key={mentor.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-white/60 hover:bg-white transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-dark to-sage flex items-center justify-center font-bold text-navy shadow-sm relative">
                {mentor.avatar}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                  <CheckCircle2 size={14} className="text-blue-500" />
                </div>
              </div>
              <div>
                <p className="font-bold text-sm text-navy">{mentor.name}</p>
                <p className="text-xs text-navy/60">{mentor.subject}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-mono font-bold text-sm text-navy">{mentor.rating}</div>
              <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Top {i + 1}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
