import React from 'react';
import { Server, Activity } from 'lucide-react';
import { API_BASE_URL } from '../api/api';

export function Navbar({ systemStatus = 'ONLINE' }) {
  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(237, 232, 220, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#30483B' }}>
          <span style={{ color: '#30483B' }}>NER SENTINEL</span>{' '}
          <span style={{ color: '#A9573F' }}>AI</span>
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#20231F', opacity: 0.6, borderLeft: '1px solid #CBD0C0', paddingLeft: '0.75rem' }}>
          SIH Problem Statement 002
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: '#CBD0C0',
            border: '1px solid rgba(48, 72, 59, 0.2)',
            fontSize: '0.8rem',
            color: '#20231F',
            fontWeight: '600'
          }}
        >
          <div className="pulse-dot" />
          <span>Backend {systemStatus} ({API_BASE_URL.replace('http://', '')})</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;