import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, User, Lock, Mail, Truck, AlertOctagon, CheckCircle2, 
  Sparkles, Compass, MapPin, Radio, Users, ChevronRight, Eye, EyeOff,
  Key, ShieldCheck, BadgeCheck, FileText, AlertTriangle, Phone, Globe
} from 'lucide-react';
import RoleSelectDropdown from '../components/RoleSelectDropdown';
import CountryCodeDropdown from '../components/CountryCodeDropdown';
import { 
  PublicCitizenIcon, ConvoyDriverIcon, LogisticsLeadIcon, 
  DisasterMgmtIcon, AdministratorIcon 
} from '../components/RoleIcons';

export function LoginScreen() {
  const { login, register, loginWithPreset, loginAsGuest } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('citizen');
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regMobile, setRegMobile] = useState('');
  const [regBadgeId, setRegBadgeId] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Real-Time Password Strength Computation
  const hasMinLength = regPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(regPassword);
  const hasLowerCase = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword);

  const criteriaMetCount = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;
  const isPasswordStrong = criteriaMetCount === 5;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(loginEmail.trim(), loginPassword);
      if (!res.success) {
        setError(res.error || 'Authentication rejected by Sentinel security gateway.');
      }
    } catch (err) {
      setError(err.message || 'Security service connection timeout.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong) {
      setError('Password policy violation: Please satisfy all 5 security criteria before proceeding.');
      return;
    }

    if (regMobile.trim() && regMobile.replace(/\D/g, '').length < 7) {
      setError('Mobile Number violation: Please provide a valid mobile number (7-15 digits).');
      return;
    }

    setLoading(true);

    try {
      const res = await register(
        regName.trim(),
        regEmail.trim(),
        regPassword,
        regRole,
        regCountryCode,
        regMobile.trim(),
        regBadgeId.trim()
      );
      if (!res.success) {
        setError(res.error || 'Registration rejected.');
      }
    } catch (err) {
      setError(err.message || 'Security registration service unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    loginAsGuest();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#EDE8DC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(48, 72, 59, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(169, 87, 63, 0.08) 0%, transparent 50%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1060px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid rgba(48, 72, 59, 0.2)',
        boxShadow: '0 25px 60px rgba(32, 35, 31, 0.2)',
        overflow: 'hidden'
      }}>
        
        {/* Left Column: Government Mission & Defense Presentation */}
        <div style={{
          backgroundColor: '#30483B',
          color: '#EDE8DC',
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '2rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              letterSpacing: '0.5px'
            }}>
              <Shield size={15} color="#B8944A" /> RESTRICTED • GOVT OF INDIA HIGHWAY COMMAND (SIH 26002)
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.2', margin: '0 0 1rem 0' }}>
              North Eastern Region Sentinel AI
            </h1>
            <p style={{ fontSize: '0.92rem', opacity: 0.88, lineHeight: '1.6', margin: 0 }}>
              Official High-Security Accessibility & Logistics Command Gateway. Real-time satellite integration with ISRO Bhuvan, AIS-140 GPS fleet tracking, and AI disruption intelligence.
            </p>

            {/* Defense Badges */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <ShieldCheck size={20} color="#B8944A" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.88rem', display: 'block' }}>12-Round Bcrypt Salted Security</strong>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Cryptographic credential protection with rate-limited brute-force defense.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Key size={20} color="#B8944A" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.88rem', display: 'block' }}>Role-Based Access Control (RBAC)</strong>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Separated clearance protocols for BRO Drivers, NDMA Leads, and Logistics Controllers.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Compass size={20} color="#B8944A" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.88rem', display: 'block' }}>Zero-Internet Offline Field Tokenization</strong>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Validated cryptographic sessions persist during zero-network mountain crossings.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Citizen Traveler Access */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>Public Citizen / Civilian Traveler?</span>
            <button
              type="button"
              onClick={handleGuestEntry}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#EDE8DC',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Instant Access as Citizen Traveler</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Column: High-Security Interactive Form */}
        <div style={{
          padding: '2.5rem 2.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1.25rem',
          backgroundColor: '#EDE8DC'
        }}>
          <div>
            {/* Tab Switcher */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: 'rgba(48, 72, 59, 0.08)',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '1.25rem'
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
                Register Officer / Citizen
              </button>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#20231F', margin: '0 0 0.35rem 0' }}>
              {tab === 'login' ? 'Officer & Citizen Security Clearance' : 'Create High-Security Sentinel ID'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.75, margin: '0 0 1rem 0' }}>
              {tab === 'login' ? 'Input your registered credentials to establish encrypted session.' : 'Enforcing 8+ char, mixed-case, numeric & symbol security policy.'}
            </p>

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid #EF4444',
                color: '#991B1B',
                fontSize: '0.82rem',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '4px' }}>
                    Official Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      required
                      placeholder="officer@ner-sentinel.gov.in"
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
                        fontWeight: '500',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '4px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
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
                        fontWeight: '500',
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
                        color: '#64748B',
                        padding: 0
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
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(48, 72, 59, 0.2)'
                  }}
                >
                  {loading ? 'Verifying Security Clearance...' : 'Authorize Clearance & Enter'}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '3px' }}>
                    Full Name & Rank
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Major R. K. Thapa / Rahul Das"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '8px 12px 8px 36px',
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '3px' }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type="email"
                        required
                        placeholder="officer@domain.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '8px 10px 8px 32px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD0C0',
                          backgroundColor: '#FFFFFF',
                          color: '#20231F',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '3px' }}>
                      Clearance Role
                    </label>
                    <RoleSelectDropdown value={regRole} onChange={setRegRole} />
                  </div>
                </div>

                {/* Flexible Mobile Number with Country Code Dropdown */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#20231F' }}>
                      Mobile Number (Roadblock SMS / WhatsApp Alerts)
                    </label>
                    <span style={{ fontSize: '0.68rem', color: '#30483B', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldCheck size={12} color="#B8944A" /> 12-Round Bcrypt Salted
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {/* Country Code Selector with Official Flag Indicators */}
                    <CountryCodeDropdown value={regCountryCode} onChange={setRegCountryCode} />

                    {/* Mobile Number Input */}
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Phone size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '8px 10px 8px 30px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD0C0',
                          backgroundColor: '#FFFFFF',
                          color: '#20231F',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {regRole !== 'citizen' && (
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '3px' }}>
                      Departmental Service Badge ID
                    </label>
                    <div style={{ position: 'relative' }}>
                      <BadgeCheck size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        placeholder="e.g. BRO-VARTAK-4912 / NDMA-NER-8821"
                        value={regBadgeId}
                        onChange={(e) => setRegBadgeId(e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '8px 12px 8px 36px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD0C0',
                          backgroundColor: '#FFFFFF',
                          color: '#20231F',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#20231F', display: 'block', marginBottom: '3px' }}>
                    Password (Enforced Complexity)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="e.g. Sentinel@2026Secure"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '8px 36px 8px 36px',
                        borderRadius: '8px',
                        border: `1.5px solid ${isPasswordStrong ? '#10B981' : (regPassword.length > 0 ? '#F59E0B' : '#CBD0C0')}`,
                        backgroundColor: '#FFFFFF',
                        color: '#20231F',
                        fontSize: '0.88rem',
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
                        color: '#64748B',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Real-time Password Strength Criteria Chips */}
                  <div style={{
                    marginTop: '6px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                    fontSize: '0.7rem'
                  }}>
                    <span style={{ color: hasMinLength ? '#047857' : '#94A3B8', fontWeight: hasMinLength ? '700' : '500' }}>
                      {hasMinLength ? '✓' : '○'} 8+ Chars
                    </span>
                    <span style={{ color: (hasUpperCase && hasLowerCase) ? '#047857' : '#94A3B8', fontWeight: (hasUpperCase && hasLowerCase) ? '700' : '500' }}>
                      {(hasUpperCase && hasLowerCase) ? '✓' : '○'} Upper & Lower
                    </span>
                    <span style={{ color: (hasNumber && hasSpecial) ? '#047857' : '#94A3B8', fontWeight: (hasNumber && hasSpecial) ? '700' : '500' }}>
                      {(hasNumber && hasSpecial) ? '✓' : '○'} Num + Symbol
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isPasswordStrong}
                  style={{
                    marginTop: '0.4rem',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: isPasswordStrong ? '#30483B' : '#64748B',
                    color: '#EDE8DC',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: isPasswordStrong ? 'pointer' : 'not-allowed',
                    boxShadow: '0 4px 12px rgba(48, 72, 59, 0.2)'
                  }}
                >
                  {loading ? 'Creating Encrypted Profile...' : 'Register High-Security Profile'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
