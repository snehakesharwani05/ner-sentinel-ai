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
  // Dynamic Weather Fields
  hubName?: string;
  temperature?: number;
  precipitationMm?: number;
}

interface Props {
  data: KpiData;
}

export const TacticalKpiGrid: React.FC<Props> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-2.5 p-2 bg-[#141b18]/90 backdrop-blur-md rounded-2xl border border-stone-800/80 shadow-xl max-w-md w-full select-none">
      {/* 1. Mobility Index */}
      <div className="flex flex-col justify-between p-2.5 bg-[#1b2420]/80 rounded-xl border border-stone-700/40 hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-emerald-400/90 uppercase">
            Mobility Index
          </span>
          <div className="p-1 rounded-md bg-emerald-950/60 border border-emerald-800/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400"/>
          </div>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-mono font-black text-white">{data.mobilityIndex}%</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
            {data.safeHubs}/{data.totalHubs} Hubs Operational
          </p>
        </div>
      </div>

      {/* 2. Strategic Passes */}
      <div className="flex flex-col justify-between p-2.5 bg-[#1b2420]/80 rounded-xl border border-stone-700/40 hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-amber-400/90 uppercase">
            Strategic Passes
          </span>
          <div className="p-1 rounded-md bg-amber-950/60 border border-amber-800/50">
            <Mountain className="w-3.5 h-3.5 text-amber-400"/>
          </div>
        </div>
        <div className="mt-1">
          <span className={`text-sm font-mono font-bold ${data.severedPasses > 0 ? "text-rose-400" : "text-amber-300"}`}>
            {data.severedPasses} Severed • {data.cautionPasses} Caution
          </span>
          <p className="text-[10px] text-stone-400 truncate mt-0.5">
            Sela • Sonapur • Paglapahar
          </p>
        </div>
      </div>

      {/* 3. IMD Weather Watch (Live Pinned Hub Feed) */}
      <div className="flex flex-col justify-between p-2.5 bg-[#1b2420]/80 rounded-xl border border-stone-700/40 hover:border-sky-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-sky-400/90 uppercase truncate max-w-[125px]">
            IMD WATCH • {data.hubName || "Hub"}
          </span>
          <div className="p-1 rounded-md bg-sky-950/60 border border-sky-800/50 shrink-0">
            <CloudRain className="w-3.5 h-3.5 text-sky-400"/>
          </div>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-mono font-bold text-amber-300 uppercase">
              {data.weatherWatch}
            </span>
            <span className="font-mono text-xs font-black text-white bg-stone-900/90 px-1.5 py-0.5 rounded border border-stone-700/60">
              {data.temperature !== undefined ? `${Math.round(data.temperature)}°C` : "--°C"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono mt-1">
            <span>Sat: {data.soilSaturation?.toFixed(3) ?? "0.320"} m³/m³</span>
            <span className="text-sky-300 font-semibold">
              {data.precipitationMm !== undefined ? `${data.precipitationMm} mm` : "0.0 mm"} rain
            </span>
          </div>
        </div>
      </div>

      {/* 4. Active Convoys */}
      <div className="flex flex-col justify-between p-2.5 bg-[#1b2420]/80 rounded-xl border border-stone-700/40 hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-emerald-400/90 uppercase">
            Active Convoys
          </span>
          <div className="p-1 rounded-md bg-emerald-950/60 border border-emerald-800/50">
            <Truck className="w-3.5 h-3.5 text-emerald-400"/>
          </div>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-mono font-black text-white">{data.activeConvoys}</span>
            <span className="text-xs text-emerald-400 font-bold uppercase">Active</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
            {data.reroutedConvoys} Rerouted to Bypass
          </p>
        </div>
      </div>
    </div>
  );
};

export default TacticalKpiGrid;
