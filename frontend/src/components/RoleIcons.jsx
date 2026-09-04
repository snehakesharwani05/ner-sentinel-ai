import React from 'react';

/**
 * Custom-styled inline SVG icons for NER Sentinel AI Clearance Roles
 */

export function PublicCitizenIcon({ size = 18, color = '#30483B', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 8L22 11M22 11L19 14M22 11H16" stroke="#B8944A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ConvoyDriverIcon({ size = 18, color = '#30483B', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M1 3H15V17H1V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8H19L23 12V17H15V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="2.5" fill="#B8944A" stroke={color} strokeWidth="1.5" />
      <circle cx="18.5" cy="18.5" r="2.5" fill="#B8944A" stroke={color} strokeWidth="1.5" />
      <path d="M5 8H10" stroke="#B8944A" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function LogisticsLeadIcon({ size = 18, color = '#30483B', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M3 21H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M5 21V7L13 3V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 21V11L13 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9H9.01M9 13H9.01M9 17H9.01M16 13H16.01M16 17H16.01" stroke="#B8944A" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="19" cy="5" r="2" fill="#B8944A" />
      <path d="M17.5 6.5L14 9" stroke="#B8944A" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

export function DisasterMgmtIcon({ size = 18, color = '#A9573F', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81442 19.9905C1.98733 20.2939 2.23672 20.5467 2.53771 20.7239C2.83869 20.901 3.1808 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15449C12.6817 2.98587 12.3437 2.89746 12 2.89746C11.6563 2.89746 11.3183 2.98587 11.0188 3.15449C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9V13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill={color} />
      <path d="M17 10L21 6M7 10L3 6" stroke="#B8944A" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AdministratorIcon({ size = 18, color = '#B8944A', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z" fill="rgba(184, 148, 74, 0.12)" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8L13.3 10.6L16.2 11L14.1 13L14.6 15.9L12 14.5L9.4 15.9L9.9 13L7.8 11L10.7 10.6L12 8Z" fill={color} stroke={color} strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  );
}

export const ROLE_OPTIONS = [
  {
    id: 'citizen',
    label: 'Public Citizen',
    badge: 'PUBLIC',
    description: 'Civilians & highway travelers requiring route intelligence',
    icon: PublicCitizenIcon,
    color: '#30483B'
  },
  {
    id: 'driver',
    label: 'Convoy Driver',
    badge: 'TACTICAL',
    description: 'BRO & Armed Forces heavy logistics drivers (AIS-140 GPS)',
    icon: ConvoyDriverIcon,
    color: '#30483B'
  },
  {
    id: 'operator',
    label: 'Logistics Lead',
    badge: 'DISPATCH',
    description: 'Regional corridor controllers & supply distribution chiefs',
    icon: LogisticsLeadIcon,
    color: '#30483B'
  },
  {
    id: 'disaster_mgmt',
    label: 'NDMA / SDRF',
    badge: 'EMERGENCY',
    description: 'Disaster response leads, landslide units & roadblock teams',
    icon: DisasterMgmtIcon,
    color: '#A9573F'
  },
  {
    id: 'admin',
    label: 'Administrator',
    badge: 'CORE CLEARANCE',
    description: 'Full system command clearance (10 Whitelisted HQ Accounts)',
    icon: AdministratorIcon,
    color: '#B8944A'
  }
];
