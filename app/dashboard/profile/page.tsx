"use client";
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    currentPassword: '',
    newPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const nameFromStorage = localStorage.getItem('user_name') || '';
    const usernameFromStorage = localStorage.getItem('user_username') || '';
    
    setFormData(prev => ({ 
      ...prev, 
      nama: nameFromStorage, 
      username: usernameFromStorage 
    }));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/update-profil', { // Arahkan ke API profile
        method: 'POST', // Gunakan POST agar selaras dengan API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profil Berhasil Diperbarui!");
        localStorage.setItem('user_name', formData.nama);
        // Refresh halaman agar nama di Sidebar ikut berubah
        window.location.reload(); 
      } else {
        alert(data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      alert("Gagal terhubung ke server");
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto pb-20">
      <div className="bg-white rounded-2xl lg:rounded-[32px] p-6 lg:p-10 shadow-sm border border-gray-100">
        <h2 className="text-xl lg:text-2xl font-bold mb-6 lg:mb-8 flex items-center gap-3 text-gray-800">
          <div className="p-2 bg-indigo-50 rounded-lg lg:rounded-xl">
            <UserIcon className="text-indigo-600 w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          Pengaturan Profil
        </h2>
        
        <form onSubmit={handleUpdate} className="space-y-5 lg:space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <input 
              type="text" 
              className="w-full p-3.5 lg:p-4 bg-gray-50 border border-gray-100 focus:border-indigo-200 focus:ring-2 focus:ring-indigo-500/10 outline-none rounded-xl lg:rounded-2xl transition-all text-sm"
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" disabled
              className="w-full p-3.5 lg:p-4 bg-gray-100 border border-gray-200 rounded-xl lg:rounded-2xl text-gray-400 cursor-not-allowed text-sm font-medium"
              value={formData.username}
            />
          </div>

          <div className="relative space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Lama (Wajib)</label>
            <div className="relative">
                <input 
                type={showCurrent ? "text" : "password"} 
                required
                className="w-full p-3.5 lg:p-4 bg-gray-50 border border-gray-100 focus:border-indigo-200 focus:ring-2 focus:ring-indigo-500/10 outline-none rounded-xl lg:rounded-2xl transition-all text-sm"
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                />
                <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          <div className="relative space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Baru (Opsional)</label>
            <div className="relative">
                <input 
                type={showNew ? "text" : "password"} 
                className="w-full p-3.5 lg:p-4 bg-gray-50 border border-gray-100 focus:border-indigo-200 focus:ring-2 focus:ring-indigo-500/10 outline-none rounded-xl lg:rounded-2xl transition-all text-sm"
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                />
                <button 
                type="button" 
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          <div className="pt-4">
            <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all text-sm lg:text-base"
            >
                <Save size={18} /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}