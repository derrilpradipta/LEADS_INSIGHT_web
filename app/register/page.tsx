"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
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
        router.push('/login');
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Gagal daftar, username mungkin sudah ada.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-gray-900 text-white font-bold text-xl mb-4 rounded">
            L
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Daftar Pegawai</h2>
          <p className="mt-1 text-sm text-gray-400">Buat akun untuk akses LeadTrack</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200">
          <form className="p-6 space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Nama lengkap pegawai"
                className="w-full border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none rounded transition-colors"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="Buat username unik"
                className="w-full border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none rounded transition-colors"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none rounded transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium py-2.5 transition-colors active:scale-[0.98] rounded mt-2"
            >
              Daftar Sekarang
            </button>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Sudah punya akun? <span className="underline">Masuk ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}