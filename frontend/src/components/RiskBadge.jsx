import React from 'react';

export function RiskBadge({ severity = 'Low', score }) {
  const getBadgeStyle = (sev) => {
    switch ((sev || '').toLowerCase()) {
      case 'critical':
      case 'critical_blocked':
        return { 
          bg: '#A9573F', 
          text: '#EDE8DC', 
          dot: '#EDE8DC',
          border: '#A9573F' 
        };
      case 'high':
      case 'warning':
        return { 
          bg: '#B8944A', 
          text: '#20231F', 
          dot: '#20231F',
          border: '#B8944A' 
        };
      case 'moderate':
        return { 
          bg: '#CBD0C0', 
          text: '#20231F', 
          dot: '#30483B',
          border: 'rgba(32, 35, 31, 0.15)' 
        };
      case 'low':
      case 'info':
      default:
        return { 
          bg: '#30483B', 
          text: '#EDE8DC', 
          dot: '#EDE8DC',
          border: '#30483B' 
        };
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
          backgroundColor: style.dot
        }}
      />
      {severity.toUpperCase()} {score !== undefined ? `(${score})` : ''}
    </span>
  );
}

export default RiskBadge;