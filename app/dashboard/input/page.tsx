"use client";
import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, ChevronRight, FileText, Pencil, Trash2, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MyLead {
  id: string;
  tanggal: string;
  webMasuk: number;
  orderWeb: number;
  orderWaOts: number;
}

export default function InputManualPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [myLeads, setMyLeads] = useState<MyLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ tanggal: '', webMasuk: 0, orderWeb: 0, orderWaOts: 0 });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    webMasuk: '0',
    orderWaOts: '0',
    orderWeb: '0'
  });

  useEffect(() => {
    document.title = 'Input Data';
    const role = localStorage.getItem('user_role') || '';
    setUserRole(role);
    // Hanya fetch riwayat kalau bukan admin
    if (role !== 'ADMIN') fetchMyLeads();
    else setLoadingLeads(false);
  }, []);

  const fetchMyLeads = async () => {
    setLoadingLeads(true);
    const uid = localStorage.getItem('user_id');
    const urole = localStorage.getItem('user_role');
    if (!uid) { setLoadingLeads(false); return; }
    try {
      const res = await fetch(`/api/leads?userId=${uid}&role=${urole}`);
      const data = await res.json();
      const sorted = Array.isArray(data)
        ? data.sort((a: MyLead, b: MyLead) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
        : [];
      setMyLeads(sorted);
    } catch { }
    finally { setLoadingLeads(false); }
  };

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
        setFormData({ tanggal: new Date().toISOString().split('T')[0], webMasuk: '0', orderWaOts: '0', orderWeb: '0' });
        if (userRole !== 'ADMIN') fetchMyLeads();
      } else {
        const errorResponse = await res.json();
        alert("Gagal: " + errorResponse.message);
      }
    } catch {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (lead: MyLead) => {
    setEditingId(lead.id);
    setEditForm({
      tanggal: new Date(lead.tanggal).toISOString().split('T')[0],
      webMasuk: lead.webMasuk,
      orderWeb: lead.orderWeb,
      orderWaOts: lead.orderWaOts,
    });
  };

  const saveEdit = async (id: string) => {
    setSavingEdit(true);
    const uid = localStorage.getItem('user_id');
    try {
      const res = await fetch('/api/my-leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userId: Number(uid), ...editForm }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      fetchMyLeads();
    } catch { alert("Gagal menyimpan perubahan."); }
    finally { setSavingEdit(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus data ini?")) return;
    setDeletingId(id);
    const uid = localStorage.getItem('user_id');
    try {
      const res = await fetch('/api/my-leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userId: Number(uid) }),
      });
      if (!res.ok) throw new Error();
      fetchMyLeads();
    } catch { alert("Gagal menghapus data."); }
    finally { setDeletingId(null); }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-sm text-gray-900 px-4 py-3 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white placeholder-gray-400 transition-colors";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2";
  const editInputClass = "w-20 text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400";

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

      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── FORM ── */}
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
            <div>
              <label className={labelClass}>Pilih Tanggal</label>
              <input type="date" required className={inputClass}
                value={formData.tanggal.split('T')[0]} onChange={handleDateChange} />
            </div>
            <div>
              <label className={labelClass}>Web Masuk</label>
              <input type="number" required placeholder="0" className={inputClass}
                value={formData.webMasuk}
                onChange={(e) => setFormData({ ...formData, webMasuk: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Order WA / OTS</label>
                <input type="number" required placeholder="0" className={inputClass}
                  value={formData.orderWaOts}
                  onChange={(e) => setFormData({ ...formData, orderWaOts: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Order Web</label>
                <input type="number" required placeholder="0" className={inputClass}
                  value={formData.orderWeb}
                  onChange={(e) => setFormData({ ...formData, orderWeb: e.target.value })} />
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

          {/* Actions */}
          <div className="px-8 py-4 flex items-center justify-end gap-3">
            <button type="button" onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-6 py-2.5 rounded transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {loading ? 'Menyimpan...' : 'Simpan Laporan'}
            </button>
          </div>
        </form>

        {/* ── RIWAYAT INPUT — hanya untuk STAFF, bukan ADMIN ── */}
        {userRole !== 'ADMIN' && (
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Riwayat</p>
                <h3 className="text-sm font-semibold text-gray-800 mt-0.5">Data yang Sudah Kamu Input</h3>
              </div>
              <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1 rounded">
                {myLeads.length} entri
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Web Masuk</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order Web</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">WA/OTS</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">CR</th>
                    <th className="px-5 py-3 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLeads ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                      <Loader2 className="animate-spin inline mr-2" size={14} /> Memuat...
                    </td></tr>
                  ) : myLeads.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Belum ada data.</td></tr>
                  ) : myLeads.map((lead) => {
                    const isEditing = editingId === lead.id;
                    const crVal = lead.webMasuk > 0
                      ? (((lead.orderWeb + lead.orderWaOts) / lead.webMasuk) * 100).toFixed(1)
                      : '0.0';
                    const tanggal = new Date(lead.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    });

                    return (
                      <tr key={lead.id} className={`border-b border-gray-50 transition-colors ${isEditing ? 'bg-blue-50/30' : 'hover:bg-gray-50/60'}`}>
                        {isEditing ? (
                          <>
                            <td className="px-5 py-3">
                              <input type="date" value={editForm.tanggal}
                                onChange={e => setEditForm(f => ({ ...f, tanggal: e.target.value }))}
                                className={editInputClass + " w-36"} />
                            </td>
                            <td className="px-5 py-3 text-right">
                              <input type="number" value={editForm.webMasuk}
                                onChange={e => setEditForm(f => ({ ...f, webMasuk: +e.target.value }))}
                                className={editInputClass} />
                            </td>
                            <td className="px-5 py-3 text-right">
                              <input type="number" value={editForm.orderWeb}
                                onChange={e => setEditForm(f => ({ ...f, orderWeb: +e.target.value }))}
                                className={editInputClass} />
                            </td>
                            <td className="px-5 py-3 text-right">
                              <input type="number" value={editForm.orderWaOts}
                                onChange={e => setEditForm(f => ({ ...f, orderWaOts: +e.target.value }))}
                                className={editInputClass} />
                            </td>
                            <td className="px-5 py-3 text-right">
                              <span className="text-[11px] text-gray-300">auto</span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => saveEdit(lead.id)} disabled={savingEdit}
                                  className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors disabled:opacity-50">
                                  {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                </button>
                                <button onClick={() => setEditingId(null)}
                                  className="p-1.5 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 transition-colors">
                                  <X size={13} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-3.5 text-[13px] font-semibold text-gray-700">{tanggal}</td>
                            <td className="px-5 py-3.5 text-[13px] text-right text-gray-600 tabular-nums">{lead.webMasuk}</td>
                            <td className="px-5 py-3.5 text-[13px] text-right text-gray-600 tabular-nums">{lead.orderWeb}</td>
                            <td className="px-5 py-3.5 text-[13px] text-right text-gray-600 tabular-nums">{lead.orderWaOts}</td>
                            <td className="px-5 py-3.5 text-right">
                              <span className={`text-[12px] font-bold ${Number(crVal) > 15 ? 'text-blue-600' : 'text-gray-400'}`}>
                                {crVal}%
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => startEdit(lead)}
                                  className="p-1.5 bg-gray-50 text-gray-500 rounded hover:bg-gray-100 border border-gray-200 transition-colors">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => handleDelete(lead.id)} disabled={deletingId === lead.id}
                                  className="p-1.5 bg-red-50 text-red-400 rounded hover:bg-red-100 border border-red-100 transition-colors disabled:opacity-50">
                                  {deletingId === lead.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}