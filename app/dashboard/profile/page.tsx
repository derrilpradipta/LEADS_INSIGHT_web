"use client";
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, User as UserIcon, ChevronRight } from 'lucide-react';

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
    document.title = 'Profile';
    setFormData(prev => ({
      ...prev,
      nama: nameFromStorage,
      username: usernameFromStorage
    }));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/update-profil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profil Berhasil Diperbarui!");
        localStorage.setItem('user_name', formData.nama);
        window.location.reload();
      } else {
        alert(data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      alert("Gagal terhubung ke server");
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 px-3 py-2.5 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white placeholder-gray-400 transition-colors";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-gray-600">Profil</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Pengaturan Profil</h1>
      </div>

      <div className="max-w-lg mx-auto">
        <form onSubmit={handleUpdate} className="bg-white border border-gray-200 divide-y divide-gray-100">
          {/* Avatar row */}
          <div className="px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
              <UserIcon size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formData.nama || '—'}</p>
              <p className="text-xs text-gray-400">@{formData.username || '—'}</p>
            </div>
          </div>

          {/* Info Akun */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Informasi Akun</p>

            <div>
              <label className={labelClass}>Nama Lengkap</label>
              <input
                type="text"
                className={inputClass}
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                disabled
                className="w-full bg-gray-100 border border-gray-200 text-sm text-gray-400 px-3 py-2.5 rounded cursor-not-allowed"
                value={formData.username}
              />
            </div>
          </div>

          {/* Ubah Password */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Ubah Password</p>

            <div>
              <label className={labelClass}>Password Lama (Wajib)</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  className={`${inputClass} pr-9`}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Password Baru (Opsional)</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  className={`${inputClass} pr-9`}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 transition-colors"
            >
              <Save size={14} />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}