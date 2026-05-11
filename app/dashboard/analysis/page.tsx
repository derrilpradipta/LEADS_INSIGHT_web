"use client";
import { useEffect, useState } from "react";
import { Loader2, Calendar, TrendingUp, ChevronRight } from "lucide-react";
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
    document.title = 'Analysis';
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
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-5">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-gray-600">Analysis</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Conversion Analysis</h1>
            <p className="text-xs text-gray-400 mt-0.5">Efektivitas staff mengolah leads</p>
          </div>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 pl-8 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded cursor-pointer"
            >
              {months.map((m, i) => <option key={i} value={i}>{m} 2026</option>)}
            </select>
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Staff Performance</span>
            <TrendingUp size={14} className="text-gray-400" />
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-gray-400" size={22} />
                <p className="text-xs text-gray-400">Memuat data...</p>
              </div>
            ) : sortedStaff.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-400">Tidak ada data bulan ini.</div>
            ) : (
              sortedStaff.map((staff, index) => {
                const cr = staff.totalLeadsMonth > 0
                  ? ((staff.monthlyTotal / staff.totalLeadsMonth) * 100).toFixed(1)
                  : "0";

                return (
                  <div key={staff.id} className="p-5 lg:p-6 hover:bg-gray-50/60 transition-colors">
                    {/* Row 1: Profile & Total */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-gray-900 text-white text-[10px] font-semibold rounded">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{staff.nama}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">@{staff.username}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-blue-600 leading-none">{staff.monthlyTotal}</div>
                        <div className="text-[9px] font-medium text-gray-400 uppercase tracking-wide mt-1">Total Orders</div>
                      </div>
                    </div>

                    {/* Row 2: Stats Grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-4">
                      <div className="flex justify-between items-center px-4 py-2.5 bg-blue-50 border border-blue-100 rounded">
                        <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-wide">Web Month</span>
                        <span className="text-sm font-semibold text-blue-600">{staff.monthlyWeb}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded">
                        <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wide">WA Month</span>
                        <span className="text-sm font-semibold text-emerald-600">{staff.monthlyWA}</span>
                      </div>
                    </div>

                    {/* Row 3: Efficiency Bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide min-w-[60px]">Efficiency</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${Number(cr) > 15 ? 'bg-blue-500' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(Number(cr), 100)}%` }}
                        />
                      </div>
                      <div className={`text-xs font-semibold min-w-[36px] text-right ${Number(cr) > 15 ? 'text-blue-600' : 'text-amber-500'}`}>
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
    </div>
  );
}