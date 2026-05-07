"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, ShoppingBag, MessageCircle, Loader2 } from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import FilterBar from "@/app/components/FilterBar";

interface Lead {
  id: string;
  tanggal: string;
  webMasuk: number;
  orderWeb: number;
  orderWaOts: number;
  closingRate: number;
}

interface CompareData {
  periodA: {
    webMasuk: number;
    orderWeb: number;
    orderWaOts: number;
    totalOrder: number;
    cr: string;
  };
  periodB: {
    webMasuk: number;
    orderWeb: number;
    orderWaOts: number;
    totalOrder: number;
    cr: string;
  };
  labelA: string;
  labelB: string;
}

// ─── Helper: group leads by date, sorted ascending ───────────────────────────
function groupLeadsByDate(data: Lead[]) {
  const map: Record<string, { tanggal: string; name: string; webMasuk: number; orderWeb: number; orderWaOts: number }> = {};
  const sorted = [...data].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  sorted.forEach((curr) => {
    const dateKey = new Date(curr.tanggal).toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
    if (!map[dateKey]) {
      map[dateKey] = { tanggal: dateKey, name: dateKey.substring(0, 5), webMasuk: 0, orderWeb: 0, orderWaOts: 0 };
    }
    map[dateKey].webMasuk += Number(curr.webMasuk);
    map[dateKey].orderWeb += Number(curr.orderWeb);
    map[dateKey].orderWaOts += Number(curr.orderWaOts);
  });
  return Object.values(map);
}

export default function DashboardPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [compareLeads, setCompareLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareData, setCompareData] = useState<CompareData | null>(null);

  useEffect(() => {
    document.title = 'Dashboard | LeadTrack';
    loadData();
  }, []);

  const loadData = async (params?: string) => {
    setLoading(true);
    const rawUid = localStorage.getItem('user_id');
    const urole = localStorage.getItem('user_role');
    const uid = rawUid ? parseInt(rawUid, 10) : null;

    if (!uid && urole !== 'ADMIN') {
      setLoading(false);
      return;
    }

    try {
      const base = `/api/leads?userId=${uid}&role=${urole}`;
      const url = params ? `${base}&${params}` : base;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const validData = Array.isArray(data) ? data : [];
      const sortedData = validData.sort((a: Lead, b: Lead) =>
        new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
      );
      setLeads(sortedData);
    } catch (err) {
      console.error("Gagal load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (values: any) => {
    if (values.type === "month") {
      loadData(`month=${values.month}&year=${values.year}`);
    } else if (values.from && values.to) {
      loadData(`from=${values.from}&to=${values.to}`);
    }
  };

  const handleCompare = async (values: {
    periodA: { from: string; to: string };
    periodB: { from: string; to: string };
  }) => {
    const rawUid = localStorage.getItem('user_id');
    const urole = localStorage.getItem('user_role');
    const uid = rawUid ? parseInt(rawUid, 10) : null;
    const base = `/api/leads?userId=${uid}&role=${urole}`;

    loadData(`from=${values.periodA.from}&to=${values.periodA.to}`);

    const resB = await fetch(`${base}&from=${values.periodB.from}&to=${values.periodB.to}`);
    const dataB: Lead[] = await resB.json();
    const validDataB = Array.isArray(dataB) ? dataB : [];
    const sortedDataB = [...validDataB].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );
    setCompareLeads(sortedDataB);

    const summarize = (data: Lead[]) => {
      const webMasuk = data.reduce((a, b) => a + b.webMasuk, 0);
      const orderWeb = data.reduce((a, b) => a + b.orderWeb, 0);
      const orderWaOts = data.reduce((a, b) => a + b.orderWaOts, 0);
      const totalOrder = orderWeb + orderWaOts;
      const cr = webMasuk > 0 ? ((totalOrder / webMasuk) * 100).toFixed(1) : "0";
      return { webMasuk, orderWeb, orderWaOts, totalOrder, cr };
    };

    const resA = await fetch(`${base}&from=${values.periodA.from}&to=${values.periodA.to}`);
    const dataA: Lead[] = await resA.json();
    const validDataA = Array.isArray(dataA) ? dataA : [];

    setCompareData({
      periodA: summarize(validDataA),
      periodB: summarize(validDataB),
      labelA: `${values.periodA.from} s/d ${values.periodA.to}`,
      labelB: `${values.periodB.from} s/d ${values.periodB.to}`,
    });
  };

  const handleCompareReset = () => {
    setCompareData(null);
    setCompareLeads([]);
    loadData();
  };

  // ── Grouped data ──
  const groupedA = groupLeadsByDate(leads);
  const groupedB = groupLeadsByDate(compareLeads);

  // ── Chart data mode normal ──
  const normalChartData = groupedA.map((item) => ({
    ...item,
    cr: item.webMasuk > 0 ? ((item.orderWeb + item.orderWaOts) / item.webMasuk) * 100 : 0,
  }));

  // ── Chart data mode compare: index = hari ke-N ──
  const maxLen = Math.max(groupedA.length, groupedB.length);
  const compareChartData = Array.from({ length: maxLen }, (_, i) => {
    const a = groupedA[i];
    const b = groupedB[i];
    return {
      day: i + 1,
      tanggalA: a?.name ?? '-',
      tanggalB: b?.name ?? '-',
      orderWebA: a?.orderWeb ?? null,
      orderWaOtsA: a?.orderWaOts ?? null,
      orderWebB: b?.orderWeb ?? null,
      orderWaOtsB: b?.orderWaOts ?? null,
    };
  });

  // ── CR chart (periode A) ──
  const crChartData = groupedA.map((item) => ({
    name: item.name,
    cr: item.webMasuk > 0 ? ((item.orderWeb + item.orderWaOts) / item.webMasuk) * 100 : 0,
  }));

  // ── Summary stats ──
  const totalLeads = leads.reduce((acc, curr) => acc + curr.webMasuk, 0);
  const totalOrders = leads.reduce((acc, curr) => acc + (curr.orderWeb + curr.orderWaOts), 0);
  const totalOrderWeb = leads.reduce((a, b) => a + b.orderWeb, 0);
  const totalOrderWa = leads.reduce((a, b) => a + b.orderWaOts, 0);
  const avgCR = totalLeads > 0 ? ((totalOrders / totalLeads) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 tracking-tight">Dashboard Monitoring</h1>
          <p className="text-xs lg:text-sm text-gray-400 font-medium">
            {compareData
              ? <span className="text-indigo-500 font-bold">Mode Compare Aktif: {compareData.labelA} vs {compareData.labelB}</span>
              : "Performance monitoring"}
          </p>
        </div>
      </div>

      {/* FILTER */}
      <FilterBar
        onFilter={handleFilter}
        onReset={() => loadData()}
        onCompare={handleCompare}
        onCompareReset={handleCompareReset}
      />

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          sub="TOTAL WEB MASUK"
          icon={<Users />}
          color="text-indigo-600"
          bg="bg-indigo-50"
          compareValue={compareData?.periodB.webMasuk}
        />
        <StatCard
          title="Conversion Rate"
          value={`${avgCR}%`}
          sub="AVG CLOSING"
          icon={<TrendingUp />}
          color="text-green-600"
          bg="bg-green-50"
          compareValue={compareData ? `${compareData.periodB.cr}%` : undefined}
          compareRaw={compareData ? parseFloat(compareData.periodB.cr) : undefined}
          currentRaw={parseFloat(avgCR)}
        />
        <StatCard
          title="Order Web"
          value={totalOrderWeb}
          sub="MAIN SOURCE"
          icon={<ShoppingBag />}
          color="text-orange-600"
          bg="bg-orange-50"
          compareValue={compareData?.periodB.orderWeb}
        />
        <StatCard
          title="Order WA/OTS"
          value={totalOrderWa}
          sub="DIRECT CHANNELS"
          icon={<MessageCircle />}
          color="text-blue-600"
          bg="bg-blue-50"
          compareValue={compareData?.periodB.orderWaOts}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Trend Chart ── */}
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm h-[350px] lg:h-[420px]">
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
            <h3 className="font-bold text-gray-800 text-sm lg:text-base">Daily Trend Analysis</h3>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] lg:text-[10px] font-bold text-gray-500">
              {!compareData ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <svg width="20" height="3"><rect width="20" height="3" rx="1.5" fill="#f97316" /></svg>
                    ORDER WEB
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="20" height="3"><rect width="20" height="3" rx="1.5" fill="#3b82f6" /></svg>
                    ORDER WA/OTS
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <svg width="20" height="3"><rect width="20" height="3" rx="1.5" fill="#f97316" /></svg>
                    Web (A)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="20" height="3"><rect width="20" height="3" rx="1.5" fill="#3b82f6" /></svg>
                    WA/OTS (A)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="20" height="3">
                      <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="#fb923c" strokeWidth="2.5" strokeDasharray="5 3" />
                    </svg>
                    Web (B)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="20" height="3">
                      <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="5 3" />
                    </svg>
                    WA/OTS (B)
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ height: 'calc(100% - 60px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              {!compareData ? (
                /* MODE NORMAL */
                <ComposedChart data={normalChartData}>
                  <defs>
                    <linearGradient id="gWeb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gWa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="linear" dataKey="orderWeb" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#gWeb)" name="Order Web" />
                  <Area type="linear" dataKey="orderWaOts" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#gWa)" name="Order WA/OTS" />
                </ComposedChart>
              ) : (
                /* MODE COMPARE — 4 garis, X = hari ke-N */
                <ComposedChart data={compareChartData}>
                  <defs>
                    <linearGradient id="gWebA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gWaA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 600 }}
                    dy={10}
                    tickFormatter={(v) => `H${v}`}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />

                  {/* Custom Tooltip menampilkan tanggal A dan B */}
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const idx = (label as number) - 1;
                      const tA = groupedA[idx]?.name ?? '-';
                      const tB = groupedB[idx]?.name ?? '-';
                      return (
                        <div style={{
                          background: '#fff',
                          borderRadius: 16,
                          boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15)',
                          padding: '12px 16px',
                          minWidth: 210,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#6366f1' }}>Hari ke-{label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                            <span style={{ fontSize: 9, color: '#f97316', fontWeight: 700 }}>A: {tA}</span>
                            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>B: {tB}</span>
                          </div>
                          {payload.map((entry: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <div style={{
                                width: 16, height: 2,
                                background: entry.color,
                                borderRadius: 1,
                                borderTop: entry.strokeDasharray ? `2px dashed ${entry.color}` : 'none',
                              }} />
                              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, flex: 1 }}>{entry.name}</span>
                              <span style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>
                                {entry.value !== null && entry.value !== undefined ? entry.value : '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />

                  {/* Periode A — solid + area fill */}
                  <Area type="linear" dataKey="orderWebA" stroke="#f97316" strokeWidth={2.5}
                    fill="url(#gWebA)" fillOpacity={1} name="Order Web (A)" dot={false} connectNulls />
                  <Area type="linear" dataKey="orderWaOtsA" stroke="#3b82f6" strokeWidth={2.5}
                    fill="url(#gWaA)" fillOpacity={1} name="WA/OTS (A)" dot={false} connectNulls />

                  {/* Periode B — putus-putus, tanpa fill */}
                  <Line type="linear" dataKey="orderWebB" stroke="#fb923c" strokeWidth={2}
                    strokeDasharray="6 4" dot={false} name="Order Web (B)" connectNulls />
                  <Line type="linear" dataKey="orderWaOtsB" stroke="#60a5fa" strokeWidth={2}
                    strokeDasharray="6 4" dot={false} name="WA/OTS (B)" connectNulls />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Bar Chart CR ── */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm h-[350px] lg:h-[420px]">
          <h3 className="font-bold text-gray-800 mb-6 text-sm lg:text-base">Daily Closing Rate (%)</h3>
          <div style={{ height: 'calc(100% - 56px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "Closing Rate"]}
                />
                <Bar dataKey="cr" radius={[6, 6, 0, 0]} barSize={30}>
                  {crChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cr > 15 ? '#6366f1' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-gray-800">Daily Performance Monitoring</h3>
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
            {normalChartData.length} Days Recorded
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Web Masuk</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Order Web</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Order WA/OTS</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Total Order</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Closing Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Loader2 className="animate-spin inline mr-2 text-indigo-600" /> Menghitung data...
                  </td>
                </tr>
              ) : normalChartData.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Tidak ada data leads.</td></tr>
              ) : [...normalChartData].reverse().map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.tanggal}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-indigo-600">{item.webMasuk}</td>
                  <td className="px-6 py-4 text-sm text-center font-medium">{item.orderWeb}</td>
                  <td className="px-6 py-4 text-sm text-center font-medium">{item.orderWaOts}</td>
                  <td className="px-6 py-4 text-sm text-center font-black text-gray-800">{item.orderWeb + item.orderWaOts}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${item.cr > 15 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {item.cr.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon, color, bg, compareValue, compareRaw, currentRaw }: any) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const numCompare = compareRaw !== undefined ? compareRaw : (typeof compareValue === 'string' ? parseFloat(compareValue) : compareValue);
  const diff = compareValue !== undefined ? numValue - numCompare : null;
  const pct = (diff !== null && numCompare > 0) ? ((diff / numCompare) * 100).toFixed(1) : null;

  return (
    <div className="bg-white p-5 lg:p-6 rounded-2xl lg:rounded-[28px] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 mt-2">{value}</p>
          {compareValue !== undefined && (
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">vs {compareValue}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className={`text-[9px] lg:text-[10px] font-bold uppercase ${color}`}>{sub}</p>
            {pct !== null && (
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${diff! >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {diff! >= 0 ? "+" : ""}{pct}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-2.5 lg:p-3 rounded-xl lg:rounded-2xl ${bg} ${color} flex-shrink-0`}>{icon}</div>
      </div>
    </div>
  );
}