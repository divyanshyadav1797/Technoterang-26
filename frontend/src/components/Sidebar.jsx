import { useState } from 'react';
import { Home, Users, Wallet, User, Menu, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Users, label: 'Sessions', id: 'sessions' },
    { icon: Wallet, label: 'Wallet', id: 'wallet' },
    { icon: User, label: 'Profile', id: 'profile' },
  ];

  const [active, setActive] = useState('dashboard');

  return (
    <motion.aside
      initial={{ width: 80 }}
      animate={{ width: isOpen ? 240 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="glass-card h-full flex flex-col items-center py-6 fixed left-4 top-4 bottom-4 z-50 overflow-hidden"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 mb-8 rounded-xl hover:bg-navy/5 text-navy transition-colors self-end mr-4"
      >
        {isOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
      </button>

      <nav className="flex-1 w-full px-4 flex flex-col gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 w-full
                ${isActive 
                  ? 'bg-navy text-primary shadow-lg shadow-navy/20' 
                  : 'text-navy/70 hover:bg-sage/40 hover:text-navy'
                }`}
            >
              <Icon size={24} className="shrink-0" />
              <motion.span
                animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            </button>
          );
        })}
      </nav>

      <div className="w-full px-4 mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sage to-sand text-navy flex items-center justify-center gap-3 w-full cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center font-bold">
            A
          </div>
          <motion.div 
            animate={{ opacity: isOpen ? 1 : 0, display: isOpen ? 'block' : 'none' }}
            className="text-left flex-1 whitespace-nowrap overflow-hidden"
          >
            <p className="text-sm font-bold">Aryan</p>
            <p className="text-xs opacity-70">Pro Mentor</p>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}
