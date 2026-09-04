import React from 'react';

const DEFAULT_LIFELINE_ITEMS = [
  {
    passName: 'Sela Pass (NH-13 / 4,170m)',
    statusText: 'Slurry / 1-Way (BRO Dozers Standby)',
    statusColor: 'bg-[#A9573F]',
    colorHex: '#A9573F'
  },
  {
    passName: 'Sonapur Tunnel (NH-6)',
    statusText: 'Mud Accumulation (Piloted Queue)',
    statusColor: 'bg-[#B8944A]',
    colorHex: '#B8944A'
  },
  {
    passName: 'Paglapahar (NH-29)',
    statusText: 'Sinking Zone (Speed Cap 20 km/h)',
    statusColor: 'bg-[#B8944A]',
    colorHex: '#B8944A'
  },
  {
    passName: '29th Mile Teesta (NH-10)',
    statusText: 'River Surge (Divert via NH-717A)',
    statusColor: 'bg-[#A9573F]',
    colorHex: '#A9573F'
  },
  {
    passName: 'Haflong Jatinga (NH-27)',
    statusText: 'Single-Lane Heavy Escort',
    statusColor: 'bg-[#30483B]',
    colorHex: '#30483B'
  },
  {
    passName: 'Nathu La Pass (4,310m)',
    statusText: 'Freezing Fog (Defense Convoys Only)',
    statusColor: 'bg-[#30483B]',
    colorHex: '#30483B'
  }
];

export function LifelineTicker({ items = DEFAULT_LIFELINE_ITEMS }) {
  const activeItems = (items && items.length > 0) ? items : DEFAULT_LIFELINE_ITEMS;

  return (
    <div
      className="flex items-center bg-[#E5E9E1] text-[#2D3748] rounded-xl px-4 py-2 border border-[#CBD5E0] shadow-sm overflow-hidden select-none"
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#E5E9E1',
        color: '#2D3748',
        borderRadius: '12px',
        padding: '0.65rem 1rem',
        border: '1px solid #CBD5E0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        userSelect: 'none',
        marginBottom: '1.25rem'
      }}
    >
      {/* Fixed Left Badge */}
      <div
        className="flex items-center gap-2 pr-4 border-r border-[#A0AEC0] shrink-0 z-10 font-semibold text-[#8C4A32] text-sm tracking-wide"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          paddingRight: '1rem',
          borderRight: '1.5px solid #A0AEC0',
          flexShrink: 0,
          zIndex: 10,
          fontWeight: 700,
          color: '#8C4A32',
          fontSize: '0.85rem',
          letterSpacing: '0.04em',
          backgroundColor: '#E5E9E1'
        }}
      >
        <span role="img" aria-label="mountain">⛰️</span>
        <span>KEY LIFELINES:</span>
      </div>

      {/* Scrolling Track with Gradient Mask */}
      <div
        className="relative flex overflow-hidden w-full ml-4 lifeline-ticker-mask ticker-track-hover [mask-image:_linear-gradient(to_right,transparent_0,_black_24px,_black_calc(100%-24px),transparent_100%)]"
        style={{
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
          width: '100%',
          marginLeft: '1rem'
        }}
      >
        <div
          className="flex gap-8 shrink-0 animate-marquee hover:[animation-play-state:paused] items-center text-xs md:text-sm"
          style={{
            display: 'flex',
            gap: '2.5rem',
            flexShrink: 0,
            alignItems: 'center',
            fontSize: '0.82rem'
          }}
        >
          {/* Duplicate items for infinite seamless scroll */}
          {[...activeItems, ...activeItems].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 whitespace-nowrap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap'
              }}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${item.statusColor || 'bg-amber-600'}`}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: item.colorHex || (item.statusColor?.includes('#') ? undefined : '#B8944A')
                }}
              />
              <span className="font-semibold text-gray-800" style={{ fontWeight: '700', color: '#20231F' }}>
                {item.passName}:
              </span>
              <span className="text-gray-600" style={{ color: '#4A5048' }}>
                {item.statusText}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LifelineTicker;
