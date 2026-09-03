import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 py-4 w-full h-20">
      <div className="flex-1"></div>
      <div className="text-2xl font-black tracking-widest text-slate-900 font-manrope antialiased">
        HAVEN : AI
      </div>
      <div className="flex-1 flex justify-end">
        <div className="flex items-center gap-2 cursor-pointer active:opacity-70 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          <span className="font-label-md text-slate-900">Mode</span>
          <span className="material-symbols-outlined text-slate-500">expand_more</span>
        </div>
      </div>
    </header>
  );
}

export function Sidebar() {
  const navItems = [
    { icon: 'add_comment', label: 'New Chat', to: '/', exact: true },
    { icon: 'notifications', label: 'Reminders', to: '/reminders' },
    { icon: 'menu_book', label: 'Notebook', to: '/notebook' },
    { icon: 'edit_note', label: 'Journal', to: '/journal' },
    { icon: 'history', label: 'Previous Chats', to: '/previous-chats' },
  ];

  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 border-r border-slate-200 bg-white flex flex-col gap-4 p-6 font-manrope text-sm font-medium">
      <div className="flex items-center gap-3 mb-8">
        <img
          alt="Haven AI avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30 shadow-lg"
          src="/haven_ai_avatar.png"
        />
        <div>
          <p className="text-slate-900 font-bold">Haven OS</p>
          <p className="text-slate-500 text-xs">System Active</p>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:translate-x-1",
                isActive
                  ? "bg-slate-50 text-slate-900 font-semibold border-r-2 border-slate-900"
                  : "text-slate-500 hover:bg-slate-50"
              )
            }
          >
            <span 
              className="material-symbols-outlined"
              style={item.label === 'Journal' ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-slate-200/50">
        <a className="flex items-center px-4 py-2 text-slate-400 hover:text-slate-900 text-[10px] tracking-widest uppercase font-semibold gap-3" href="#">
          <span className="material-symbols-outlined text-sm">settings</span>
          <span>Settings</span>
        </a>
      </div>
    </aside>
  );
}
