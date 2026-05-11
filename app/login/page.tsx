"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { document.title = 'Login'; }, []);

  // Fungsi LOGIN — bukan register
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();

        // Simpan semua informasi penting ke localStorage
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_name', data.user.nama);
        localStorage.setItem('user_role', data.user.role);
        localStorage.setItem('user_username', data.user.username);

        router.push('/dashboard');
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Username atau password salah.");
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
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">LeadTrack</h2>
          <p className="mt-1 text-sm text-gray-400">Monitoring & Analisa Konversi</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200">
          <form className="p-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Username Pegawai
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan username"
                className="w-full border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                className="w-full border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium py-2.5 transition-colors active:scale-[0.98] rounded mt-2"
            >
              Masuk ke Dashboard
            </button>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link href="/register" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Belum punya akun? <span className="underline">Daftar pegawai baru</span>
          </Link>
        </div>
      </div>
    </div>
  );
}