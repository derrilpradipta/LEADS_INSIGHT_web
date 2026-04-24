"use client";

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileInput, Shield, 
  BarChart3, FileText, LogOut 
} from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userName, setUserName] = useState("User");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem('user_name'); 
    const storedRole = localStorage.getItem('user_role');
    
    if (storedName) {
      setUserName(storedName);
    } else {
      // Jika user_name kosong, coba ambil key lain yang mungkin terisi
      const fallback = localStorage.getItem('user_username') || localStorage.getItem('name');
      if (fallback) setUserName(fallback);
    }
    
    if (storedRole) setRole(storedRole.toUpperCase());
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Input Data', icon: <FileInput size={20} />, path: '/dashboard/input' },
    ...(role === 'ADMIN' ? [
      { name: 'User Control', icon: <Shield size={20} />, path: '/dashboard/user' },
      { name: 'Conversion Analysis', icon: <BarChart3 size={20} />, path: '/dashboard/analysis' },
      { name: 'Reports', icon: <FileText size={20} />, path: '/dashboard/reports' },
    ] : []),
  ];

  const handleSignOut = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <aside className="w-72 bg-[#0F172A] text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Brand / Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">L</div>
        <span className="text-xl font-bold tracking-tight">LeadTrack</span>
      </div>

      {/* Menu List */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-medium text-sm ${
              pathname === item.path 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>

      {/* User Info & Profil */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link href="/dashboard/profile">
          <div className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-2xl transition-all cursor-pointer border border-transparent active:scale-95">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              {/* Gunakan inisial dari userName yang login */}
              {userName.charAt(0).toUpperCase()} 
            </div>
            <div className="flex-1 overflow-hidden">
              {/* Variabel userName harusnya sudah di-set di useEffect sidebar */}
              <p className="text-sm font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 font-medium">{role}</p>
            </div>
          </div>
        </Link>

        {/* Sign Out */}
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors text-sm font-bold"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}