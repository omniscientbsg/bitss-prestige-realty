"use client";
import { useEffect, useState } from "react";

export default function PrintTrigger({ shouldPrint, clientName }) {
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (shouldPrint) {
      setPrinting(true);
      const t = setTimeout(() => {
        window.print();
        setPrinting(false);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [shouldPrint]);

  return (
    <>
      {/* Auto-print spinner (screen only) */}
      {printing && (
        <div
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center no-print"
          style={{ fontFamily: "sans-serif" }}
        >
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 text-lg font-medium">Preparing PDF…</p>
          <p className="text-slate-400 text-sm mt-1">Your save dialog will open shortly</p>
        </div>
      )}

      {/* Toolbar — screen only */}
      <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-semibold tracking-widest text-xs uppercase">BITSS Prestige Realty</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 text-sm">Investment Proposal for {clientName}</span>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-5 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Save as PDF
        </button>
      </div>
    </>
  );
}
