import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar, Sidebar } from './Navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Sidebar />
      <main className="ml-64 mt-20 p-8 md:p-12 lg:p-16 min-h-[calc(100vh-5rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Ambient Visual Elements */}
      <div className="fixed bottom-0 right-0 -z-10 p-16 opacity-20 pointer-events-none">
        <div className="w-64 h-64 bg-slate-200 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
