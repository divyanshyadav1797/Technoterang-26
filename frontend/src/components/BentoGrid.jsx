import { motion } from 'framer-motion';
import LiveRequestsFeed from './LiveRequestsFeed';
import NextSessionTimer from './NextSessionTimer';
import WalletCard from './WalletCard';
import LeaderboardCard from './LeaderboardCard';
import Ballpit from '../component/Ballpit';

export default function BentoGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-12 gap-6 h-[800px] max-h-[85vh]"
    >
      {/* Large Tile: Live Requests */}
      <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 row-span-2 h-full">
        <LiveRequestsFeed />
      </motion.div>

      {/* Medium Tile: Next Session */}
      <motion.div variants={itemVariants} className="col-span-12 md:col-span-6 lg:col-span-4 h-full min-h-[250px]">
        <NextSessionTimer />
      </motion.div>

      {/* Small Tile: Wallet */}
      <motion.div variants={itemVariants} className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2 h-full min-h-[250px]">
        <WalletCard />
      </motion.div>

      {/* Small Tile: Leaderboard */}
      <motion.div variants={itemVariants} className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2 h-full min-h-[250px]">
        <LeaderboardCard />
      </motion.div>
      
      {/* Hero / Aesthetic Tile utilizing the Ballpit component */}
      <motion.div variants={itemVariants} className="col-span-12 lg:col-span-12 h-64 mt-6 glass-card overflow-hidden relative border-none bg-navy">
        <div className="absolute inset-0 z-0">
            <Ballpit count={100} gravity={0.5} friction={0.99} colors={[0xe4eddb, 0xf5f0e6, 0x1d3379]} />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 bg-navy/40 backdrop-blur-[2px]">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">Learn anything. Together.</h2>
          <p className="text-white/80 font-medium">Join the micro-tutoring revolution</p>
        </div>
      </motion.div>

    </motion.div>
  );
}
