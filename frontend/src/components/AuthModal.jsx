import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Mail, Truck, AlertOctagon, CheckCircle2, X, Sparkles, Eye, EyeOff, Phone, Globe, ShieldCheck } from 'lucide-react';
import RoleSelectDropdown from './RoleSelectDropdown';
import CountryCodeDropdown from './CountryCodeDropdown';
import { 
  PublicCitizenIcon, ConvoyDriverIcon, LogisticsLeadIcon, 
  DisasterMgmtIcon, AdministratorIcon 
} from './RoleIcons';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, loginWithPreset } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('citizen');
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regMobile, setRegMobile] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(loginEmail.trim(), loginPassword);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await register(
        regName.trim(),
        regEmail.trim(),
        regPassword,
        regRole,
        regCountryCode,
        regMobile.trim()
      );
      if (!res.success) {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(32, 35, 31, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#EDE8DC',
        borderRadius: '20px',
        border: '1.5px solid #30483B',
        boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
        padding: '2rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(48, 72, 59, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#20231F'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#30483B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EDE8DC'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#20231F' }}>
              NER Sentinel AI
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.75 }}>
              Authentication & Security Terminal
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'rgba(48, 72, 59, 0.1)',
          borderRadius: '10px',
          padding: '4px'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            style={{
              padding: '9px',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'login' ? '#30483B' : 'transparent',
              color: tab === 'login' ? '#EDE8DC' : '#20231F',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            style={{
              padding: '9px',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'register' ? '#30483B' : 'transparent',
              color: tab === 'register' ? '#EDE8DC' : '#20231F',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Register Profile
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#991B1B',
            fontSize: '0.82rem',
            fontWeight: '600'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD0C0',
                    backgroundColor: '#FFFFFF',
                    color: '#20231F',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD0C0',
                    backgroundColor: '#FFFFFF',
                    color: '#20231F',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '11px',
                borderRadius: '10px',
                backgroundColor: '#30483B',
                color: '#EDE8DC',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '4px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD0C0',
                    backgroundColor: '#FFFFFF',
                    color: '#20231F',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  required
                  placeholder="priya@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD0C0',
                    backgroundColor: '#FFFFFF',
                    color: '#20231F',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Mobile Number & Country Code */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#20231F' }}>
                  Mobile Number (Emergency Alerts)
                </label>
                <span style={{ fontSize: '0.68rem', color: '#30483B', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={12} color="#B8944A" /> 12-Round Bcrypt
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <CountryCodeDropdown value={regCountryCode} onChange={setRegCountryCode} />
                <div style={{ position: 'relative', flex: 1 }}>
                  <Phone size={15} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="tel"
                    placeholder="98620 44912"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value.replace(/[^\d\s-]/g, ''))}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 10px 9px 30px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD0C0',
                      backgroundColor: '#FFFFFF',
                      color: '#20231F',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD0C0',
                    backgroundColor: '#FFFFFF',
                    color: '#20231F',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '4px' }}>
                Clearance Role
              </label>
              <RoleSelectDropdown value={regRole} onChange={setRegRole} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '11px',
                borderRadius: '10px',
                backgroundColor: '#30483B',
                color: '#EDE8DC',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
