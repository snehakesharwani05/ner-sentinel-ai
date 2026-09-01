import React from 'react';

export function RiskBadge({ severity = 'Low', score }) {
  const getBadgeStyle = (sev) => {
    switch ((sev || '').toLowerCase()) {
      case 'critical':
      case 'critical_blocked':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
      case 'high':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
      case 'moderate':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)' };
      case 'low':
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
    }
  };

  const style = getBadgeStyle(severity);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '0.78rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.text
        }}
      />
      {severity.toUpperCase()} {score !== undefined ? `(${score})` : ''}
    </span>
  );
}

export default RiskBadge;
