import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RouteIntelligence from './pages/RouteIntelligence';
import Simulation from './pages/Simulation';
import FieldReport from './pages/FieldReport';
import ConvoyTelematics from './pages/ConvoyTelematics';
import LoginScreen from './pages/LoginScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import AIAssistantDrawer from './components/AIAssistantDrawer';

import { LanguageProvider } from './context/LanguageContext';

function AppContent() {
  const { isAuthenticated, user, isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState(() => (user?.isGuest ? 'route-intelligence' : 'dashboard'));

  // Purge legacy dummy storage keys on boot
  React.useEffect(() => {
    try {
      localStorage.removeItem("field_reports");
      localStorage.removeItem("purvasetu_offline_disruptions");
    } catch (e) {}
  }, []);

  // If user is guest, strictly restrict to Route Intelligence
  React.useEffect(() => {
    if (isGuest && activeTab !== 'route-intelligence') {
      setActiveTab('route-intelligence');
    }
  }, [isGuest, activeTab]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleTabChange = (tabId) => {
    if (isGuest && tabId !== 'route-intelligence') {
      return; // Blocked for guests
    }
    setActiveTab(tabId);
  };

  const renderActivePage = () => {
    // Hard security check: guests are strictly locked to Route Intelligence
    if (isGuest) {
      return <RouteIntelligence />;
    }

    switch (activeTab) {
      case 'convoy-telematics':
        return <ConvoyTelematics />;
      case 'route-intelligence':
        return <RouteIntelligence />;
      case 'simulation':
        return <Simulation />;
      case 'field-report':
        return <FieldReport />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} isGuest={isGuest} />
      <div className="main-content">
        <Navbar systemStatus="ONLINE" />
        {renderActivePage()}
      </div>
      <AIAssistantDrawer activeTab={activeTab} />
      <AuthModal />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
