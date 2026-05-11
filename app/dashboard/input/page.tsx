"use client";
import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InputManualPage() {
  useEffect(() => { document.title = 'Input Data'; }, []);

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

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 px-4 py-3 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white placeholder-gray-400 transition-colors";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2";

  // Hitung total order secara live
  const totalOrder = Number(formData.orderWaOts) + Number(formData.orderWeb);
  const cr = Number(formData.webMasuk) > 0
    ? ((totalOrder / Number(formData.webMasuk)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-gray-600">Input Data</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Laporan Harian</h1>
        <p className="text-xs text-gray-400 mt-0.5">Input data leads & konversi harian</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 divide-y divide-gray-100">

          {/* Form header */}
          <div className="px-8 py-5 flex items-center gap-3">
            <div className="p-2 bg-gray-900 rounded text-white">
              <FileText size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Form Input Harian</p>
              <p className="text-xs text-gray-400">Isi semua field dengan data hari ini</p>
            </div>
          </div>

          {/* Fields */}
          <div className="px-8 py-6 space-y-5">
            {/* Tanggal — full width */}
            <div>
              <label className={labelClass}>Pilih Tanggal</label>
              <input
                type="date"
                required
                className={inputClass}
                value={formData.tanggal.split('T')[0]}
                onChange={handleDateChange}
              />
            </div>

            {/* Web Masuk — full width */}
            <div>
              <label className={labelClass}>Web Masuk</label>
              <input
                type="number"
                required
                placeholder="0"
                className={inputClass}
                value={formData.webMasuk}
                onChange={(e) => setFormData({ ...formData, webMasuk: e.target.value })}
              />
            </div>

            {/* Order grid — 2 kolom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Order WA / OTS</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  className={inputClass}
                  value={formData.orderWaOts}
                  onChange={(e) => setFormData({ ...formData, orderWaOts: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Order Web</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  className={inputClass}
                  value={formData.orderWeb}
                  onChange={(e) => setFormData({ ...formData, orderWeb: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Live summary */}
          <div className="px-8 py-5 bg-gray-50 grid grid-cols-3 divide-x divide-gray-200">
            <div className="pr-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Web Masuk</p>
              <p className="text-xl font-semibold text-gray-800 tabular-nums">{Number(formData.webMasuk).toLocaleString()}</p>
            </div>
            <div className="px-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Order</p>
              <p className="text-xl font-semibold text-gray-800 tabular-nums">{totalOrder.toLocaleString()}</p>
            </div>
            <div className="pl-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CR Hari Ini</p>
              <p className={`text-xl font-semibold tabular-nums ${Number(cr) > 15 ? 'text-emerald-600' : 'text-amber-500'}`}>{cr}%</p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-8 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-6 py-2.5 rounded transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {loading ? 'Menyimpan...' : 'Simpan Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}