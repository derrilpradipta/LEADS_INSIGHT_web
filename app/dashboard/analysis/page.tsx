"use client";
import { useEffect, useState } from "react";
import { Loader2, Calendar } from "lucide-react";

export default function ConversionAnalysisPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/staff-report?month=${selectedMonth}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  // Urutkan staf berdasarkan total order bulanan terbanyak
  const sortedStaff = [...data].sort((a, b) => b.monthlyTotal - a.monthlyTotal);

  return (
    <div className="p-8 space-y-8 bg-[#F8F9FC] min-h-screen font-sans">
      {/* HEADER & MONTH PICKER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Conversion Analysis</h1>
          <p className="text-sm text-gray-400 font-medium">Pantau efektivitas staff mengolah leads</p>
        </div>

        <div className="relative">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="appearance-none bg-white border border-gray-200 px-10 py-2.5 rounded-2xl text-[11px] font-black tracking-widest text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer uppercase transition-all hover:border-indigo-200"
          >
            {months.map((m, i) => <option key={i} value={i}>{m} 2026</option>)}
          </select>
          <Calendar size={14} className="absolute left-4 top-3.5 text-indigo-600 pointer-events-none" />
        </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left font-sans">
          <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Staff Name</th>
              <th className="px-8 py-5 text-center">Monthly Web / WA</th>
              <th className="px-8 py-5 text-center bg-indigo-50/30">Monthly Total</th>
              <th className="px-8 py-5 text-right">Conversion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Loader2 className="animate-spin inline text-indigo-600" />
                  <p className="text-[10px] font-bold text-gray-400 mt-2 tracking-widest uppercase">Memuat Data...</p>
                </td>
              </tr>
            ) : (
              sortedStaff.map((staff) => {
                const cr = staff.totalLeadsMonth > 0 
                  ? ((staff.monthlyTotal / staff.totalLeadsMonth) * 100).toFixed(1) 
                  : "0";

                return (
                  <tr key={staff.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-800 text-sm">{staff.nama}</div>
                      <div className="text-[10px] text-gray-400 font-medium">@{staff.username}</div>
                    </td>
                    
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex gap-2">
                        <div className="flex flex-col items-center px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 min-w-[100px] transition-transform group-hover:scale-105">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Web Month</span>
                          <span className="text-sm font-black text-blue-600">{staff.monthlyWeb}</span>
                        </div>
                        <div className="flex flex-col items-center px-4 py-2 bg-green-50 rounded-xl border border-green-100 min-w-[100px] transition-transform group-hover:scale-105">
                          <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">WA Month</span>
                          <span className="text-sm font-black text-green-600">{staff.monthlyWA}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-center bg-indigo-50/20">
                      <div className="text-lg font-black text-indigo-600 leading-none">{staff.monthlyTotal}</div>
                      <div className="text-[9px] font-black text-indigo-300 uppercase mt-1">Total Orders</div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`text-xs font-black ${Number(cr) > 50 ? 'text-green-600' : 'text-orange-500'}`}>{cr}%</span>
                        <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${Number(cr) > 50 ? 'bg-green-500' : 'bg-orange-400'}`} 
                            style={{ width: `${cr}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            {!loading && sortedStaff.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Tidak ada data staf bulan ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}