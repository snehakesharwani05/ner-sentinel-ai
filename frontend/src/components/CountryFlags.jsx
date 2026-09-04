import React from 'react';

/**
 * Clean inline SVG vector flags for international & regional country code selectors
 */

export function IndiaFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect width="24" height="5.33" fill="#FF9933" />
      <rect y="5.33" width="24" height="5.34" fill="#FFFFFF" />
      <rect y="10.67" width="24" height="5.33" fill="#128807" />
      <circle cx="12" cy="8" r="2.2" stroke="#000088" strokeWidth="0.6" fill="none" />
      <circle cx="12" cy="8" r="0.6" fill="#000088" />
    </svg>
  );
}

export function BangladeshFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect width="24" height="16" fill="#006A4E" />
      <circle cx="10.8" cy="8" r="4.5" fill="#F42A41" />
    </svg>
  );
}

export function NepalFlag({ width = 16, height = 16, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M1 2V22H15L7 12H17L1 2Z" fill="#DC143C" stroke="#003893" strokeWidth="1.5" />
      <circle cx="5" cy="8" r="2" fill="#FFFFFF" />
      <circle cx="6" cy="16" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

export function BhutanFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <polygon points="0,0 24,0 0,16" fill="#FFCC00" />
      <polygon points="24,0 24,16 0,16" fill="#FF4E12" />
      <circle cx="12" cy="8" r="3" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

export function MyanmarFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect width="24" height="5.33" fill="#FECB00" />
      <rect y="5.33" width="24" height="5.34" fill="#34B233" />
      <rect y="10.67" width="24" height="5.33" fill="#EA2839" />
      <polygon points="12,3.5 13.5,7.8 17.8,7.8 14.3,10.2 15.6,14.5 12,11.8 8.4,14.5 9.7,10.2 6.2,7.8 10.5,7.8" fill="#FFFFFF" />
    </svg>
  );
}

export function USAFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect width="24" height="16" fill="#B22234" />
      <rect y="1.23" width="24" height="1.23" fill="#FFFFFF" />
      <rect y="3.69" width="24" height="1.23" fill="#FFFFFF" />
      <rect y="6.15" width="24" height="1.23" fill="#FFFFFF" />
      <rect y="8.61" width="24" height="1.23" fill="#FFFFFF" />
      <rect y="11.07" width="24" height="1.23" fill="#FFFFFF" />
      <rect y="13.53" width="24" height="1.23" fill="#FFFFFF" />
      <rect width="10" height="8.6" fill="#3C3B6E" />
      <circle cx="5" cy="4.3" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

export function UKFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.2" />
      <path d="M12 0V16M0 8H24" stroke="#FFFFFF" strokeWidth="4.5" />
      <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="2.5" />
    </svg>
  );
}

export function UAEFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect x="6" width="18" height="5.33" fill="#00732F" />
      <rect x="6" y="5.33" width="18" height="5.34" fill="#FFFFFF" />
      <rect x="6" y="10.67" width="18" height="5.33" fill="#000000" />
      <rect width="6" height="16" fill="#FF0000" />
    </svg>
  );
}

export function SingaporeFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect width="24" height="8" fill="#ED2939" />
      <rect y="8" width="24" height="8" fill="#FFFFFF" />
      <circle cx="5" cy="4" r="2.5" fill="#FFFFFF" />
      <circle cx="5.8" cy="4" r="2.2" fill="#ED2939" />
    </svg>
  );
}

export function AustraliaFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect width="24" height="16" fill="#00008B" />
      <rect width="10" height="7" fill="#012169" />
      <path d="M0 0L10 7M10 0L0 7" stroke="#FFFFFF" strokeWidth="1.2" />
      <path d="M5 0V7M0 3.5H10" stroke="#C8102E" strokeWidth="1" />
      <circle cx="17" cy="5" r="0.8" fill="#FFFFFF" />
      <circle cx="19" cy="8" r="0.8" fill="#FFFFFF" />
      <circle cx="15" cy="11" r="0.8" fill="#FFFFFF" />
      <circle cx="17" cy="12.5" r="0.8" fill="#FFFFFF" />
    </svg>
  );
}

export function GermanyFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect width="24" height="5.33" fill="#000000" />
      <rect y="5.33" width="24" height="5.34" fill="#DD0000" />
      <rect y="10.67" width="24" height="5.33" fill="#FFCE00" />
    </svg>
  );
}

export function JapanFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', border: '1px solid #E2E8F0', ...style }}>
      <rect width="24" height="16" fill="#FFFFFF" />
      <circle cx="12" cy="8" r="4.5" fill="#BC002D" />
    </svg>
  );
}

export function FranceFlag({ width = 20, height = 14, style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', ...style }}>
      <rect width="8" height="16" fill="#002654" />
      <rect x="8" width="8" height="16" fill="#FFFFFF" />
      <rect x="16" width="8" height="16" fill="#ED2939" />
    </svg>
  );
}

export const COUNTRY_DATA = [
  { code: '+91', country: 'India', flagComponent: IndiaFlag },
  { code: '+880', country: 'Bangladesh', flagComponent: BangladeshFlag },
  { code: '+977', country: 'Nepal', flagComponent: NepalFlag },
  { code: '+975', country: 'Bhutan', flagComponent: BhutanFlag },
  { code: '+95', country: 'Myanmar', flagComponent: MyanmarFlag },
  { code: '+1', country: 'USA / Canada', flagComponent: USAFlag },
  { code: '+44', country: 'UK', flagComponent: UKFlag },
  { code: '+971', country: 'UAE', flagComponent: UAEFlag },
  { code: '+65', country: 'Singapore', flagComponent: SingaporeFlag },
  { code: '+61', country: 'Australia', flagComponent: AustraliaFlag },
  { code: '+49', country: 'Germany', flagComponent: GermanyFlag },
  { code: '+81', country: 'Japan', flagComponent: JapanFlag },
  { code: '+33', country: 'France', flagComponent: FranceFlag }
];

export function getCountryFlag(code) {
  const match = COUNTRY_DATA.find(c => c.code === code);
  return match ? match.flagComponent : IndiaFlag;
}
