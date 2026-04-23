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
    // Ambil data dari localStorage atau API
    const name = localStorage.getItem('user_name') || '';
    const user = localStorage.getItem('user_username') || '';
    setFormData(prev => ({ ...prev, nama: name, username: user }));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/user/update', {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Profil Berhasil Diperbarui!");
      localStorage.setItem('user_name', formData.nama);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <UserIcon className="text-indigo-600" /> Pengaturan Profil
        </h2>
        
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Username</label>
            <input 
              type="text" disabled
              className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              value={formData.username}
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Password Lama (Wajib)</label>
            <input 
              type={showCurrent ? "text" : "password"} 
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            />
            <button 
              type="button" 
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-10 text-gray-400"
            >
              {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Password Baru (Opsional)</label>
            <input 
              type={showNew ? "text" : "password"} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            />
            <button 
              type="button" 
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-10 text-gray-400"
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <Save size={20} /> Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}