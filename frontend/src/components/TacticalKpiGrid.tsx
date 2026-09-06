import React from "react";
import { ShieldCheck, Mountain, CloudRain, Truck } from "lucide-react";

export interface KpiData {
  mobilityIndex: number;
  safeHubs: number;
  totalHubs: number;
  severedPasses: number;
  cautionPasses: number;
  weatherWatch: string;
  soilSaturation: number;
  activeConvoys: number;
  reroutedConvoys: number;
}

interface Props {
  data: KpiData;
}

export const TacticalKpiGrid: React.FC<Props> = ({ data }) => {
  const safeData: KpiData = {
    mobilityIndex: data?.mobilityIndex ?? 94,
    safeHubs: data?.safeHubs ?? 120,
    totalHubs: data?.totalHubs ?? 127,
    severedPasses: data?.severedPasses ?? 0,
    cautionPasses: data?.cautionPasses ?? 0,
    weatherWatch: data?.weatherWatch ?? "YELLOW WATCH",
    soilSaturation: data?.soilSaturation ?? 0.32,
    activeConvoys: data?.activeConvoys ?? 14,
    reroutedConvoys: data?.reroutedConvoys ?? 2
  };

  return (
    <div 
      className="grid grid-cols-2 gap-2.5 p-2 bg-[#141b18]/90 backdrop-blur-md rounded-2xl border border-stone-800/80 shadow-xl max-w-md w-full select-none ml-auto"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "0.625rem",
        padding: "0.5rem",
        backgroundColor: "rgba(20, 27, 24, 0.92)",
        backdropFilter: "blur(12px)",
        borderRadius: "1rem",
        border: "1px solid rgba(41, 53, 47, 0.8)",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
        maxWidth: "28rem",
        width: "100%",
        userSelect: "none",
        marginLeft: "auto"
      }}
    >
      {/* 1. Regional Mobility Index */}
      <div 
        className="flex flex-col justify-between p-2.5 bg-[#1b2420]/80 rounded-xl border border-stone-700/40 hover:border-emerald-500/40 transition-colors"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0.625rem",
          backgroundColor: "rgba(27, 36, 32, 0.85)",
          borderRadius: "0.75rem",
          border: "1px solid rgba(80, 94, 88, 0.4)",
          transition: "border-color 0.2s ease"
        }}
      >
        <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="text-[10px] font-bold tracking-wider text-emerald-400/90 uppercase" style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em", color: "rgba(52, 211, 153, 0.95)", textTransform: "uppercase" }}>
            Mobility Index
          </span>
          <div 
            className="p-1 rounded-md bg-emerald-950/60 border border-emerald-800/50"
            style={{
              padding: "0.25rem",
              borderRadius: "0.375rem",
              backgroundColor: "rgba(6, 78, 59, 0.6)",
              border: "1px solid rgba(6, 95, 70, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" size={14} color="#34D399" />
          </div>
        </div>
        <div className="mt-1" style={{ marginTop: "0.25rem" }}>
          <div className="flex items-baseline space-x-1.5" style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
            <span className="text-xl font-mono font-black text-white" style={{ fontSize: "1.25rem", fontFamily: "monospace", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
              {safeData.mobilityIndex}%
            </span>
            <span 
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#34D399"
              }} 
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 font-medium" style={{ fontSize: "0.62rem", color: "#9CA3AF", marginTop: "0.15rem", fontWeight: 500, margin: "0.15rem 0 0 0" }}>
            {safeData.safeHubs}/{safeData.totalHubs} Hubs Operational
          </p>
        </div>
      </div>

      {/* 2. Strategic Mountain Passes */}
      <div 
        className="flex flex-col justify-between p-2.5 bg-[#1b2420]/80 rounded-xl border border-stone-700/40 hover:border-amber-500/40 transition-colors"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0.625rem",
          backgroundColor: "rgba(27, 36, 32, 0.85)",
          borderRadius: "0.75rem",
          border: "1px solid rgba(80, 94, 88, 0.4)",
          transition: "border-color 0.2s ease"
        }}
      >
        <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="text-[10px] font-bold tracking-wider text-amber-400/90 uppercase" style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em", color: "rgba(251, 191, 36, 0.95)", textTransform: "uppercase" }}>
            Strategic Passes
          </span>
          <div 
            className="p-1 rounded-md bg-amber-950/60 border border-amber-800/50"
            style={{
              padding: "0.25rem",
              borderRadius: "0.375rem",
              backgroundColor: "rgba(120, 53, 15, 0.6)",
              border: "1px solid rgba(146, 64, 14, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Mountain className="w-3.5 h-3.5 text-amber-400" size={14} color="#FBBF24" />
          </div>
        </div>
        <div className="mt-1" style={{ marginTop: "0.25rem" }}>
          <span 
            className={`text-sm font-mono font-bold ${safeData.severedPasses > 0 ? "text-rose-400" : "text-amber-300"}`}
            style={{
              fontSize: "0.82rem",
              fontFamily: "monospace",
              fontWeight: 700,
              color: safeData.severedPasses > 0 ? "#FB7185" : "#FDE047",
              lineHeight: 1.1,
              display: "block"
            }}
          >
            {safeData.severedPasses} Severed • {safeData.cautionPasses} Caution
          </span>
          <p className="text-[10px] text-stone-400 truncate mt-0.5" style={{ fontSize: "0.62rem", color: "#9CA3AF", marginTop: "0.15rem", margin: "0.15rem 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Sela • Sonapur • Paglapahar
          </p>
        </div>
      </div>

      {/* 3. IMD Weather Watch */}
      <div 
        className="flex flex-col justify-between p-2.5 bg-[#1b2420]/80 rounded-xl border border-stone-700/40 hover:border-sky-500/40 transition-colors"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0.625rem",
          backgroundColor: "rgba(27, 36, 32, 0.85)",
          borderRadius: "0.75rem",
          border: "1px solid rgba(80, 94, 88, 0.4)",
          transition: "border-color 0.2s ease"
        }}
      >
        <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="text-[10px] font-bold tracking-wider text-sky-400/90 uppercase" style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em", color: "rgba(56, 189, 248, 0.95)", textTransform: "uppercase" }}>
            IMD Weather Watch
          </span>
          <div 
            className="p-1 rounded-md bg-sky-950/60 border border-sky-800/50"
            style={{
              padding: "0.25rem",
              borderRadius: "0.375rem",
              backgroundColor: "rgba(12, 74, 110, 0.6)",
              border: "1px solid rgba(7, 89, 133, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-400" size={14} color="#38BDF8" />
          </div>
        </div>
        <div className="mt-1" style={{ marginTop: "0.25rem" }}>
          <span 
            className="text-sm font-mono font-bold text-amber-300 uppercase"
            style={{
              fontSize: "0.82rem",
              fontFamily: "monospace",
              fontWeight: 700,
              color: "#FDE047",
              textTransform: "uppercase",
              display: "block",
              lineHeight: 1.1
            }}
          >
            {safeData.weatherWatch}
          </span>
          <p className="text-[10px] text-stone-400 font-mono mt-0.5" style={{ fontSize: "0.62rem", color: "#9CA3AF", fontFamily: "monospace", marginTop: "0.15rem", margin: "0.15rem 0 0 0" }}>
            Saturation: {safeData.soilSaturation.toFixed(3)} m³/m³
          </p>
        </div>
      </div>

      {/* 4. Disaster Convoys Tracked */}
      <div 
        className="flex flex-col justify-between p-2.5 bg-[#1b2420]/80 rounded-xl border border-stone-700/40 hover:border-emerald-500/40 transition-colors"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0.625rem",
          backgroundColor: "rgba(27, 36, 32, 0.85)",
          borderRadius: "0.75rem",
          border: "1px solid rgba(80, 94, 88, 0.4)",
          transition: "border-color 0.2s ease"
        }}
      >
        <div className="flex items-center justify-between" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="text-[10px] font-bold tracking-wider text-emerald-400/90 uppercase" style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em", color: "rgba(52, 211, 153, 0.95)", textTransform: "uppercase" }}>
            Active Convoys
          </span>
          <div 
            className="p-1 rounded-md bg-emerald-950/60 border border-emerald-800/50"
            style={{
              padding: "0.25rem",
              borderRadius: "0.375rem",
              backgroundColor: "rgba(6, 78, 59, 0.6)",
              border: "1px solid rgba(6, 95, 70, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" size={14} color="#34D399" />
          </div>
        </div>
        <div className="mt-1" style={{ marginTop: "0.25rem" }}>
          <div className="flex items-baseline space-x-1.5" style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
            <span className="text-xl font-mono font-black text-white" style={{ fontSize: "1.25rem", fontFamily: "monospace", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
              {safeData.activeConvoys}
            </span>
            <span className="text-xs text-emerald-400 font-bold uppercase" style={{ fontSize: "0.7rem", color: "#34D399", fontWeight: 800, textTransform: "uppercase" }}>
              Active
            </span>
            <span 
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#34D399"
              }} 
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 font-medium" style={{ fontSize: "0.62rem", color: "#9CA3AF", marginTop: "0.15rem", fontWeight: 500, margin: "0.15rem 0 0 0" }}>
            {safeData.reroutedConvoys} Rerouted to Bypass
          </p>
        </div>
      </div>
    </div>
  );
};

export default TacticalKpiGrid;
