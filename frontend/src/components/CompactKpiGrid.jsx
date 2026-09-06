import React from "react";
import { ShieldCheck, Mountain, CloudRain, Truck } from "lucide-react";

export const CompactKpiGrid = ({ metrics }) => {
  const safeMetrics = {
    mobilityIndex: metrics?.mobilityIndex ?? 94,
    accessibleHubs: metrics?.accessibleHubs ?? 88,
    totalHubs: metrics?.totalHubs ?? 98,
    severedPasses: metrics?.severedPasses ?? 0,
    cautionPasses: metrics?.cautionPasses ?? 0,
    weatherWatchLevel: metrics?.weatherWatchLevel ?? "YELLOW WATCH",
    maxSoilSaturation: metrics?.maxSoilSaturation ?? 0.32,
    activeConvoys: metrics?.activeConvoys ?? 14,
    reroutedConvoys: metrics?.reroutedConvoys ?? 2
  };

  return (
    <div 
      className="grid grid-cols-2 gap-2 w-full max-w-md p-1 bg-[#19221e]/80 backdrop-blur-md rounded-2xl border border-stone-800 shadow-md ml-auto"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '0.5rem',
        width: '100%',
        maxWidth: '28rem',
        padding: '0.35rem',
        backgroundColor: 'rgba(25, 34, 30, 0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        border: '1px solid rgba(68, 79, 74, 0.5)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        marginLeft: 'auto'
      }}
    >
      {/* Card 1: Regional Mobility Index */}
      <div 
        className="flex flex-col justify-between p-2.5 bg-[#232e29] rounded-xl border border-stone-700/60 transition-all hover:border-emerald-500/50"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '0.625rem 0.75rem',
          backgroundColor: '#232e29',
          borderRadius: '0.75rem',
          border: '1px solid rgba(80, 94, 88, 0.6)'
        }}
      >
        <div className="flex items-center justify-between text-stone-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A0AEC0' }}>
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#86EFAC' }}>
            Mobility Index
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" size={14} color="#4ADE80" />
        </div>
        <div className="mt-1" style={{ marginTop: '0.25rem' }}>
          <span className="text-xl font-black tracking-tight text-white" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
            {safeMetrics.mobilityIndex}%
          </span>
          <p className="text-[9px] text-stone-400 truncate mt-0.5" style={{ fontSize: '0.62rem', color: '#9CA3AF', margin: '0.15rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {safeMetrics.accessibleHubs}/{safeMetrics.totalHubs} Hubs Safe
          </p>
        </div>
      </div>

      {/* Card 2: Mountain Passes */}
      <div 
        className="flex flex-col justify-between p-2.5 bg-[#232e29] rounded-xl border border-stone-700/60 transition-all hover:border-amber-500/50"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '0.625rem 0.75rem',
          backgroundColor: '#232e29',
          borderRadius: '0.75rem',
          border: '1px solid rgba(80, 94, 88, 0.6)'
        }}
      >
        <div className="flex items-center justify-between text-stone-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A0AEC0' }}>
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#FCD34D' }}>
            Strategic Passes
          </span>
          <Mountain className="w-3.5 h-3.5 text-amber-400" size={14} color="#FBBF24" />
        </div>
        <div className="mt-1" style={{ marginTop: '0.25rem' }}>
          <span 
            className={`text-sm font-black tracking-tight ${safeMetrics.severedPasses > 0 ? "text-rose-400" : "text-amber-400"}`}
            style={{ fontSize: '0.85rem', fontWeight: 900, color: safeMetrics.severedPasses > 0 ? '#FB7185' : '#FBBF24', lineHeight: 1.1 }}
          >
            {safeMetrics.severedPasses} Severed • {safeMetrics.cautionPasses} Caution
          </span>
          <p className="text-[9px] text-stone-400 truncate mt-0.5" style={{ fontSize: '0.62rem', color: '#9CA3AF', margin: '0.15rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Sela, Sonapur, Paglapahar
          </p>
        </div>
      </div>

      {/* Card 3: IMD Weather Threat Level */}
      <div 
        className="flex flex-col justify-between p-2.5 bg-[#232e29] rounded-xl border border-stone-700/60 transition-all hover:border-sky-500/50"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '0.625rem 0.75rem',
          backgroundColor: '#232e29',
          borderRadius: '0.75rem',
          border: '1px solid rgba(80, 94, 88, 0.6)'
        }}
      >
        <div className="flex items-center justify-between text-stone-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A0AEC0' }}>
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7DD3FC' }}>
            IMD Weather Watch
          </span>
          <CloudRain className="w-3.5 h-3.5 text-sky-400" size={14} color="#38BDF8" />
        </div>
        <div className="mt-1" style={{ marginTop: '0.25rem' }}>
          <span 
            className="text-sm font-black tracking-tight text-amber-300 uppercase truncate"
            style={{ fontSize: '0.82rem', fontWeight: 900, color: '#FDE047', textTransform: 'uppercase', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {safeMetrics.weatherWatchLevel}
          </span>
          <p className="text-[9px] text-stone-400 truncate mt-0.5" style={{ fontSize: '0.62rem', color: '#9CA3AF', margin: '0.15rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Saturation: {safeMetrics.maxSoilSaturation.toFixed(3)} m³/m³
          </p>
        </div>
      </div>

      {/* Card 4: Disaster Convoys Tracked */}
      <div 
        className="flex flex-col justify-between p-2.5 bg-[#232e29] rounded-xl border border-stone-700/60 transition-all hover:border-emerald-500/50"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '0.625rem 0.75rem',
          backgroundColor: '#232e29',
          borderRadius: '0.75rem',
          border: '1px solid rgba(80, 94, 88, 0.6)'
        }}
      >
        <div className="flex items-center justify-between text-stone-400" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A0AEC0' }}>
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#86EFAC' }}>
            Active Convoys
          </span>
          <Truck className="w-3.5 h-3.5 text-emerald-400" size={14} color="#4ADE80" />
        </div>
        <div className="mt-1" style={{ marginTop: '0.25rem' }}>
          <span className="text-xl font-black tracking-tight text-white" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
            {safeMetrics.activeConvoys} Active
          </span>
          <p className="text-[9px] text-stone-400 truncate mt-0.5" style={{ fontSize: '0.62rem', color: '#9CA3AF', margin: '0.15rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {safeMetrics.reroutedConvoys} Rerouted to Bypass
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompactKpiGrid;
