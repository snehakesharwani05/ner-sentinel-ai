import React from "react";

export interface LiveIncidentItem {
  id: string | number;
  title: string;
  description: string;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL_BLOCKED" | string;
  category: string;
  source?: string;
  coordinates?: [number, number];
  lat?: number;
  lng?: number;
}

interface Props {
  disruptions: LiveIncidentItem[];
  onSelectIncident?: (incident: LiveIncidentItem) => void;
}

export const DashboardDisruptionTicker: React.FC<Props> = ({ disruptions, onSelectIncident }) => {
  // 1. Clear / Nominal Corridor State
  if (!disruptions || disruptions.length === 0) {
    return (
      <div 
        className="flex items-center w-full bg-[#f4f2e9] text-gray-800 rounded-xl px-4 py-2 border border-stone-300 shadow-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          backgroundColor: '#EDE8DC',
          color: '#20231F',
          borderRadius: '12px',
          padding: '0.65rem 1rem',
          border: '1px solid #CBD0C0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '1.25rem'
        }}
      >
        <div 
          className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-emerald-700 shrink-0"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 800,
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#16A34A',
            flexShrink: 0
          }}
        >
          <span 
            className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#16A34A'
            }}
          />
          <span>((O)) ALL LIFELINES NOMINAL:</span>
        </div>
        <p 
          className="ml-3 text-xs text-stone-600 font-medium truncate"
          style={{
            marginLeft: '0.75rem',
            fontSize: '0.78rem',
            color: '#4A5048',
            fontWeight: 600,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          Zero active roadblocks or hazardous weather alerts reported across monitored North Eastern Region corridors.
        </p>
      </div>
    );
  }

  // 2. Active Disruptions Marquee State
  return (
    <div 
      className="relative flex items-center w-full bg-[#f4f2e9] text-gray-900 rounded-xl px-4 py-2 border border-stone-300 shadow-sm overflow-hidden select-none"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#EDE8DC',
        color: '#20231F',
        borderRadius: '12px',
        padding: '0.65rem 1rem',
        border: '1px solid #CBD0C0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        userSelect: 'none',
        marginBottom: '1.25rem'
      }}
    >
      {/* Sticky Left Label Header */}
      <div 
        className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-rose-800 shrink-0 z-10 bg-[#f4f2e9] pr-4 shadow-[8px_0_12px_#f4f2e9]"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontWeight: 800,
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#991B1B',
          flexShrink: 0,
          zIndex: 10,
          backgroundColor: '#EDE8DC',
          paddingRight: '1rem',
          borderRight: '1.5px solid rgba(153, 27, 27, 0.2)'
        }}
      >
        <span 
          className="w-2 h-2 rounded-full bg-rose-600 animate-ping"
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#DC2626'
          }}
        />
        <span className="text-rose-600" style={{ color: '#DC2626' }}>((O))</span>
        <span>LIVE DISRUPTIONS ({disruptions.length}):</span>
      </div>

      {/* Continuous Autoscroll Marquee Track */}
      <div 
        className="flex-1 overflow-hidden relative lifeline-ticker-mask"
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
          marginLeft: '1rem'
        }}
      >
        <div 
          className="flex items-center space-x-3 w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer lifeline-ticker-track"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: 'max-content',
            cursor: onSelectIncident ? 'pointer' : 'default'
          }}
        >
          {[...disruptions, ...disruptions].map((item, idx) => {
            const isCritical = item.severity === "CRITICAL_BLOCKED" || item.severity === "critical_blocked";
            const isHigh = item.severity === "HIGH" || item.severity === "high";

            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => onSelectIncident?.(item)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg border text-xs whitespace-nowrap shrink-0 transition-colors shadow-2xs ${
                  isCritical
                    ? "bg-rose-50 border-rose-300 hover:border-rose-500"
                    : isHigh
                    ? "bg-amber-50 border-amber-300 hover:border-amber-500"
                    : "bg-white border-stone-200 hover:border-stone-400"
                }`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: isCritical ? '#FEF2F2' : isHigh ? '#FFFBEB' : '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: isCritical ? '1.5px solid #FCA5A5' : isHigh ? '1.5px solid #FCD34D' : '1px solid #CBD0C0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  fontSize: '0.76rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Severity Pill */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isCritical
                      ? "bg-rose-700 text-white"
                      : isHigh
                      ? "bg-amber-600 text-white"
                      : "bg-stone-600 text-white"
                  }`}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    backgroundColor: isCritical ? '#991B1B' : isHigh ? '#D97706' : '#4B5563',
                    color: '#FFFFFF'
                  }}
                >
                  {isCritical ? "BLOCKED" : isHigh ? "HEAVY DELAY" : "CAUTION"}
                </span>

                {/* Corridor Title */}
                <span className="font-semibold text-stone-900" style={{ fontWeight: 700, color: '#20231F' }}>
                  {item.title}
                </span>

                <span className="text-stone-300" style={{ color: '#CBD5E0' }}>•</span>

                {/* Live Sensor Event Summary */}
                <span 
                  className="text-stone-600 font-medium truncate max-w-xs"
                  style={{
                    color: '#4A5048',
                    fontWeight: 500,
                    maxWidth: '320px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardDisruptionTicker;
