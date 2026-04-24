"use client";
import React, { useState } from 'react';
import { Save, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InputManualPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    webMasuk: '0',
    orderWaOts: '0',
    orderWeb: '0'
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      const now = new Date();
      now.setFullYear(parseInt(selectedDate.split('-')[0]));
      now.setMonth(parseInt(selectedDate.split('-')[1]) - 1);
      now.setDate(parseInt(selectedDate.split('-')[2]));
      setFormData({ ...formData, tanggal: now.toISOString() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const currentUserId = localStorage.getItem('user_id');

    if (!currentUserId) {
      alert("User ID tidak ditemukan. Silakan logout dan login kembali.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData, 
          webMasuk: Number(formData.webMasuk),
          orderWaOts: Number(formData.orderWaOts),
          orderWeb: Number(formData.orderWeb),
          userId: Number(currentUserId) 
        }),
      });

      if (res.ok) {
        alert("Laporan Berhasil Disimpan!");
        router.push('/dashboard');
      } else {
        const errorResponse = await res.json();
        alert("Gagal: " + errorResponse.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-[450px]">
        {/* Card dengan radius yang menyesuaikan (lebih kecil di mobile) */}
        <div className="bg-white rounded-3xl lg:rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-gray-100 p-6 lg:p-10">
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Laporan Harian</h1>
            <p className="text-gray-400 text-xs lg:text-sm mt-1">Input data leads & konversi harian</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 lg:y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Tanggal</label>
              <input 
                type="date" 
                required
                className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl p-3.5 lg:p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.tanggal.split('T')[0]} 
                onChange={handleDateChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Web Masuk</label>
              <input 
                type="number" 
                required
                placeholder="0"
                className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl p-3.5 lg:p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.webMasuk}
                onChange={(e) => setFormData({...formData, webMasuk: e.target.value})}
              />
            </div>

            {/* Grid berubah jadi 1 kolom di HP kecil banget, tapi 2 kolom di HP standar (sm) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Order WA / OTS</label>
                <input 
                  type="number" 
                  required
                  placeholder="0"
                  className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl p-3.5 lg:p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.orderWaOts}
                  onChange={(e) => setFormData({...formData, orderWaOts: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Order Web</label>
                <input 
                  type="number" 
                  required
                  placeholder="0"
                  className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl p-3.5 lg:p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.orderWeb}
                  onChange={(e) => setFormData({...formData, orderWeb: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 lg:py-4 rounded-xl lg:rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 transition-all disabled:opacity-50 active:scale-95 text-sm lg:text-base"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {loading ? 'Menyimpan...' : 'Simpan Laporan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}