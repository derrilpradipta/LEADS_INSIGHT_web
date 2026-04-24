"use client";

import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';
import { 
  Users, TrendingUp, ShoppingBag, MessageCircle, 
  Upload, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

interface Lead {
    id: string;
    tanggal: string;
    webMasuk: number;
    orderWeb: number;
    orderWaOts: number;
    closingRate: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const rawUid = localStorage.getItem('user_id');
      const urole = localStorage.getItem('user_role');
      const uid = rawUid ? parseInt(rawUid, 10) : null;

      if (!uid && urole !== 'ADMIN') {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/leads?userId=${uid}&role=${urole}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const validData = Array.isArray(data) ? data : [];
        
        const sortedData = validData.sort((a, b) => 
          new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
        );
        
        setLeads(sortedData);
      } catch (err) {
        console.error("Gagal load data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- LOGIKA GROUPING PER TANGGAL ---
  const groupedByDate = leads.reduce((acc: any, curr) => {
    const dateKey = new Date(curr.tanggal).toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });

    if (!acc[dateKey]) {
      acc[dateKey] = {
        tanggal: dateKey,
        name: dateKey.substring(0, 5),
        webMasuk: 0,
        orderWeb: 0,
        orderWaOts: 0,
      };
    }

    acc[dateKey].webMasuk += Number(curr.webMasuk);
    acc[dateKey].orderWeb += Number(curr.orderWeb);
    acc[dateKey].orderWaOts += Number(curr.orderWaOts);

    return acc;
  }, {});

  const finalGroupedData = Object.values(groupedByDate).map((item: any) => ({
    ...item,
    cr: item.webMasuk > 0 
      ? ((item.orderWeb + item.orderWaOts) / item.webMasuk) * 100 
      : 0
  }));

  const totalLeads = leads.reduce((acc, curr) => acc + curr.webMasuk, 0);
  const totalOrders = leads.reduce((acc, curr) => acc + (curr.orderWeb + curr.orderWaOts), 0);
  const avgCR = totalLeads > 0 ? ((totalOrders / totalLeads) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 pb-10">
      {/* 1. HEADER - Stack on Mobile, Row on Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 tracking-tight">Conversion Intelligence</h1>
          <p className="text-xs lg:text-sm text-gray-400 font-medium">Real-time performance monitoring</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          <Upload size={16} /> Upload PDF
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" />
      </div>

      {/* 2. STAT CARDS - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="Total Leads" value={totalLeads} sub="TOTAL WEB MASUK" icon={<Users />} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard title="Conversion Rate" value={`${avgCR}%`} sub="AVG CLOSING" icon={<TrendingUp />} color="text-green-600" bg="bg-green-50" />
        <StatCard title="Order Web" value={leads.reduce((a,b)=>a+b.orderWeb,0)} sub="MAIN SOURCE" icon={<ShoppingBag />} color="text-orange-600" bg="bg-orange-50" />
        <StatCard title="Order WA/OTS" value={leads.reduce((a,b)=>a+b.orderWaOts,0)} sub="DIRECT CHANNELS" icon={<MessageCircle />} color="text-blue-600" bg="bg-blue-50" />
      </div>

      {/* 3. CHARTS - Stack on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm h-[350px] lg:h-[400px]">
          <div className="flex flex-col sm:flex-row justify-between mb-6 gap-2">
            <h3 className="font-bold text-gray-800 text-sm lg:text-base">Daily Trend Analysis</h3>
            <div className="flex flex-wrap gap-3 text-[9px] lg:text-[10px] font-bold text-gray-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"/> ORDER WEB</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> ORDER WA/OTS</span>
            </div>
          </div>
          <div className="h-full w-full" style={{ height: '75%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalGroupedData}>
                <defs>
                  <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorWa" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="linear" dataKey="orderWeb" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorWeb)" name="Order Web" />
                <Area type="linear" dataKey="orderWaOts" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWa)" name="Order WA/OTS" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm h-[350px] lg:h-[400px]">
          <h3 className="font-bold text-gray-800 mb-6 text-sm lg:text-base">Daily Closing Rate (%)</h3>
          <div className="h-full w-full" style={{ height: '75%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalGroupedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "Closing Rate"]} />
                <Bar dataKey="cr" radius={[6, 6, 0, 0]} barSize={30}>
                  {finalGroupedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cr > 15 ? '#6366f1' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. TABLE - Horizontal Scroll for Mobile */}
      <div className="bg-white rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-gray-800">Daily Performance Monitoring</h3>
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
            {finalGroupedData.length} Days Recorded
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
                <tr><td colSpan={6} className="text-center py-10"><Loader2 className="animate-spin inline mr-2 text-indigo-600"/> Menghitung data...</td></tr>
              ) : finalGroupedData.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Tidak ada data leads.</td></tr>
              ) : [...finalGroupedData].reverse().map((item, index) => (
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

function StatCard({ title, value, sub, icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 lg:p-6 rounded-2xl lg:rounded-[28px] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl lg:text-3xl font-black text-gray-900 mt-2">{value}</p>
          <p className={`text-[9px] lg:text-[10px] font-bold mt-1 uppercase ${color}`}>{sub}</p>
        </div>
        <div className={`p-2.5 lg:p-3 rounded-xl lg:rounded-2xl ${bg} ${color}`}>{icon}</div>
      </div>
    </div>
  );
}