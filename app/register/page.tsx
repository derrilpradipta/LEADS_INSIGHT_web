"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter(); // Letakkan di dalam fungsi komponen
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    password: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        alert("Daftar berhasil! Silakan login.");
        router.push('/login'); // Berpindah halaman otomatis
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Gagal daftar, username mungkin sudah ada.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FC] p-4 font-sans text-[#1A1C21]">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F46E5] text-white font-bold text-2xl mb-4 shadow-lg shadow-indigo-200">
            L
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Daftar Pegawai</h2>
          <p className="mt-2 text-sm text-gray-500 text-center">Buat akun untuk akses LeadTrack</p>
        </div>
    
        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 ml-1">Nama Lengkap</label>
              <input
                type="text"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-all focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50"
                placeholder="Nama lengkap pegawai"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 ml-1">Username</label>
              <input
                type="text"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-all focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50"
                placeholder="Buat username unik"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 ml-1">Password</label>
              <input
                type="password"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-all focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col items-center pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#4F46E5] py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:bg-[#4338CA] active:scale-[0.98]"
            >
              Daftar Sekarang
            </button>
            
            <Link href="/login" className="mt-6 text-xs font-medium text-gray-400 hover:text-[#4F46E5] transition-colors">
              Sudah punya akun? <span className="underline">Masuk ke Dashboard</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}