import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import MapComponent from '../components/MapComponent';
import RiskBadge from '../components/RiskBadge';
import AIInsight from '../components/AIInsight';
import { mockLocations } from '../data/mockData';
import { Navigation, Clock, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

export function RouteIntelligence() {
  const [locations, setLocations] = useState([]);
  const [originId, setOriginId] = useState(2); // Guwahati default
  const [destId, setDestId] = useState(13);   // Shillong default
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await api.getLocations();
        if (res && res.data) {
          setLocations(res.data);
        } else {
          setLocations(mockLocations);
        }
      } catch (err) {
        setLocations(mockLocations);
      }
    }
    loadLocations();
  }, []);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!originId || !destId || originId === destId) {
      setError('Please select two distinct locations.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.analyzeRoutes(Number(originId), Number(destId));
      if (res && res.data) {
        setAnalysis(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to compute route analysis from backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          Route <span className="gradient-text">Intelligence Engine</span>
        </h1>
        <p className="page-subtitle">
          Compare Fastest vs Hazard-Mitigated Safest routes using backend Dijkstra & A* pathfinders
        </p>
      </div>

      {/* Control Panel: Select Origin & Destination */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAnalyze} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.25rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Origin Location</label>
            <select
              className="form-select"
              value={originId}
              onChange={(e) => setOriginId(Number(e.target.value))}
            >
              {locations.map(loc => (
                <option key={`orig-${loc.id}`} value={loc.id}>
                  {loc.name} ({loc.state}) - {loc.location_type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Destination Location</label>
            <select
              className="form-select"
              value={destId}
              onChange={(e) => setDestId(Number(e.target.value))}
            >
              {locations.map(loc => (
                <option key={`dest-${loc.id}`} value={loc.id}>
                  {loc.name} ({loc.state}) - {loc.location_type}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            <Navigation size={18} />
            {loading ? 'Analyzing...' : 'Analyze Routes'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '1rem', color: '#f87171', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* AI Recommendation Banner */}
          <AIInsight recommendation={analysis.recommendation} />

          {/* Route Comparison Cards */}
          <div className="grid-two-col">
            {/* FASTEST ROUTE CARD */}
            {analysis.fastestRoute ? (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} /> Fastest Route (Dijkstra)
                  </h3>
                  <RiskBadge severity={analysis.fastestRoute.severityBand} score={analysis.fastestRoute.averageRiskScore} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Distance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                      {analysis.fastestRoute.totalDistanceKm} km
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimated Time</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                      {Math.floor(analysis.fastestRoute.totalTransitTimeMin / 60)}h {analysis.fastestRoute.totalTransitTimeMin % 60}m
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Route Path Nodes ({analysis.fastestRoute.nodesCount})
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: '1.6' }}>
                    {analysis.fastestRoute.pathNodes.map(n => n.name).join(' → ')}
                  </div>
                </div>

                {analysis.fastestRoute.hazardsEncountered?.length > 0 && (
                  <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.82rem', color: '#fbbf24' }}>
                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Hazards Encountered: {analysis.fastestRoute.hazardsEncountered.map(h => `${h.highway} (${h.disruption.type})`).join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card" style={{ color: '#f87171', padding: '2rem', textAlign: 'center' }}>
                No accessible fastest route available (Blocked).
              </div>
            )}

            {/* SAFEST ROUTE CARD */}
            {analysis.safestRoute ? (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={20} /> Safest Resilient Route (A*)
                  </h3>
                  <RiskBadge severity={analysis.safestRoute.severityBand} score={analysis.safestRoute.averageRiskScore} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Distance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                      {analysis.safestRoute.totalDistanceKm} km
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimated Time</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                      {Math.floor(analysis.safestRoute.totalTransitTimeMin / 60)}h {analysis.safestRoute.totalTransitTimeMin % 60}m
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Route Path Nodes ({analysis.safestRoute.nodesCount})
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: '1.6' }}>
                    {analysis.safestRoute.pathNodes.map(n => n.name).join(' → ')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ color: '#f87171', padding: '2rem', textAlign: 'center' }}>
                No accessible safest route available (Blocked).
              </div>
            )}
          </div>

          {/* Interactive Map with Active Route Highlight */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Visualized Route Corridor</h3>
            <MapComponent locations={locations} activeRoute={analysis.safestRoute || analysis.fastestRoute} />
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteIntelligence;
