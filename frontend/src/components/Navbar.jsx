import React from 'react';
import { Server, Activity } from 'lucide-react';
import { API_BASE_URL } from '../api/api';

export function Navbar({ systemStatus = 'ONLINE' }) {
  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(10, 14, 26, 0.8)',
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
          <span className="gradient-text">NER SENTINEL</span> AI
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderLeft: '1px solid #374151', paddingLeft: '0.75rem' }}>
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
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontSize: '0.8rem',
            color: '#34d399',
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
