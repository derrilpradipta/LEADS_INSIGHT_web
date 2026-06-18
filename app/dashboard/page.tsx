"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, ArrowUp, ArrowDown, Minus, Globe, TrendingUp, ShoppingCart, MessageCircle, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
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
  periodA: { webMasuk: number; orderWeb: number; orderWaOts: number; totalOrder: number; cr: string };
  periodB: { webMasuk: number; orderWeb: number; orderWaOts: number; totalOrder: number; cr: string };
  labelA: string;
  labelB: string;
}

const ROWS_PER_PAGE = 7;

function groupLeadsByDate(data: Lead[]) {
  const map: Record<string, { tanggal: string; name: string; webMasuk: number; orderWeb: number; orderWaOts: number }> = {};
  [...data].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()).forEach((curr) => {
    const dateKey = new Date(curr.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!map[dateKey]) map[dateKey] = { tanggal: dateKey, name: dateKey.substring(0, 5), webMasuk: 0, orderWeb: 0, orderWaOts: 0 };
    map[dateKey].webMasuk += Number(curr.webMasuk);
    map[dateKey].orderWeb += Number(curr.orderWeb);
    map[dateKey].orderWaOts += Number(curr.orderWaOts);
  });
  return Object.values(map);
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [compareLeads, setCompareLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareData, setCompareData] = useState<CompareData | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = 'Dashboard | LeadTrack';
    loadData();
  }, []);

  const loadData = async (params?: string) => {
    setLoading(true);
    const rawUid = localStorage.getItem('user_id');
    const urole = localStorage.getItem('user_role');
    const uid = rawUid ? parseInt(rawUid, 10) : null;
    if (!uid && urole !== 'ADMIN') { setLoading(false); return; }
    try {
      const base = `/api/leads?userId=${uid}&role=${urole}`;
      const url = params ? `${base}&${params}` : base;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLeads(Array.isArray(data) ? data.sort((a: Lead, b: Lead) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()) : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFilter = (values: any) => {
    if (values.type === "month") loadData(`month=${values.month}&year=${values.year}`);
    else if (values.from && values.to) loadData(`from=${values.from}&to=${values.to}`);
  };

  const handleCompare = async (values: { periodA: { from: string; to: string }; periodB: { from: string; to: string } }) => {
    const rawUid = localStorage.getItem('user_id');
    const urole = localStorage.getItem('user_role');
    const uid = rawUid ? parseInt(rawUid, 10) : null;
    const base = `/api/leads?userId=${uid}&role=${urole}`;
    loadData(`from=${values.periodA.from}&to=${values.periodA.to}`);
    const [resA, resB] = await Promise.all([
      fetch(`${base}&from=${values.periodA.from}&to=${values.periodA.to}`),
      fetch(`${base}&from=${values.periodB.from}&to=${values.periodB.to}`),
    ]);
    const [dataA, dataB]: [Lead[], Lead[]] = await Promise.all([resA.json(), resB.json()]);
    const validDataB = Array.isArray(dataB) ? dataB.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()) : [];
    setCompareLeads(validDataB);
    const summarize = (d: Lead[]) => {
      const webMasuk = d.reduce((a, b) => a + b.webMasuk, 0);
      const orderWeb = d.reduce((a, b) => a + b.orderWeb, 0);
      const orderWaOts = d.reduce((a, b) => a + b.orderWaOts, 0);
      const totalOrder = orderWeb + orderWaOts;
      return { webMasuk, orderWeb, orderWaOts, totalOrder, cr: webMasuk > 0 ? ((totalOrder / webMasuk) * 100).toFixed(1) : "0" };
    };
    setCompareData({
      periodA: summarize(Array.isArray(dataA) ? dataA : []),
      periodB: summarize(validDataB),
      labelA: `${values.periodA.from} s/d ${values.periodA.to}`,
      labelB: `${values.periodB.from} s/d ${values.periodB.to}`,
    });
  };

  const handleCompareReset = () => { setCompareData(null); setCompareLeads([]); loadData(); };

  const groupedA = groupLeadsByDate(leads);
  const groupedB = groupLeadsByDate(compareLeads);
  const normalChartData = groupedA.map(item => ({ ...item, cr: item.webMasuk > 0 ? ((item.orderWeb + item.orderWaOts) / item.webMasuk) * 100 : 0 }));
  const maxLen = Math.max(groupedA.length, groupedB.length);
  const compareChartData = Array.from({ length: maxLen }, (_, i) => ({
    day: i + 1,
    tanggalA: groupedA[i]?.name ?? '-',
    tanggalB: groupedB[i]?.name ?? '-',
    orderWebA: groupedA[i]?.orderWeb ?? null,
    orderWaOtsA: groupedA[i]?.orderWaOts ?? null,
    orderWebB: groupedB[i]?.orderWeb ?? null,
    orderWaOtsB: groupedB[i]?.orderWaOts ?? null,
  }));
  const crChartData = groupedA.map(item => ({ name: item.name, cr: item.webMasuk > 0 ? ((item.orderWeb + item.orderWaOts) / item.webMasuk) * 100 : 0 }));

  const totalLeads = leads.reduce((acc, curr) => acc + curr.webMasuk, 0);
  const totalOrders = leads.reduce((acc, curr) => acc + (curr.orderWeb + curr.orderWaOts), 0);
  const totalOrderWeb = leads.reduce((a, b) => a + b.orderWeb, 0);
  const totalOrderWa = leads.reduce((a, b) => a + b.orderWaOts, 0);
  const avgCR = totalLeads > 0 ? ((totalOrders / totalLeads) * 100).toFixed(1) : "0";

  const metrics = [
    {
      label: "Total Leads",
      value: totalLeads,
      sub: "Web Masuk",
      icon: Globe,
      compareVal: compareData?.periodB.webMasuk,
      accent: "#2563eb",
      accentBg: "#eff6ff",
      accentText: "text-blue-600",
    },
    {
      label: "Conversion Rate",
      value: `${avgCR}%`,
      sub: "Avg Closing",
      icon: TrendingUp,
      compareVal: compareData ? `${compareData.periodB.cr}%` : undefined,
      compareRaw: compareData ? parseFloat(compareData.periodB.cr) : undefined,
      currentRaw: parseFloat(avgCR),
      accent: "#16a34a",
      accentBg: "#f0fdf4",
      accentText: "text-emerald-600",
    },
    {
      label: "Order Web",
      value: totalOrderWeb,
      sub: "Main Source",
      icon: ShoppingCart,
      compareVal: compareData?.periodB.orderWeb,
      accent: "#7c3aed",
      accentBg: "#f5f3ff",
      accentText: "text-violet-600",
    },
    {
      label: "Order WA/OTS",
      value: totalOrderWa,
      sub: "Direct Channel",
      icon: MessageCircle,
      compareVal: compareData?.periodB.orderWaOts,
      accent: "#d97706",
      accentBg: "#fffbeb",
      accentText: "text-amber-600",
    },
    {
      label: "Total Order",
      value: totalOrders,
      sub: "Order Web + WA/OTS",
      icon: Package,
      compareVal: compareData?.periodB.totalOrder,
      accent: "#0891b2",
      accentBg: "#ecfeff",
      accentText: "text-cyan-600",
    },
  ];

  // ── Pagination logic ──
  useEffect(() => {
    setCurrentPage(1);
  }, [normalChartData.length, compareData]);

  const reversedNormalData = [...normalChartData].reverse();
  const totalPagesNormal = Math.max(1, Math.ceil(reversedNormalData.length / ROWS_PER_PAGE));
  const paginatedNormalData = reversedNormalData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const compareRowCount = Math.max(groupedA.length, groupedB.length);
  const totalPagesCompare = Math.max(1, Math.ceil(compareRowCount / ROWS_PER_PAGE));
  const compareStartIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const compareEndIdx = Math.min(currentPage * ROWS_PER_PAGE, compareRowCount);

  return (
    <div className="space-y-5">

      {/* ── HEADER ── */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">Performance Dashboard</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          {compareData
            ? <span className="text-blue-500 font-medium">{compareData.labelA} <span className="text-gray-300 mx-1">vs</span> {compareData.labelB}</span>
            : "Monitoring leads & konversi harian"}
        </p>
      </div>

      {/* ── FILTER ── */}
      <FilterBar
        onFilter={handleFilter}
        onReset={() => loadData()}
        onCompare={handleCompare}
        onCompareReset={handleCompareReset}
      />

      {/* ── METRICS — 5 kartu terpisah dengan accent kiri ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          const numVal = typeof m.value === 'string' ? parseFloat(m.value) : m.value;
          const numCmp = m.compareRaw !== undefined ? m.compareRaw : (typeof m.compareVal === 'string' ? parseFloat(m.compareVal) : m.compareVal as number);
          const diff = m.compareVal !== undefined ? numVal - numCmp : null;
          const pct = diff !== null && numCmp > 0 ? ((diff / numCmp) * 100).toFixed(1) : null;

          return (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex">
              <div className="w-1 flex-shrink-0" style={{ background: m.accent }} />
              <div className="flex-1 px-5 pt-3 pb-4.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{m.label}</p>
                  <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: m.accentBg }}>
                    <Icon size={14} style={{ color: m.accent }} />
                  </div>
                </div>
                <p className="text-[30px] font-bold text-gray-900 leading-none tabular-nums my-3">{m.value}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-gray-400">{m.sub}</p>
                  {pct !== null ? (
                    <span className={`flex items-center gap-0.5 text-[11px] font-bold ${diff! >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {diff! > 0 ? <ArrowUp size={10} /> : diff! < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
                      {Math.abs(parseFloat(pct))}%
                    </span>
                  ) : (
                    <span className={`text-[11px] font-semibold ${m.accentText}`}>
                      {i === 1 ? (parseFloat(avgCR) > 15 ? '↑ Baik' : '↓ Perlu Perhatian') : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tren Harian</p>
              <h3 className="text-[14px] font-bold text-gray-800 mt-0.5">Order Web & WA/OTS</h3>
            </div>
            <div className="flex gap-3 text-[11px] font-medium text-gray-500 flex-shrink-0">
              {!compareData ? (
                <>
                  <span className="flex items-center gap-1.5"><span className="w-5 h-[2px] bg-blue-500 inline-block rounded-full" /> Web</span>
                  <span className="flex items-center gap-1.5"><span className="w-5 h-[2px] bg-amber-400 inline-block rounded-full" /> WA/OTS</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-[2px] bg-blue-500 inline-block rounded-full" />
                    Web A
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-[2px] bg-amber-400 inline-block rounded-full" />
                    WA A
                  </span>
                  <span className="flex items-center gap-1.5 opacity-80">
                    <svg width="20" height="4" viewBox="0 0 20 4"><line x1="0" y1="2" x2="20" y2="2" stroke="#93c5fd" strokeWidth="2" strokeDasharray="4 2" /></svg>
                    Web B
                  </span>
                  <span className="flex items-center gap-1.5 opacity-80">
                    <svg width="20" height="4" viewBox="0 0 20 4"><line x1="0" y1="2" x2="20" y2="2" stroke="#fcd34d" strokeWidth="2" strokeDasharray="4 2" /></svg>
                    WA B
                  </span>
                </>
              )}
            </div>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              {!compareData ? (
                <ComposedChart data={normalChartData} margin={{ left: -10, right: 4 }}>
                  <defs>
                    <linearGradient id="gWeb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gWa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 0" vertical={false} stroke="#f1f3f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} width={24} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12, padding: '8px 12px' }}
                    cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="orderWeb" stroke="#3b82f6" strokeWidth={2} fill="url(#gWeb)" name="Order Web" dot={false} />
                  <Area type="monotone" dataKey="orderWaOts" stroke="#f59e0b" strokeWidth={2} fill="url(#gWa)" name="WA/OTS" dot={false} />
                </ComposedChart>
              ) : (
                <ComposedChart data={compareChartData} margin={{ left: -10, right: 4 }}>
                  <defs>
                    <linearGradient id="gWebA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gWaA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 0" vertical={false} stroke="#f1f3f5" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} dy={6} tickFormatter={v => `H${v}`} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} width={24} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const idx = (label as number) - 1;
                      const tglA = groupedA[idx]?.name ?? '-';
                      const tglB = groupedB[idx]?.name ?? '-';
                      const itemsA = payload.filter((e: any) => e.dataKey?.endsWith('A'));
                      const itemsB = payload.filter((e: any) => e.dataKey?.endsWith('B'));
                      return (
                        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '10px 14px', minWidth: 200 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>{tglA}</p>
                          {itemsA.map((e: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <div style={{ width: 12, height: 2, background: e.color, borderRadius: 1 }} />
                              <span style={{ fontSize: 11, color: '#6b7280', flex: 1 }}>{e.dataKey === 'orderWebA' ? 'Order Web' : 'WA/OTS'}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{e.value ?? '-'}</span>
                            </div>
                          ))}
                          <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>{tglB}</p>
                          {itemsB.map((e: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <svg width="12" height="4" viewBox="0 0 12 4" style={{ flexShrink: 0 }}><line x1="0" y1="2" x2="12" y2="2" stroke={e.color} strokeWidth="2" strokeDasharray="3 2" /></svg>
                              <span style={{ fontSize: 11, color: '#6b7280', flex: 1 }}>{e.dataKey === 'orderWebB' ? 'Order Web' : 'WA/OTS'}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{e.value ?? '-'}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="orderWebA" stroke="#3b82f6" strokeWidth={2} fill="url(#gWebA)" name="Web (A)" dot={false} connectNulls />
                  <Area type="monotone" dataKey="orderWaOtsA" stroke="#f59e0b" strokeWidth={2} fill="url(#gWaA)" name="WA (A)" dot={false} connectNulls />
                  <Line type="monotone" dataKey="orderWebB" stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Web (B)" connectNulls />
                  <Line type="monotone" dataKey="orderWaOtsB" stroke="#fcd34d" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="WA (B)" connectNulls />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* CR Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Closing Rate</p>
              <h3 className="text-[14px] font-bold text-gray-800 mt-0.5">Performa Harian (%)</h3>
            </div>
            {compareData && (
              <div className="flex gap-2.5 text-[11px] font-medium text-gray-500 flex-shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block bg-blue-500" />
                  {compareData.labelA.split(' ')[0]}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block bg-blue-200" />
                  {compareData.labelB.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              {!compareData ? (
                <BarChart data={crChartData} margin={{ left: -10, right: 4 }} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 0" vertical={false} stroke="#f1f3f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} width={24} />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12, padding: '8px 12px' }}
                    formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "CR"]}
                  />
                  <Bar dataKey="cr" radius={[3, 3, 0, 0]}>
                    {crChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.cr > 15 ? '#3b82f6' : '#e5e7eb'} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={Array.from({ length: Math.max(groupedA.length, groupedB.length) }, (_, i) => ({
                    day: i + 1,
                    crA: groupedA[i]?.webMasuk > 0 ? ((groupedA[i].orderWeb + groupedA[i].orderWaOts) / groupedA[i].webMasuk) * 100 : 0,
                    crB: groupedB[i]?.webMasuk > 0 ? ((groupedB[i].orderWeb + groupedB[i].orderWaOts) / groupedB[i].webMasuk) * 100 : 0,
                    nameA: groupedA[i]?.name ?? '-',
                    nameB: groupedB[i]?.name ?? '-',
                  }))}
                  margin={{ left: -10, right: 4 }}
                  barCategoryGap="30%"
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 0" vertical={false} stroke="#f1f3f5" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} dy={6} tickFormatter={v => `H${v}`} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} width={24} />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12, padding: '8px 12px' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '10px 14px', minWidth: 160 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#3b82f6' }} />
                            <span style={{ fontSize: 11, color: '#6b7280' }}>{d?.nameA}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginLeft: 'auto' }}>{Number(d?.crA ?? 0).toFixed(1)}%</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#93c5fd' }} />
                            <span style={{ fontSize: 11, color: '#6b7280' }}>{d?.nameB}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginLeft: 'auto' }}>{Number(d?.crB ?? 0).toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="crA" name="CR A" radius={[3, 3, 0, 0]} fill="#3b82f6" />
                  <Bar dataKey="crB" name="CR B" radius={[3, 3, 0, 0]} fill="#93c5fd" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rekap Data</p>
            <h3 className="text-[14px] font-bold text-gray-800 mt-0.5">Daily Performance Monitoring</h3>
          </div>
          <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1 rounded">
            {compareData
              ? `${Math.max(groupedA.length, groupedB.length)} hari tercatat`
              : `${normalChartData.length} hari tercatat`}
          </span>
        </div>
        <div className="overflow-x-auto">
          {!compareData ? (
            /* ── MODE NORMAL ── */
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Web Masuk</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order Web</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order WA/OTS</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">CR</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-14 text-gray-400 text-sm">
                    <Loader2 className="animate-spin inline mr-2" size={15} /> Memuat data...
                  </td></tr>
                ) : paginatedNormalData.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-14 text-gray-400 text-sm">Tidak ada data.</td></tr>
                ) : paginatedNormalData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-gray-700">{item.tanggal}</td>
                    <td className="px-5 py-3.5 text-[13px] text-right text-gray-600 tabular-nums">{item.webMasuk}</td>
                    <td className="px-5 py-3.5 text-[13px] text-right text-gray-600 tabular-nums">{item.orderWeb}</td>
                    <td className="px-5 py-3.5 text-[13px] text-right text-gray-600 tabular-nums">{item.orderWaOts}</td>
                    <td className="px-5 py-3.5 text-[13px] text-right font-bold text-gray-900 tabular-nums">{item.orderWeb + item.orderWaOts}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-[12px] font-bold ${item.cr > 15 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {item.cr.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* ── MODE COMPARE: atas-bawah per hari, dipaginasi ── */
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hari</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Web Masuk</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order Web</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order WA/OTS</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">CR</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: compareEndIdx - compareStartIdx }, (_, j) => {
                  const i = compareStartIdx + j;
                  const a = groupedA[i];
                  const b = groupedB[i];
                  const crA = a && a.webMasuk > 0 ? ((a.orderWeb + a.orderWaOts) / a.webMasuk) * 100 : null;
                  const crB = b && b.webMasuk > 0 ? ((b.orderWeb + b.orderWaOts) / b.webMasuk) * 100 : null;
                  const totalA = a ? a.orderWeb + a.orderWaOts : null;
                  const totalB = b ? b.orderWeb + b.orderWaOts : null;
                  const diff = totalA !== null && totalB !== null ? totalA - totalB : null;

                  return (
                    <React.Fragment key={i}>
                      {/* Baris Periode A */}
                      <tr className="border-b border-gray-50 bg-blue-50/20 hover:bg-blue-50/40 transition-colors">
                        <td className="px-5 py-2.5" rowSpan={2}>
                          <span className="text-[11px] font-bold text-gray-400">{i + 1}</span>
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <span className="text-[13px] font-semibold text-gray-700">{a?.tanggal ?? '-'}</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider ml-1">A</span>
                          </div>
                        </td>
                        <td className="px-5 py-2.5 text-[13px] text-right text-gray-600 tabular-nums">{a?.webMasuk ?? '-'}</td>
                        <td className="px-5 py-2.5 text-[13px] text-right text-gray-600 tabular-nums">{a?.orderWeb ?? '-'}</td>
                        <td className="px-5 py-2.5 text-[13px] text-right text-gray-600 tabular-nums">{a?.orderWaOts ?? '-'}</td>
                        <td className="px-5 py-2.5 text-right">
                          <span className="flex items-center justify-end gap-1.5 text-[13px] font-bold text-gray-900 tabular-nums">
                            {totalA ?? '-'}
                            {diff !== null && (
                              <span className={`text-[10px] font-bold ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          {crA !== null
                            ? <span className={`text-[12px] font-bold ${crA > 15 ? 'text-blue-600' : 'text-gray-400'}`}>{crA.toFixed(1)}%</span>
                            : <span className="text-gray-300 text-[12px]">-</span>}
                        </td>
                      </tr>

                      {/* Baris Periode B */}
                      <tr className="border-b border-gray-200 hover:bg-gray-50/40 transition-colors">
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                            <span className="text-[13px] text-gray-400 tabular-nums">{b?.tanggal ?? '-'}</span>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider ml-1">B</span>
                          </div>
                        </td>
                        <td className="px-5 py-2.5 text-[13px] text-right text-gray-400 tabular-nums">{b?.webMasuk ?? '-'}</td>
                        <td className="px-5 py-2.5 text-[13px] text-right text-gray-400 tabular-nums">{b?.orderWeb ?? '-'}</td>
                        <td className="px-5 py-2.5 text-[13px] text-right text-gray-400 tabular-nums">{b?.orderWaOts ?? '-'}</td>
                        <td className="px-5 py-2.5 text-[13px] text-right font-bold text-gray-500 tabular-nums">{totalB ?? '-'}</td>
                        <td className="px-5 py-2.5 text-right">
                          {crB !== null
                            ? <span className={`text-[12px] font-bold ${crB > 15 ? 'text-blue-400' : 'text-gray-300'}`}>{crB.toFixed(1)}%</span>
                            : <span className="text-gray-300 text-[12px]">-</span>}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── PAGINATION FOOTER ── */}
        {!loading && (
          (!compareData && reversedNormalData.length > ROWS_PER_PAGE) ||
          (compareData && compareRowCount > ROWS_PER_PAGE)
        ) && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
            <p className="text-[12px] text-gray-400">
              {!compareData
                ? `Menampilkan ${(currentPage - 1) * ROWS_PER_PAGE + 1}–${Math.min(currentPage * ROWS_PER_PAGE, reversedNormalData.length)} dari ${reversedNormalData.length} hari`
                : `Menampilkan H${compareStartIdx + 1}–H${compareEndIdx} dari ${compareRowCount} hari`}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 flex items-center justify-center text-gray-500 border border-gray-200 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[12px] text-gray-500 font-medium px-2 tabular-nums">
                {currentPage} / {!compareData ? totalPagesNormal : totalPagesCompare}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(!compareData ? totalPagesNormal : totalPagesCompare, p + 1))}
                disabled={currentPage === (!compareData ? totalPagesNormal : totalPagesCompare)}
                className="h-7 w-7 flex items-center justify-center text-gray-500 border border-gray-200 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}