"use client";

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileInput, Shield, 
  BarChart3, FileText, LogOut, Menu, X 
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
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Input Data', icon: <FileInput size={20} />, path: '/dashboard/input' },
    ...(role === 'ADMIN' ? [
      { name: 'User Control', icon: <Shield size={20} />, path: '/dashboard/user' },
      { name: 'Conversion Analysis', icon: <BarChart3 size={20} />, path: '/dashboard/analysis' },
      { name: 'Reports', icon: <FileText size={20} />, path: '/dashboard/reports' },
    ] : []),
  ];

  // UPDATE LOGIC SIGN OUT DISINI
  const handleSignOut = async () => {
    try {
      // 1. Hapus Cookie di Server (API yang sudah kita buat tadi)
      await fetch('/api/logout', { method: 'POST' });
      
      // 2. Bersihkan localStorage (Logic lama kamu)
      localStorage.clear();
      
      // 3. Paksa pindah ke login dan hapus history browser (Replace)
      // Menggunakan window.location.replace lebih ampuh daripada router.push 
      // untuk memastikan Middleware langsung bekerja saat refresh.
      window.location.replace('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: Tetap bersihkan lokal jika API gagal
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
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-95 transition-transform"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`
        w-72 bg-[#0F172A] text-white flex flex-col h-screen fixed left-0 top-0 z-50 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
      `}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">L</div>
          <span className="text-xl font-bold tracking-tight">LeadTrack</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
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

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/dashboard/profile" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-2xl transition-all cursor-pointer border border-transparent active:scale-95">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {userName.charAt(0).toUpperCase()} 
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 font-medium">{role}</p>
              </div>
            </div>
          </Link>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors text-sm font-bold"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}