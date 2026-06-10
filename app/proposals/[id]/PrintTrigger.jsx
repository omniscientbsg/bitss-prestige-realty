"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PrintTrigger() {
  const searchParams = useSearchParams();
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (searchParams.get("print") === "1") {
      setPrinting(true);
      // Small delay to allow images/fonts to render
      const t = setTimeout(() => {
        window.print();
        setPrinting(false);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  if (!printing) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center no-print"
      style={{ fontFamily: "sans-serif" }}
    >
      <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin mb-4" />
      <p className="text-slate-600 text-lg font-medium">Preparing PDF…</p>
      <p className="text-slate-400 text-sm mt-1">Your save dialog will open shortly</p>
    </div>
  );
}
