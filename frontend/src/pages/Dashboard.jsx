import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import KPICard from '../components/KPICard';
import MapComponent from '../components/MapComponent';
import RiskBadge from '../components/RiskBadge';
import { mockKpis, mockLocations, mockDisruptions } from '../data/mockData';
import { MapPin, Route, AlertTriangle, Activity } from 'lucide-react';

export function Dashboard() {
  const [health, setHealth] = useState(null);
  const [locations, setLocations] = useState([]);
  const [disruptions, setDisruptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [healthRes, locsRes, disruptionsRes] = await Promise.all([
          api.getHealth().catch(() => null),
          api.getLocations().catch(() => null),
          api.getDisruptions('active').catch(() => null)
        ]);

        if (healthRes) setHealth(healthRes);
        if (locsRes && locsRes.data) setLocations(locsRes.data);
        else setLocations(mockLocations);

        if (disruptionsRes && disruptionsRes.data) setDisruptions(disruptionsRes.data);
        else setDisruptions(mockDisruptions);
      } catch (err) {
        console.warn('Dashboard backend load warning:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalNodes = health?.database?.nodesCount || locations.length || mockKpis.totalLocations;
  const totalEdges = health?.database?.edgesCount || mockKpis.totalEdges;
  const activeHazardsCount = disruptions.length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title" style={{ color: '#A9573F' }}>
          NER Logistics Control Dashboard
        </h1>
        <p className="page-subtitle" style={{ color: '#20231F', opacity: 0.8 }}>
          Real-time intelligent accessibility monitoring across 8 North Eastern Indian states
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(169, 87, 63, 0.15)', border: '1px solid #A9573F', color: '#20231F', marginBottom: '1.5rem' }}>
          Backend sync notice: {error} (Using cached seed data)
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid-kpi">
        <KPICard
          title="TOTAL NETWORK NODES"
          value={loading ? '...' : totalNodes}
          subtitle="8 States + Siliguri Corridor"
          icon={MapPin}
          color="cyan"
        />
        <KPICard
          title="TOTAL ROAD EDGES"
          value={loading ? '...' : totalEdges}
          subtitle="Bidirectional National Highways"
          icon={Route}
          color="indigo"
        />
        <KPICard
          title="ACTIVE HAZARDS & BLOCKAGES"
          value={loading ? '...' : activeHazardsCount}
          subtitle="Landslides, Floods, Blockages"
          icon={AlertTriangle}
          color="rose"
        />
        <KPICard
          title="BACKEND ENGINE STATUS"
          value={health?.status || 'ONLINE'}
          subtitle={`SQLite WASM | Port 5000`}
          icon={Activity}
          color="emerald"
        />
      </div>

      {/* Main Grid: Map & Disruption Alerts */}
      <div className="grid-two-col">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#20231F' }}>Live Network Graph Map</h3>
            <span style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7 }}>
              {locations.length} Connected Locations
            </span>
          </div>
          <MapComponent locations={locations} disruptions={disruptions} />
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#20231F' }}>Active Disruption Feeds</h3>
            <span style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7 }}>
              Real-time Field Reports
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '420px', overflowY: 'auto' }}>
            {disruptions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#20231F', opacity: 0.6 }}>
                No active disruptions reported on the road network.
              </div>
            ) : (
              disruptions.map(d => (
                <div
                  key={d.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#EDE8DC',
                    border: '1px solid #CBD0C0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#20231F' }}>
                      {d.highway_code || 'Highway'} Segment ({d.origin_name} &rarr; {d.destination_name})
                    </span>
                    <RiskBadge severity={d.severity} />
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#20231F', opacity: 0.85, margin: 0 }}>
                    {d.description || 'Active road hazard impacting transit times.'}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: '#20231F', opacity: 0.6, display: 'flex', gap: '1rem' }}>
                    <span>Type: {d.disruption_type}</span>
                    <span>Status: {d.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;