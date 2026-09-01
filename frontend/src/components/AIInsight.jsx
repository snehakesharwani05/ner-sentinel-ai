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
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
        border: `1px solid ${isAlert ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}
    >
      <div
        style={{
          padding: '10px',
          borderRadius: '12px',
          backgroundColor: isAlert ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
          color: isAlert ? '#f87171' : '#818cf8',
          flexShrink: 0
        }}
      >
        {isAlert ? <AlertTriangle size={24} /> : <Cpu size={24} />}
      </div>

      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {recommendation}
        </div>
      </div>
    </div>
  );
}

export default AIInsight;
