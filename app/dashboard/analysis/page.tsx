"use client";
import { useEffect, useState } from "react";
import { Loader2, Calendar, Award, TrendingUp } from "lucide-react";
import { Lead } from "@prisma/client";

export default function ConversionAnalysisPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const [compareData, setCompareData] = useState<{
    periodA: any[];
    periodB: any[];
    labelA: string;
    labelB: string;
  } | null>(null);

  const handleCompare = async (values: { periodA: { from: string; to: string }; periodB: { from: string; to: string } }) => {
  const rawUid = localStorage.getItem('user_id');
  const urole = localStorage.getItem('user_role');
  const uid = rawUid ? parseInt(rawUid, 10) : null;
  const base = `/api/leads?userId=${uid}&role=${urole}`;

  const [resA, resB] = await Promise.all([
    fetch(`${base}&from=${values.periodA.from}&to=${values.periodA.to}`),
    fetch(`${base}&from=${values.periodB.from}&to=${values.periodB.to}`),
  ]);

  const [dataA, dataB] = await Promise.all([resA.json(), resB.json()]);

  const summarize = (data: Lead[]) => ({
    webMasuk: data.reduce((a, b) => a + b.webMasuk, 0),
    orderWeb: data.reduce((a, b) => a + b.orderWeb, 0),
    orderWaOts: data.reduce((a, b) => a + b.orderWaOts, 0),
    totalOrder: data.reduce((a, b) => a + b.orderWeb + b.orderWaOts, 0),
    cr: data.reduce((a, b) => a + b.webMasuk, 0) > 0
        ? ((data.reduce((a, b) => a + b.orderWeb + b.orderWaOts, 0) / data.reduce((a, b) => a + b.webMasuk, 0)) * 100).toFixed(1)
        : "0",
    });

    setCompareData({
      periodA: [{ name: "Periode A", ...summarize(dataA) }],
      periodB: [{ name: "Periode B", ...summarize(dataB) }],
      labelA: `${values.periodA.from} s/d ${values.periodA.to}`,
      labelB: `${values.periodB.from} s/d ${values.periodB.to}`,
    });
  };

const handleCompareReset = () => setCompareData(null);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  useEffect(() => {
  document.title = 'Analysis'
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
    <div className="p-4 lg:p-8 space-y-6 bg-[#F8F9FC] min-h-screen pb-24">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Conversion Analysis</h1>
          <p className="text-xs text-gray-400 font-medium">Efektivitas staff mengolah leads</p>
        </div>

        <div className="relative w-full sm:w-auto">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full sm:w-auto appearance-none bg-white border border-gray-200 pl-10 pr-10 py-2.5 rounded-xl text-[11px] font-black tracking-widest text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer uppercase"
          >
            {months.map((m, i) => <option key={i} value={i}>{m} 2026</option>)}
          </select>
          <Calendar size={14} className="absolute left-4 top-3.5 text-indigo-600 pointer-events-none" />
        </div>
      </div>

      {/* DATA LIST (REPLACING TABLE) */}
      <div className="bg-white rounded-[24px] lg:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Staff Performance</span>
          <TrendingUp size={14} className="text-indigo-400" />
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin inline text-indigo-600 mb-2" />
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Memuat Data...</p>
            </div>
          ) : sortedStaff.length === 0 ? (
            <div className="py-20 text-center text-[10px] font-bold text-gray-400 uppercase">Tidak ada data bulan ini</div>
          ) : (
            sortedStaff.map((staff, index) => {
              const cr = staff.totalLeadsMonth > 0 
                ? ((staff.monthlyTotal / staff.totalLeadsMonth) * 100).toFixed(1) 
                : "0";

              return (
                <div key={staff.id} className="p-4 lg:p-6 hover:bg-gray-50/30 transition-colors">
                  {/* Row 1: Profile & Total */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-lg text-[10px] font-black shadow-sm shadow-indigo-200">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{staff.nama}</div>
                        <div className="text-[10px] text-gray-400 font-medium leading-none mt-1">@{staff.username}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-indigo-600 leading-none">{staff.monthlyTotal}</div>
                      <div className="text-[8px] font-black text-gray-300 uppercase mt-1">Total Orders</div>
                    </div>
                  </div>

                  {/* Row 2: Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex justify-between items-center px-4 py-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <span className="text-[9px] font-black text-blue-400 uppercase">Web Month</span>
                      <span className="text-sm font-black text-blue-600">{staff.monthlyWeb}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 bg-green-50/50 rounded-xl border border-green-100/50">
                      <span className="text-[9px] font-black text-green-400 uppercase">WA Month</span>
                      <span className="text-sm font-black text-green-600">{staff.monthlyWA}</span>
                    </div>
                  </div>

                  {/* Row 3: Efficiency Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-gray-400 uppercase min-w-[65px]">Efficiency</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${Number(cr) > 15 ? 'bg-indigo-500' : 'bg-orange-400'}`} 
                        style={{ width: `${cr}%` }} 
                      />
                    </div>
                    <div className={`text-[11px] font-black min-w-[40px] text-right ${Number(cr) > 15 ? 'text-indigo-600' : 'text-orange-500'}`}>
                      {cr}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}