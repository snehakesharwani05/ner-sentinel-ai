import React from 'react';

export interface LifelineNode {
  id: string | number;
  name: string;
  elevation: number;
  temp: number;
  rain24h: number;
  state?: string;
  location_type?: string;
  lat?: number;
  lng?: number;
}

export const DEFAULT_LIFELINE_PASSES: LifelineNode[] = [
  { id: 'sela', name: 'Sela Pass', elevation: 4170, temp: 4.2, rain24h: 18.5, state: 'Arunachal Pradesh' },
  { id: 'sonapur', name: 'Sonapur Tunnel', elevation: 650, temp: 24.6, rain24h: 32.0, state: 'Meghalaya' },
  { id: 'paglapahar', name: 'Paglapahar (NH-29)', elevation: 480, temp: 26.2, rain24h: 12.4, state: 'Nagaland' },
  { id: 'nathula', name: 'Nathu La Pass', elevation: 4310, temp: 1.8, rain24h: 8.2, state: 'Sikkim' },
  { id: 'jorabat', name: 'Jorabat Gateway', elevation: 85, temp: 28.5, rain24h: 4.0, state: 'Assam' },
  { id: 'kohima', name: 'Kohima Ridge', elevation: 1444, temp: 19.4, rain24h: 14.2, state: 'Nagaland' },
  { id: 'aizawl', name: 'Aizawl Ridge', elevation: 1132, temp: 21.0, rain24h: 16.8, state: 'Mizoram' },
  { id: 'gangtok', name: 'Gangtok Corridor', elevation: 1650, temp: 18.2, rain24h: 22.0, state: 'Sikkim' },
  { id: 'imphal', name: 'Imphal Valley', elevation: 786, temp: 25.1, rain24h: 6.5, state: 'Manipur' }
];

export interface LifelineTickerProps {
  passes?: LifelineNode[];
  onSelectPass?: (pass: LifelineNode) => void;
  selectedPassId?: string | number;
}

export const CriticalLifelinesTicker: React.FC<LifelineTickerProps> = ({
  passes = DEFAULT_LIFELINE_PASSES,
  onSelectPass,
  selectedPassId
}) => {
  const activePasses = (passes && passes.length > 0) ? passes : DEFAULT_LIFELINE_PASSES;

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
      {/* Static Left Label with subtle mask */}
      <div
        className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-stone-800 shrink-0 z-10 bg-[#f4f2e9] pr-4 shadow-[6px_0_12px_#f4f2e9]"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontWeight: 800,
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#30483B',
          flexShrink: 0,
          zIndex: 10,
          backgroundColor: '#EDE8DC',
          paddingRight: '1rem',
          borderRight: '1.5px solid rgba(48, 72, 59, 0.25)'
        }}
      >
        <span
          className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-ping mr-1"
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#16A34A',
            marginRight: '4px'
          }}
        />
        <span className="text-emerald-700" style={{ color: '#16A34A', fontWeight: 800 }}>((o))</span>
        <span>Critical Lifelines:</span>
      </div>

      {/* Scrolling Mask Container */}
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
          className="flex items-center space-x-3 w-max lifeline-ticker-track cursor-pointer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: 'max-content',
            cursor: onSelectPass ? 'pointer' : 'default'
          }}
        >
          {/* Duplicate monitored passes array for seamless infinite auto-scroll */}
          {[...activePasses, ...activePasses].map((pass, index) => {
            const isSelected = selectedPassId != null && (selectedPassId === pass.id || selectedPassId === pass.name);

            return (
              <div
                key={`${pass.id}-${index}`}
                onClick={() => onSelectPass && onSelectPass(pass)}
                className={`flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border text-xs whitespace-nowrap shrink-0 hover:border-emerald-600 transition-colors ${
                  isSelected ? 'border-emerald-600 bg-[#30483B] text-white' : 'border-stone-200/90'
                }`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: isSelected ? '#30483B' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#20231F',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '1.5px solid #30483B' : '1px solid #CBD0C0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  fontSize: '0.76rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <span className="font-semibold text-stone-800" style={{ fontWeight: 700, color: isSelected ? '#FFFFFF' : '#20231F' }}>
                  {pass.name}{' '}
                  <span className="text-stone-400 font-normal" style={{ color: isSelected ? 'rgba(255,255,255,0.75)' : '#64748B', fontWeight: 400 }}>
                    ({pass.elevation}m)
                  </span>
                </span>
                <span className="text-stone-300" style={{ color: isSelected ? 'rgba(255,255,255,0.5)' : '#CBD5E0' }}>•</span>
                <span className="text-stone-600 font-medium" style={{ color: isSelected ? '#EDE8DC' : '#4A5048', fontWeight: 600 }}>
                  {(pass.temp ?? 20).toFixed(1)}°C • {(pass.rain24h ?? 0).toFixed(1)}mm
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const LifelineTicker = CriticalLifelinesTicker;
export default CriticalLifelinesTicker;
