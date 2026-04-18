import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary flex overflow-hidden relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <motion.main 
        animate={{ 
          marginLeft: isSidebarOpen ? '260px' : '100px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 px-8 py-4 h-screen overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <Header />
          <div className="flex-1 pb-20">
            {children}
          </div>
        </div>
      </motion.main>
    </div>
  );
}
