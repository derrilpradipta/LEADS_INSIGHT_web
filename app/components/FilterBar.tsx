"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const PRESETS = [
  { label: "7 hari terakhir", days: 7 },
  { label: "28 hari terakhir", days: 28 },
  { label: "3 bulan terakhir", days: 90 },
  { label: "6 bulan terakhir", days: 180 },
];

interface FilterValues {
  type: "month" | "range" | null;
  month: number | null;
  year: number | null;
  from: string;
  to: string;
}

interface CompareValues {
  periodA: { from: string; to: string };
  periodB: { from: string; to: string };
}

interface Props {
  onFilter: (values: FilterValues) => void;
  onReset: () => void;
  onCompare?: (values: CompareValues) => void;
  onCompareReset?: () => void;
  showCompare?: boolean; // ← prop baru, default true
}

function subtractDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function FilterBar({ onFilter, onReset, onCompare, onCompareReset, showCompare = true }: Props) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const today = formatDate(new Date());

  // Filter state
  const [activeTab, setActiveTab] = useState<"filter" | "compare">("filter");
  const [filterType, setFilterType] = useState<"month" | "range">("month");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(currentYear);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  // Compare state
  const [comparePreset, setComparePreset] = useState<number | "custom" | null>(null);
  const [customA, setCustomA] = useState({ from: "", to: "" });
  const [customB, setCustomB] = useState({ from: "", to: "" });
  const [compareActive, setCompareActive] = useState(false);

  const handleFilterApply = () => {
    setFilterActive(true);
    if (filterType === "month") {
      onFilter({ type: "month", month, year, from: "", to: "" });
    } else {
      onFilter({ type: "range", month: null, year: null, from, to });
    }
  };

  const handleFilterReset = () => {
    setFilterActive(false);
    setMonth(new Date().getMonth());
    setYear(currentYear);
    setFrom("");
    setTo("");
    onReset();
  };

  const handleCompareApply = () => {
    let periodA = { from: "", to: "" };
    let periodB = { from: "", to: "" };

    if (comparePreset === "custom") {
      periodA = customA;
      periodB = customB;
    } else if (typeof comparePreset === "number") {
      const days = comparePreset;
      periodA = { from: subtractDays(new Date(), days), to: today };
      periodB = { from: subtractDays(new Date(), days * 2), to: subtractDays(new Date(), days + 1) };
    } else return;

    setCompareActive(true);
    onCompare?.({ periodA, periodB });
  };

  const handleCompareReset = () => {
    setCompareActive(false);
    setComparePreset(null);
    setCustomA({ from: "", to: "" });
    setCustomB({ from: "", to: "" });
    onCompareReset?.();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab Header — tab Compare hanya muncul jika showCompare=true */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("filter")}
          className={`px-5 py-3 text-xs font-bold transition-colors ${activeTab === "filter" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
        >
          Filter
        </button>

        {showCompare && (
          <button
            onClick={() => setActiveTab("compare")}
            className={`px-5 py-3 text-xs font-bold transition-colors ${activeTab === "compare" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            Compare
            {compareActive && <span className="ml-2 w-2 h-2 bg-indigo-500 rounded-full inline-block" />}
          </button>
        )}
      </div>

      <div className="p-4">
        {/* FILTER TAB */}
        {activeTab === "filter" && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-bold">
              <button
                onClick={() => setFilterType("month")}
                className={`px-4 py-2 transition-colors ${filterType === "month" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                Per Bulan
              </button>
              <button
                onClick={() => setFilterType("range")}
                className={`px-4 py-2 transition-colors ${filterType === "range" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                Range Tanggal
              </button>
            </div>

            {filterType === "month" && (
              <>
                <div className="flex flex-col gap-1">
                  <select value={month} onChange={e => setMonth(Number(e.target.value))}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <select value={year} onChange={e => setYear(Number(e.target.value))}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </>
            )}

            {filterType === "range" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Dari</label>
                  <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Sampai</label>
                  <input type="date" value={to} onChange={e => setTo(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </>
            )}

            <button onClick={handleFilterApply}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
              <Filter size={14} /> Terapkan
            </button>

            {filterActive && (
              <button onClick={handleFilterReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors">
                <X size={14} /> Reset
              </button>
            )}
          </div>
        )}

        {/* COMPARE TAB — hanya render jika showCompare=true */}
        {showCompare && activeTab === "compare" && (
          <div className="space-y-4">
            <div className="space-y-2">
              {PRESETS.map((preset) => (
                <label key={preset.days} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="compare" value={preset.days}
                    checked={comparePreset === preset.days}
                    onChange={() => setComparePreset(preset.days)}
                    className="accent-indigo-600 w-4 h-4" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 font-medium">
                    {preset.label} vs periode sebelumnya
                  </span>
                </label>
              ))}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="compare" value="custom"
                  checked={comparePreset === "custom"}
                  onChange={() => setComparePreset("custom")}
                  className="accent-indigo-600 w-4 h-4" />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 font-medium">Custom</span>
              </label>
            </div>

            {comparePreset === "custom" && (
              <div className="space-y-3 pl-7">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Periode A — Dari</label>
                    <input type="date" value={customA.from} onChange={e => setCustomA(p => ({ ...p, from: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Periode A — Sampai</label>
                    <input type="date" value={customA.to} onChange={e => setCustomA(p => ({ ...p, to: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-bold">vs.</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Periode B — Dari</label>
                    <input type="date" value={customB.from} onChange={e => setCustomB(p => ({ ...p, from: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Periode B — Sampai</label>
                    <input type="date" value={customB.to} onChange={e => setCustomB(p => ({ ...p, to: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleCompareApply} disabled={comparePreset === null}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Filter size={14} /> Terapkan Compare
              </button>
              {compareActive && (
                <button onClick={handleCompareReset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  <X size={14} /> Reset
                </button>
              )}
            </div>

            {compareActive && (
              <p className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-3 py-2 rounded-xl inline-block">
                Mode Compare aktif — grafik menampilkan 2 periode
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}