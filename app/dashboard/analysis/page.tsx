"use client";
import { useEffect, useState } from "react";
import { Loader2, Calendar, Award, ChevronRight } from "lucide-react";

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

  const sortedStaff = [...data].sort((a, b) => b.monthlyTotal - a.monthlyTotal);

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 bg-[#F8F9FC] min-h-screen font-sans pb-20">
      {/* 1. HEADER & MONTH PICKER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 tracking-tight">Conversion Analysis</h1>
          <p className="text-xs lg:text-sm text-gray-400 font-medium">Pantau efektivitas staff mengolah leads</p>
        </div>

        <div className="relative w-full sm:w-auto">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full sm:w-auto appearance-none bg-white border border-gray-200 pl-10 pr-10 py-2.5 rounded-xl lg:rounded-2xl text-[11px] font-black tracking-widest text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer uppercase transition-all hover:border-indigo-200"
          >
            {months.map((m, i) => <option key={i} value={i}>{m} 2026</option>)}
          </select>
          <Calendar size={14} className="absolute left-4 top-3.5 text-indigo-600 pointer-events-none" />
        </div>
      </div>

      {/* 2. LEADERBOARD TABLE / CARDS */}
      <div className="bg-white rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Mobile View: Header Legend */}
        <div className="lg:hidden p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff Rankings</span>
          <Award size={16} className="text-indigo-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans min-w-[600px] lg:min-w-full">
            <thead className="hidden lg:table-header-group bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
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
                sortedStaff.map((staff, index) => {
                  const cr = staff.totalLeadsMonth > 0 
                    ? ((staff.monthlyTotal / staff.totalLeadsMonth) * 100).toFixed(1) 
                    : "0";

                  return (
                    <tr key={staff.id} className="hover:bg-gray-50/30 transition-colors group flex flex-col lg:table-row p-4 lg:p-0">
                      {/* Staff Name & Info */}
                      <td className="px-0 lg:px-8 py-2 lg:py-6">
                        <div className="flex items-center gap-3 lg:gap-0">
                          {/* Rank Badge for Mobile */}
                          <div className="lg:hidden w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm lg:text-base">{staff.nama}</div>
                            <div className="text-[10px] text-gray-400 font-medium">@{staff.username}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Monthly Web / WA - Grid on Mobile */}
                      <td className="px-0 lg:px-8 py-4 lg:py-6">
                        <div className="flex justify-between lg:justify-center items-center gap-2">
                          <div className="flex lg:flex-col items-center justify-between lg:justify-center px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 flex-1 lg:min-w-[100px]">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest lg:mb-1">Web</span>
                            <span className="text-sm font-black text-blue-600">{staff.monthlyWeb}</span>
                          </div>
                          <div className="flex lg:flex-col items-center justify-between lg:justify-center px-4 py-2 bg-green-50 rounded-xl border border-green-100 flex-1 lg:min-w-[100px]">
                            <span className="text-[9px] font-black text-green-400 uppercase tracking-widest lg:mb-1">WA</span>
                            <span className="text-sm font-black text-green-600">{staff.monthlyWA}</span>
                          </div>
                        </div>
                      </td>

                      {/* Monthly Total */}
                      <td className="px-0 lg:px-8 py-3 lg:py-6 lg:bg-indigo-50/20 rounded-xl lg:rounded-none">
                        <div className="flex justify-between lg:flex-col items-center lg:text-center px-4 lg:px-0">
                          <span className="lg:hidden text-[9px] font-black text-indigo-300 uppercase">Total Orders</span>
                          <div className="text-base lg:text-lg font-black text-indigo-600">{staff.monthlyTotal}</div>
                          <span className="hidden lg:block text-[9px] font-black text-indigo-300 uppercase mt-1">Total Orders</span>
                        </div>
                      </td>

                      {/* Conversion Rate */}
                      <td className="px-0 lg:px-8 py-3 lg:py-6">
                        <div className="flex flex-col items-end lg:items-end justify-center gap-2 px-4 lg:px-0">
                          <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                             <span className="lg:hidden text-[9px] font-black text-gray-400 uppercase">Efficiency</span>
                             <span className={`text-xs font-black ${Number(cr) > 50 ? 'text-green-600' : 'text-orange-500'}`}>{cr}%</span>
                          </div>
                          <div className="w-full lg:w-24 bg-gray-100 h-1.5 lg:h-2 rounded-full overflow-hidden">
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
            </tbody>
          </table>
        </div>
        
        {/* Footer info empty state */}
        {!loading && sortedStaff.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Tidak ada data staf bulan ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}