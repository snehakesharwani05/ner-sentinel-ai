import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RouteIntelligence from './pages/RouteIntelligence';
import Simulation from './pages/Simulation';
import FieldReport from './pages/FieldReport';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActivePage = () => {
    switch (activeTab) {
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar systemStatus="ONLINE" />
        {renderActivePage()}
      </div>
    </div>
  );
}

export default App;
