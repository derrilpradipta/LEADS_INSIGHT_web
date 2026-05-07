"use client";
import FilterBar from "@/app/components/FilterBar";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";
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
    document.title = 'Leads Control'
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
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-indigo-600 mr-2" />
      <span className="text-gray-500">Memuat data...</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800 tracking-tight">Leads Control</h1>
        <p className="text-xs lg:text-sm text-gray-400 font-medium">Kelola semua data leads per tanggal</p>
      </div>
      <FilterBar
        onFilter={handleFilter}
        onReset={() => fetchLeads()}
        showCompare={false}
      />

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
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
            <div key={date} className="bg-white rounded-2xl lg:rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
              {/* Date Header */}
              <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="font-bold text-indigo-700 text-sm">{date}</h2>
                <div className="flex flex-wrap gap-3 text-[10px] font-bold">
                  <span className="bg-white px-3 py-1 rounded-full text-indigo-600 border border-indigo-100">
                    Web Masuk: {totalWeb}
                  </span>
                  <span className="bg-white px-3 py-1 rounded-full text-orange-600 border border-orange-100">
                    Order Web: {totalOrderWeb}
                  </span>
                  <span className="bg-white px-3 py-1 rounded-full text-blue-600 border border-blue-100">
                    Order WA/OTS: {totalOrderWa}
                  </span>
                  <span className="bg-white px-3 py-1 rounded-full text-green-600 border border-green-100">
                    Total: {totalOrder} ({totalCR}%)
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Staff</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Web Masuk</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Order Web</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Order WA/OTS</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Total Order</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">CR</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {dayLeads.map((lead) => {
                      const isEditing = editingId === lead.id;
                      const cr = lead.webMasuk > 0
                        ? (((lead.orderWeb + lead.orderWaOts) / lead.webMasuk) * 100).toFixed(1)
                        : "0";

                      return (
                        <tr key={lead.id} className={`transition-colors ${isEditing ? "bg-indigo-50/40" : "hover:bg-gray-50/30"}`}>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {lead.user.nama.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-700">{lead.user.nama}</p>
                                <p className="text-[10px] text-gray-400">@{lead.user.username}</p>
                              </div>
                            </div>
                          </td>

                          {isEditing ? (
                            <>
                              <td className="px-3 py-2 text-center">
                                <input type="number" value={editForm.webMasuk}
                                  onChange={e => setEditForm(f => ({ ...f, webMasuk: +e.target.value }))}
                                  className="w-20 text-center border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input type="number" value={editForm.orderWeb}
                                  onChange={e => setEditForm(f => ({ ...f, orderWeb: +e.target.value }))}
                                  className="w-20 text-center border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input type="number" value={editForm.orderWaOts}
                                  onChange={e => setEditForm(f => ({ ...f, orderWaOts: +e.target.value }))}
                                  className="w-20 text-center border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                              </td>
                              <td className="px-6 py-3 text-center text-sm font-black text-gray-800">
                                {editForm.orderWeb + editForm.orderWaOts}
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span className="text-[10px] font-bold text-gray-400">auto</span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => saveEdit(lead.id)}
                                    className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                                    <Check size={14} />
                                  </button>
                                  <button onClick={() => setEditingId(null)}
                                    className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
                                    <X size={14} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-3 text-sm text-center font-bold text-indigo-600">{lead.webMasuk}</td>
                              <td className="px-6 py-3 text-sm text-center font-medium">{lead.orderWeb}</td>
                              <td className="px-6 py-3 text-sm text-center font-medium">{lead.orderWaOts}</td>
                              <td className="px-6 py-3 text-sm text-center font-black text-gray-800">{lead.orderWeb + lead.orderWaOts}</td>
                              <td className="px-6 py-3 text-center">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${+cr > 15 ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                                  {cr}%
                                </span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => startEdit(lead)}
                                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                                    <Pencil size={14} />
                                  </button>
                                  <button onClick={() => handleDelete(lead.id)}
                                    disabled={deletingId === lead.id}
                                    className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                                    {deletingId === lead.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
  );
}