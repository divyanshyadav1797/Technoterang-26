import { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import BentoGrid from './components/BentoGrid';
import RequestHelpModal from './components/RequestHelpModal';
import MicroSessionView from './components/MicroSessionView';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(false);

  return (
    <>
      <DashboardLayout>
        <AnimatePresence mode="wait">
          {!activeSession ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-navy mb-2">Welcome back, Aryan</h1>
                  <p className="text-navy/60">Ready to learn or earn today?</p>
                </div>
                
                {/* Temporary button to demo active session view */}
                <button 
                  onClick={() => setActiveSession(true)}
                  className="px-4 py-2 bg-sage text-navy rounded-xl text-sm font-bold hover:bg-sage-dark transition-colors"
                >
                  Demo Session View
                </button>
              </div>
              
              <BentoGrid />
            </motion.div>
          ) : (
            <MicroSessionView 
              key="session" 
              onLeave={() => setActiveSession(false)} 
            />
          )}
        </AnimatePresence>
      </DashboardLayout>

      {/* Floating Action Button */}
      {!activeSession && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-navy text-primary rounded-full shadow-xl shadow-navy/30 flex items-center justify-center hover:bg-navy/90 transition-colors z-50 group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </motion.button>
      )}

      <RequestHelpModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

export default App;
