"use client";
import FilterBar from "@/app/components/FilterBar";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2, Check, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Lead {
  id: string;
  tanggal: string;
  webMasuk: number;
  orderWaOts: number;
  orderWeb: number;
  closingRate: number;
  user: { id: number; nama: string; username: string };
}

interface GroupedByDate {
  [date: string]: Lead[];
}

export default function LeadsControlPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ tanggal: "", webMasuk: 0, orderWaOts: 0, orderWeb: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role !== "ADMIN") { router.push("/dashboard"); return; }
    fetchLeads();
    document.title = 'Leads Control';
  }, []);

  const fetchLeads = async (params?: string) => {
    setLoading(true);
    try {
      const url = params ? `/api/leads-control?${params}` : "/api/leads-control";
      const res = await fetch(url);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { }
    finally { setLoading(false); }
  };

  const handleFilter = (values: any) => {
    if (values.type === "month") {
      fetchLeads(`month=${values.month}&year=${values.year}`);
    } else if (values.from && values.to) {
      fetchLeads(`from=${values.from}&to=${values.to}`);
    }
  };

  // Group by date
  const grouped: GroupedByDate = leads.reduce((acc, lead) => {
    const dateKey = new Date(lead.tanggal).toLocaleDateString("id-ID", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(lead);
    return acc;
  }, {} as GroupedByDate);

  const startEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setEditForm({
      tanggal: new Date(lead.tanggal).toISOString().split("T")[0],
      webMasuk: lead.webMasuk,
      orderWaOts: lead.orderWaOts,
      orderWeb: lead.orderWeb,
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch("/api/leads-control", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      fetchLeads();
    } catch { alert("Gagal menyimpan perubahan"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus data ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/leads-control", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      fetchLeads();
    } catch { alert("Gagal menghapus data"); }
    finally { setDeletingId(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-[#F7F8FA] min-h-screen">
      <Loader2 className="animate-spin text-gray-400 mr-2" size={22} />
      <span className="text-sm text-gray-500">Memuat data...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-5">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-gray-600">Leads Control</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Leads Control</h1>
        <p className="text-xs text-gray-400 mt-0.5">Kelola semua data leads per tanggal</p>
      </div>

      <div className="px-6 lg:px-8 py-6 space-y-4">
        <FilterBar
          onFilter={handleFilter}
          onReset={() => fetchLeads()}
          showCompare={false}
        />

        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white border border-gray-200 p-10 text-center text-sm text-gray-400">
            Belum ada data leads.
          </div>
        ) : (
          Object.entries(grouped).map(([date, dayLeads]) => {
            const totalWeb = dayLeads.reduce((a, b) => a + b.webMasuk, 0);
            const totalOrderWeb = dayLeads.reduce((a, b) => a + b.orderWeb, 0);
            const totalOrderWa = dayLeads.reduce((a, b) => a + b.orderWaOts, 0);
            const totalOrder = totalOrderWeb + totalOrderWa;
            const totalCR = totalWeb > 0 ? ((totalOrder / totalWeb) * 100).toFixed(1) : "0";

            return (
              <div key={date} className="bg-white border border-gray-200 overflow-hidden">
                {/* Date Header */}
                <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h2 className="font-semibold text-gray-700 text-sm">{date}</h2>
                  <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                    <span className="bg-white px-2.5 py-1 border border-gray-200 text-blue-600 rounded">
                      Web Masuk: {totalWeb}
                    </span>
                    <span className="bg-white px-2.5 py-1 border border-gray-200 text-amber-600 rounded">
                      Order Web: {totalOrderWeb}
                    </span>
                    <span className="bg-white px-2.5 py-1 border border-gray-200 text-gray-600 rounded">
                      Order WA/OTS: {totalOrderWa}
                    </span>
                    <span className="bg-white px-2.5 py-1 border border-gray-200 text-emerald-600 rounded">
                      Total: {totalOrder} ({totalCR}%)
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Staff</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Web Masuk</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Order Web</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Order WA/OTS</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Total Order</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">CR</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dayLeads.map((lead) => {
                        const isEditing = editingId === lead.id;
                        const cr = lead.webMasuk > 0
                          ? (((lead.orderWeb + lead.orderWaOts) / lead.webMasuk) * 100).toFixed(1)
                          : "0";

                        return (
                          <tr key={lead.id} className={`transition-colors ${isEditing ? "bg-blue-50/30" : "hover:bg-gray-50/50"}`}>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs flex-shrink-0">
                                  {lead.user.nama.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">{lead.user.nama}</p>
                                  <p className="text-[10px] text-gray-400">@{lead.user.username}</p>
                                </div>
                              </div>
                            </td>

                            {isEditing ? (
                              <>
                                <td className="px-3 py-2 text-center">
                                  <input type="number" value={editForm.webMasuk}
                                    onChange={e => setEditForm(f => ({ ...f, webMasuk: +e.target.value }))}
                                    className="w-20 text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="number" value={editForm.orderWeb}
                                    onChange={e => setEditForm(f => ({ ...f, orderWeb: +e.target.value }))}
                                    className="w-20 text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="number" value={editForm.orderWaOts}
                                    onChange={e => setEditForm(f => ({ ...f, orderWaOts: +e.target.value }))}
                                    className="w-20 text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                                </td>
                                <td className="px-6 py-3 text-center text-sm font-semibold text-gray-800">
                                  {editForm.orderWeb + editForm.orderWaOts}
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <span className="text-xs text-gray-400">auto</span>
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button onClick={() => saveEdit(lead.id)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                                      <Check size={13} />
                                    </button>
                                    <button onClick={() => setEditingId(null)}
                                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors">
                                      <X size={13} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-3 text-sm text-center font-semibold text-blue-600">{lead.webMasuk}</td>
                                <td className="px-6 py-3 text-sm text-center text-gray-600">{lead.orderWeb}</td>
                                <td className="px-6 py-3 text-sm text-center text-gray-600">{lead.orderWaOts}</td>
                                <td className="px-6 py-3 text-sm text-center font-semibold text-gray-800">{lead.orderWeb + lead.orderWaOts}</td>
                                <td className="px-6 py-3 text-center">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${+cr > 15 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                    {cr}%
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button onClick={() => startEdit(lead)}
                                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                      <Pencil size={13} />
                                    </button>
                                    <button onClick={() => handleDelete(lead.id)}
                                      disabled={deletingId === lead.id}
                                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50">
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
            );
          })
        )}
      </div>
    </div>
  );
}