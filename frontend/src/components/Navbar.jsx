import React from 'react';
import { Server, Activity, User, LogOut, Shield, Wifi, WifiOff, Globe } from 'lucide-react';
import { API_BASE_URL } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

export function Navbar({ systemStatus = 'ONLINE' }) {
  const { user, isAuthenticated, setIsAuthModalOpen, logout, isOnline } = useAuth();
  const { language, setLanguage, t } = useTranslation();

  const languages = [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'as', label: '🇮🇳 অসমীয়া (Assamese)' },
    { code: 'bn', label: '🇮🇳 বাংলা (Bengali)' },
    { code: 'hi', label: '🇮🇳 हिन्दी (Hindi)' },
    { code: 'mni', label: '🇮🇳 ꯃꯩꯇꯩꯂꯣꯟ (Manipuri)' },
    { code: 'lus', label: '🇮🇳 Mizo ṭawng (Mizo)' },
    { code: 'kha', label: '🇮🇳 Khasi (Meghalaya)' }
  ];

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
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}
    >
      {/* Brand & Problem Statement Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#30483B', margin: 0 }}>
          <span style={{ color: '#30483B' }}>{t('brand_title', 'NER SENTINEL')}</span>{' '}
          <span style={{ color: '#A9573F' }}>AI</span>
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#20231F', opacity: 0.6, borderLeft: '1px solid #CBD0C0', paddingLeft: '0.75rem' }}>
          {t('sub_title', 'Problem Statement 26002')}
        </span>
      </div>

      {/* Right Controls: Multilingual Selector, Online/Offline Pill, Auth User Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        
        {/* Multilingual Selector (Clause h) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#EDE8DC', border: '1.5px solid #30483B', padding: '5px 10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <Globe size={15} color="#30483B" />
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '800',
              color: '#30483B',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code} style={{ backgroundColor: '#FFFFFF', color: '#20231F' }}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Live Network & Zero-Internet Offline Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '9999px',
            backgroundColor: isOnline ? '#CBD0C0' : '#FEF3C7',
            border: `1px solid ${isOnline ? 'rgba(48, 72, 59, 0.2)' : '#F59E0B'}`,
            fontSize: '0.76rem',
            color: isOnline ? '#20231F' : '#B45309',
            fontWeight: '700'
          }}
        >
          {isOnline ? (
            <>
              <div className="pulse-dot" />
              <span>{t('online_satellite', '🟢 Live Satellite (Online)')}</span>
            </>
          ) : (
            <>
              <WifiOff size={13} color="#B45309" />
              <span>{t('offline_mode', '🟡 Offline Field Mode (Local Graph)')}</span>
            </>
          )}
        </div>

        {/* User Authentication Badge / Sign In Button */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user?.isGuest && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#B8944A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(184, 148, 74, 0.3)'
                }}
              >
                <Shield size={12} /> Sign In as Officer
              </button>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '10px',
              background: user?.isGuest ? '#475569' : '#30483B',
              color: '#EDE8DC',
              fontSize: '0.8rem'
            }}>
              <User size={15} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <span style={{ fontWeight: '700', fontSize: '0.78rem' }}>{user.name}</span>
                <span style={{ fontSize: '0.66rem', opacity: 0.85 }}>
                  {user?.isGuest ? 'Public Route Clearance' : (user.roleLabel || user.role?.replace('_', ' '))}
                </span>
              </div>
              <button
                onClick={logout}
                title={t('logout', 'Sign Out')}
                style={{
                  marginLeft: '4px',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 6px',
                  color: '#EDE8DC',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#30483B',
              color: '#EDE8DC',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={14} /> {t('sign_in', 'Officer Sign In / Register')}
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;