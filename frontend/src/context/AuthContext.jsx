import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ner_sentinel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ner_sentinel_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(() => {
    return localStorage.getItem('purvasetu_simulated_offline') === 'true';
  });
  const [isOnline, setIsOnline] = useState(() => {
    if (localStorage.getItem('purvasetu_simulated_offline') === 'true') return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const toggleSimulateOffline = () => {
    const next = !isSimulatedOffline;
    setIsSimulatedOffline(next);
    localStorage.setItem('purvasetu_simulated_offline', String(next));
    const effectiveOnline = next ? false : (typeof navigator !== 'undefined' ? navigator.onLine : true);
    setIsOnline(effectiveOnline);
  };

  useEffect(() => {
    const updateStatus = () => {
      const isSim = localStorage.getItem('purvasetu_simulated_offline') === 'true';
      if (isSim) {
        setIsOnline(false);
      } else {
        setIsOnline(navigator.onLine);
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    window.addEventListener('purvasetu_network_change', updateStatus);

    // Auto-verify stored session token against database
    async function verifySession() {
      const storedToken = localStorage.getItem('ner_sentinel_token');
      if (storedToken && !storedToken.startsWith('mock-') && navigator.onLine && !isSimulatedOffline) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setUser(json.data);
              localStorage.setItem('ner_sentinel_user', JSON.stringify(json.data));
            }
          } else if (res.status === 401 || res.status === 403) {
            // Token expired -> clean logout
            logout();
          }
        } catch (err) {
          console.warn('[AUTH] Session verification deferred (offline or unreachable)');
        }
      }
    }
    verifySession();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('purvasetu_network_change', updateStatus);
    };
  }, [isSimulatedOffline]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Login failed');

      const { user: userData, token: tokenData } = json.data;
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem('ner_sentinel_user', JSON.stringify(userData));
      localStorage.setItem('ner_sentinel_token', tokenData);
      setIsAuthModalOpen(false);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, role = 'citizen', countryCode = '+91', mobileNumber = '', serviceBadgeId = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          country_code: countryCode,
          mobile_number: mobileNumber,
          serviceBadgeId: serviceBadgeId ? serviceBadgeId.trim() : null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.detail || 'Registration failed');

      const { user: userData, token: tokenData } = json.data;
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem('ner_sentinel_user', JSON.stringify(userData));
      localStorage.setItem('ner_sentinel_token', tokenData);
      setIsAuthModalOpen(false);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: `guest-${Date.now()}`,
      name: "Citizen Traveler (Guest)",
      email: "guest.traveler@ner-sentinel.gov.in",
      role: "citizen",
      isGuest: true,
      roleLabel: "Citizen Traveler (Guest)",
      unit: "NER Public Highway Access",
      securityClassification: "RESTRICTED_GUEST_ACCESS",
      permissions: ['route-intelligence']
    };
    setUser(guestUser);
    const mockToken = `guest-token-${Date.now()}`;
    setToken(mockToken);
    localStorage.setItem('ner_sentinel_user', JSON.stringify(guestUser));
    localStorage.setItem('ner_sentinel_token', mockToken);
    setIsAuthModalOpen(false);
    return { success: true, user: guestUser };
  };

  const loginWithPreset = (role) => {
    if (role === 'guest') {
      return loginAsGuest();
    }

    const presets = {
      citizen: {
        id: 105,
        name: "Priya Sharma",
        email: "priya.traveler@gmail.com",
        role: "citizen",
        isGuest: false,
        roleLabel: "Public Traveler / Citizen",
        unit: "NER Public Highway Access",
        permissions: ['dashboard', 'convoy-telematics', 'route-intelligence', 'simulation', 'field-report']
      },
      driver: {
        id: 101,
        name: "Subedar B. K. Sarma",
        email: "sarma.convoy@ner-sentinel.gov.in",
        role: "driver",
        isGuest: false,
        roleLabel: "Field Convoy Driver",
        unit: "BRO Project Vartak",
        permissions: ['dashboard', 'convoy-telematics', 'route-intelligence', 'simulation', 'field-report']
      },
      disaster_mgmt: {
        id: 102,
        name: "Dr. L. Lyngdoh",
        email: "lyngdoh.ndma@ner-sentinel.gov.in",
        role: "disaster_mgmt",
        isGuest: false,
        roleLabel: "NDMA Disaster Response Lead",
        unit: "Shillong Incident Command",
        permissions: ['dashboard', 'convoy-telematics', 'route-intelligence', 'simulation', 'field-report']
      },
      operator: {
        id: 103,
        name: "A. Debbarma",
        email: "debbarma.logistics@ner-sentinel.gov.in",
        role: "operator",
        isGuest: false,
        roleLabel: "North East Logistics Controller",
        unit: "Central NER Dispatch",
        permissions: ['dashboard', 'convoy-telematics', 'route-intelligence', 'simulation', 'field-report']
      },
      admin: {
        id: 100,
        name: "System Administrator",
        email: "admin@ner-sentinel.gov.in",
        role: "admin",
        isGuest: false,
        roleLabel: "Platform Administrator",
        unit: "PurvaSetu Core",
        adminAccess: true,
        permissions: ['dashboard', 'convoy-telematics', 'route-intelligence', 'simulation', 'field-report']
      }
    };

    const selected = presets[role] || presets.citizen;
    setUser(selected);
    const mockToken = `mock-jwt-token-${role}-${Date.now()}`;
    setToken(mockToken);
    localStorage.setItem('ner_sentinel_user', JSON.stringify(selected));
    localStorage.setItem('ner_sentinel_token', mockToken);
    setIsAuthModalOpen(false);
    return { success: true, user: selected };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ner_sentinel_user');
    localStorage.removeItem('ner_sentinel_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isGuest: !!user?.isGuest,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isOnline,
      isSimulatedOffline,
      toggleSimulateOffline,
      login,
      register,
      loginAsGuest,
      loginWithPreset,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
