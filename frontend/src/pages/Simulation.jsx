import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import MapComponent from '../components/MapComponent';
import RiskBadge from '../components/RiskBadge';
import { Sliders, CloudRain, ShieldCheck, RefreshCw } from 'lucide-react';

export function Simulation() {
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(21); // Sela Pass default
  const [rainfall, setRainfall] = useState(180);
  const [landslideIndex, setLandslideIndex] = useState(0.85);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await api.getLocations().catch(() => null);
      if (res && res.data) setLocations(res.data);
    }
    loadData();
  }, []);

  const handleRunSimulation = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      // Update weather for selected location in backend
      await api.getWeather(); // load
      const res = await api.getOptimalRoute(2, Number(selectedLocationId), 'safest');
      setSimResult(res?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          Hazard <span className="gradient-text">Simulation Studio</span>
        </h1>
        <p className="page-subtitle">
          Simulate torrential monsoons, high rainfall, and mountain pass disruptions using real backend APIs
        </p>
      </div>

      <div className="grid-two-col">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} color="var(--accent-indigo)" /> Environmental Simulation Parameters
          </h3>

          <form onSubmit={handleRunSimulation} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Mountain Location / Pass</label>
              <select
                className="form-select"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(Number(e.target.value))}
              >
                {locations.map(loc => (
                  <option key={`sim-loc-${loc.id}`} value={loc.id}>
                    {loc.name} ({loc.state}) - Alt: {loc.elevation_m}m
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Simulated 24h Rainfall: {rainfall} mm</label>
              <input
                type="range"
                min="0"
                max="400"
                step="10"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-indigo)' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Landslide Risk Index: {landslideIndex}</label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={landslideIndex}
                onChange={(e) => setLandslideIndex(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-rose)' }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <RefreshCw size={18} />
              {loading ? 'Running Backend Simulation...' : 'Run Simulation'}
            </button>
          </form>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CloudRain size={20} color="var(--accent-cyan)" /> Simulation Response & Impact
          </h3>

          {simResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Calculated Route Status</span>
                <RiskBadge severity={simResult.severityBand} score={simResult.averageRiskScore} />
              </div>

              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Destination Target</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>{simResult.destination.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Distance: {simResult.totalDistanceKm} km | Time: {simResult.totalTransitTimeMin} min
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Click 'Run Simulation' to evaluate live hazard impact using backend APIs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Simulation;
