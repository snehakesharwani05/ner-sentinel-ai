import React from 'react';

export function KPICard({ title, value, icon: Icon, subtitle, color = 'cyan' }) {
  const colorMap = {
    cyan: '#06b6d4',
    indigo: '#6366f1',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e'
  };

  const accentColor = colorMap[color] || colorMap.cyan;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: `${accentColor}18`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#fff' }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default KPICard;
