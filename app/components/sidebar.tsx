"use client";

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileInput, Shield,
  BarChart3, LogOut, Menu, X, Database
} from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState("User");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedRole = localStorage.getItem('user_role');
    if (storedName) {
      setUserName(storedName);
    } else {
      const fallback = localStorage.getItem('user_username') || localStorage.getItem('name');
      if (fallback) setUserName(fallback);
    }
    if (storedRole) setRole(storedRole.toUpperCase());
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Input Data', icon: FileInput, path: '/dashboard/input' },
    ...(role === 'ADMIN' ? [
      { name: 'Leads Control', icon: Database, path: '/dashboard/leads-control' },
      { name: 'User Control', icon: Shield, path: '/dashboard/user' },
      { name: 'Conversion Analysis', icon: BarChart3, path: '/dashboard/analysis' },
    ] : []),
  ];

  const handleSignOut = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.clear();
      window.location.replace('/login');
    } catch {
      localStorage.clear();
      window.location.replace('/login');
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#111318] text-white border border-white/10 rounded-md shadow-lg"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside className={`
        w-[220px] bg-[#111318] flex flex-col h-screen fixed left-0 top-0 z-50
        transition-transform duration-300 ease-in-out border-r border-white/[0.06]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-blue-500 flex items-center justify-center font-black text-[11px] text-white rounded-sm">
              L
            </div>
            <div>
              <p className="text-[13px] font-bold text-white tracking-tight leading-none">LeadTrack</p>
              <p className="text-[10px] text-white/30 font-medium mt-0.5">Performance Monitor</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] px-2 mb-3">Navigation</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70 border border-transparent'
                }`}
              >
                <Icon size={14} strokeWidth={isActive ? 2.5 : 1.75} />
                {item.name}
                {isActive && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-blue-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Signout */}
        <div className="border-t border-white/[0.06] p-3">
          <Link href="/dashboard/profile" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer group mb-0.5">
              <div className="w-7 h-7 bg-blue-500/20 border border-blue-500/30 rounded-md flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="text-[12px] font-semibold text-white/80 truncate leading-none">{userName}</p>
                <p className="text-[10px] text-white/30 font-medium mt-0.5">{role}</p>
              </div>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium text-white/30 hover:text-red-400/80 hover:bg-red-500/5 transition-all duration-150"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}