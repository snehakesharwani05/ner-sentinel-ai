import React, { useState } from 'react';
import { LayoutDashboard, Navigation, Sliders, AlertOctagon, Truck, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ activeTab, setActiveTab, isGuest }) {
  const { t } = useTranslation();
  const { setIsAuthModalOpen } = useAuth();
  const [restrictedToast, setRestrictedToast] = useState(null);

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard', 'Command Dashboard'), icon: LayoutDashboard },
    { id: 'convoy-telematics', label: t('nav_convoys', 'Convoy Telematics (AIS-140)'), icon: Truck },
    { id: 'route-intelligence', label: t('nav_routes', 'Route Intelligence'), icon: Navigation },
    { id: 'simulation', label: t('nav_simulation', 'Hazard Simulation Studio'), icon: Sliders },
    { id: 'field-report', label: t('nav_field_report', 'Field Incident Report'), icon: AlertOctagon }
  ];

  const handleNavClick = (itemId, itemLabel) => {
    if (isGuest && itemId !== 'route-intelligence') {
      setRestrictedToast(`Guest Clearance Restricted: "${itemLabel}" is reserved for authorized officers. Public guests are granted access exclusively to Route Intelligence.`);
      setTimeout(() => setRestrictedToast(null), 5000);
      return;
    }
    setActiveTab(itemId);
  };

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#EDE8DC',
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div 
          style={{ 
            padding: '0 0.75rem 0.5rem', 
            fontSize: '0.75rem', 
            fontWeight: '700', 
            color: '#20231F', 
            opacity: 0.6,
            textTransform: 'uppercase', 
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{t('brand_title', 'PurvaSetu')}</span>
          {isGuest && (
            <span style={{
              fontSize: '0.62rem',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '800'
            }}>
              GUEST MODE
            </span>
          )}
        </div>

        {/* Restricted Notification Toast */}
        {restrictedToast && (
          <div style={{
            margin: '0 0 0.5rem 0',
            padding: '8px 10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            color: '#991B1B',
            fontSize: '0.72rem',
            lineHeight: '1.4',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px'
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{restrictedToast}</span>
          </div>
        )}

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isRestricted = isGuest && item.id !== 'route-intelligence';

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id, item.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isActive ? '#30483B' : (isRestricted ? 'rgba(0, 0, 0, 0.02)' : 'transparent'),
                color: isActive ? '#EDE8DC' : (isRestricted ? '#94A3B8' : '#20231F'),
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.9rem',
                cursor: isRestricted ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                opacity: isRestricted ? 0.65 : 1,
                transition: 'all 0.15s ease'
              }}
              title={isRestricted ? 'Restricted to registered officers' : item.label}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={isActive ? '#EDE8DC' : (isRestricted ? '#94A3B8' : '#30483B')} />
                <span>{item.label}</span>
              </div>
              {isRestricted && (
                <Lock size={14} color="#94A3B8" />
              )}
            </button>
          );
        })}
      </div>

      {/* Guest Mode Upgrade Box */}
      {isGuest && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #CBD0C0',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#B8944A" />
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#30483B' }}>
              Citizen Guest Session
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B', lineHeight: '1.4' }}>
            You are operating in public route viewer mode. Sign in as an officer to unlock AIS-140 Convoy Tracking & Disaster Control.
          </p>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              padding: '6px 10px',
              backgroundColor: '#30483B',
              color: '#EDE8DC',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.75rem',
              cursor: 'pointer',
              marginTop: '2px'
            }}
          >
            Officer Sign In
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;