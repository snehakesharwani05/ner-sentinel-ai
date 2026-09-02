import React from 'react';
import { Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

export function AIInsight({ recommendation, title = "Intelligent Route Recommendation" }) {
  if (!recommendation) return null;

  const isAlert = recommendation.includes('CRITICAL') || recommendation.includes('ALERT');

  return (
    <div
      style={{
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        background: isAlert
          ? 'linear-gradient(135deg, rgba(169, 87, 63, 0.15) 0%, rgba(169, 87, 63, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(203, 208, 192, 0.6) 0%, rgba(184, 148, 74, 0.15) 100%)',
        border: `1px solid ${isAlert ? '#A9573F' : '#30483B'}`,
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}
    >
      <div
        style={{
          padding: '10px',
          borderRadius: '12px',
          backgroundColor: isAlert ? 'rgba(169, 87, 63, 0.2)' : 'rgba(48, 72, 59, 0.15)',
          color: isAlert ? '#A9573F' : '#30483B',
          flexShrink: 0
        }}
      >
        {isAlert ? <AlertTriangle size={24} /> : <Cpu size={24} />}
      </div>

      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#20231F', marginBottom: '0.25rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.88rem', color: '#20231F', opacity: 0.85, lineHeight: '1.5' }}>
          {recommendation}
        </div>
      </div>
    </div>
  );
}

export default AIInsight;