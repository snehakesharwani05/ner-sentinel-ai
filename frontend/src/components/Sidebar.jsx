import React from 'react';
import { LayoutDashboard, Navigation, Sliders, AlertOctagon } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'route-intelligence', label: 'Route Intelligence', icon: Navigation },
    { id: 'simulation', label: 'Hazard Simulation', icon: Sliders },
    { id: 'field-report', label: 'Field Disruption Report', icon: AlertOctagon }
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      <div style={{ padding: '0 0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Navigation
      </div>

      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: isActive ? '#818cf8' : 'var(--text-secondary)',
              fontWeight: isActive ? '700' : '500',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}

export default Sidebar;
