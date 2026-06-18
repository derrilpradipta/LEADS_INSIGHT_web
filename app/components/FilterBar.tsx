"use client";

import { useState } from "react";
import { X } from "lucide-react";

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
  showCompare?: boolean;
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

  const [activeTab, setActiveTab] = useState<"filter" | "compare">("filter");
  const [filterType, setFilterType] = useState<"month" | "range">("month");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(currentYear);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  const [comparePreset, setComparePreset] = useState<number | "custom" | null>(null);
  const [customA, setCustomA] = useState({ from: "", to: "" });
  const [customB, setCustomB] = useState({ from: "", to: "" });
  const [compareActive, setCompareActive] = useState(false);

  const handleFilterApply = () => {
    // Saling eksklusif — matikan compare kalau filter diaktifkan
    if (compareActive) {
      setCompareActive(false);
      setComparePreset(null);
      setCustomA({ from: "", to: "" });
      setCustomB({ from: "", to: "" });
      onCompareReset?.();
    }
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

    // Saling eksklusif — matikan filter kalau compare diaktifkan
    if (filterActive) {
      setFilterActive(false);
      setMonth(new Date().getMonth());
      setYear(currentYear);
      setFrom("");
      setTo("");
    }

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

  const selectClass = "h-8 border border-gray-200 bg-white px-2.5 text-[13px] text-gray-700 font-medium focus:outline-none focus:border-gray-400 rounded-md transition-colors appearance-none cursor-pointer pr-7";
  const dateClass = "h-8 border border-gray-200 bg-white px-2.5 text-[13px] text-gray-700 font-medium focus:outline-none focus:border-gray-400 rounded-md transition-colors";

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 px-4">
        <button
          onClick={() => setActiveTab("filter")}
          className={`py-3 text-[12px] font-semibold mr-5 border-b-2 transition-colors ${
            activeTab === "filter"
              ? "text-gray-900 border-gray-900"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          Filter
          {filterActive && <span className="ml-1.5 inline-block w-1 h-1 rounded-full bg-blue-500 align-middle" />}
        </button>

        {showCompare && (
          <button
            onClick={() => setActiveTab("compare")}
            className={`py-3 text-[12px] font-semibold border-b-2 transition-colors ${
              activeTab === "compare"
                ? "text-gray-900 border-gray-900"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            Compare
            {compareActive && <span className="ml-1.5 inline-block w-1 h-1 rounded-full bg-blue-500 align-middle" />}
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        {/* ── FILTER TAB ── */}
        {activeTab === "filter" && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Type toggle */}
            <div className="flex items-center gap-0 border border-gray-200 rounded-md overflow-hidden text-[12px] font-semibold">
              <button
                onClick={() => setFilterType("month")}
                className={`px-3 h-8 transition-colors ${
                  filterType === "month" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Per Bulan
              </button>
              <button
                onClick={() => setFilterType("range")}
                className={`px-3 h-8 border-l border-gray-200 transition-colors ${
                  filterType === "range" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Range
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200" />

            {filterType === "month" && (
              <>
                <div className="relative">
                  <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClass}>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▾</span>
                </div>
                <div className="relative">
                  <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClass}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▾</span>
                </div>
              </>
            )}

            {filterType === "range" && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-medium">Dari</span>
                  <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={dateClass} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-medium">Sampai</span>
                  <input type="date" value={to} onChange={e => setTo(e.target.value)} className={dateClass} />
                </div>
              </>
            )}

            <button
              onClick={handleFilterApply}
              className="h-8 px-4 bg-gray-900 text-white text-[12px] font-semibold rounded-md hover:bg-gray-700 transition-colors"
            >
              Terapkan
            </button>

            {filterActive && (
              <button
                onClick={handleFilterReset}
                className="h-8 flex items-center gap-1.5 px-3 text-[12px] font-medium text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={12} /> Reset
              </button>
            )}

            {compareActive && (
              <span className="text-[11px] text-gray-300 italic">
                Mengaktifkan filter akan menonaktifkan compare
              </span>
            )}
          </div>
        )}

        {/* ── COMPARE TAB ── */}
        {showCompare && activeTab === "compare" && (
          <div className="space-y-3">
            {/* Preset chips */}
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => setComparePreset(preset.days)}
                  className={`h-8 px-3.5 rounded-md text-[12px] font-medium border transition-all ${
                    comparePreset === preset.days
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => setComparePreset("custom")}
                className={`h-8 px-3.5 rounded-md text-[12px] font-medium border transition-all ${
                  comparePreset === "custom"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom date picker */}
            {comparePreset === "custom" && (
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16">Periode A</span>
                  <input type="date" value={customA.from} onChange={e => setCustomA(p => ({ ...p, from: e.target.value }))} className={dateClass} />
                  <span className="text-[11px] text-gray-300">–</span>
                  <input type="date" value={customA.to} onChange={e => setCustomA(p => ({ ...p, to: e.target.value }))} className={dateClass} />
                </div>
                <span className="text-[11px] font-bold text-gray-300">vs</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16">Periode B</span>
                  <input type="date" value={customB.from} onChange={e => setCustomB(p => ({ ...p, from: e.target.value }))} className={dateClass} />
                  <span className="text-[11px] text-gray-300">–</span>
                  <input type="date" value={customB.to} onChange={e => setCustomB(p => ({ ...p, to: e.target.value }))} className={dateClass} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={handleCompareApply}
                disabled={comparePreset === null}
                className="h-8 px-4 bg-gray-900 text-white text-[12px] font-semibold rounded-md hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Terapkan Compare
              </button>
              {compareActive && (
                <button
                  onClick={handleCompareReset}
                  className="h-8 flex items-center gap-1.5 px-3 text-[12px] font-medium text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={12} /> Reset
                </button>
              )}
              {compareActive && (
                <span className="text-[11px] text-blue-500 font-medium">
                  ● Membandingkan 2 periode
                </span>
              )}
              {filterActive && (
                <span className="text-[11px] text-gray-300 italic">
                  Mengaktifkan compare akan menonaktifkan filter
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}