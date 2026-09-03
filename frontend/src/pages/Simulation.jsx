import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import RiskBadge from '../components/RiskBadge';
import { Sliders, CloudRain, ShieldCheck, RefreshCw, AlertTriangle, Activity, Navigation, Wind, Droplets } from 'lucide-react';

export function Simulation() {
  const [locations, setLocations] = useState([]);
  const [selectedState, setSelectedState] = useState('Arunachal Pradesh');
  const [selectedLocationId, setSelectedLocationId] = useState(21); // Sela Pass default
  const [rainfall, setRainfall] = useState(240);
  const [soilMoisture, setSoilMoisture] = useState(0.44);
  const [jamFactor, setJamFactor] = useState(4.0);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      const res = await api.getLocations().catch(() => null);
      if (res && res.data && res.data.length > 0) {
        setLocations(res.data);
        const inState = res.data.filter(l => l.state === 'Arunachal Pradesh');
        if (inState.length > 0) setSelectedLocationId(inState[0].id);
      }
    }
    loadData();
  }, []);

  const availableStates = Array.from(new Set(locations.map(l => l.state))).filter(Boolean).sort();
  const stateLocations = locations.filter(l => l.state === selectedState);
  const selectedLocation = locations.find(l => l.id === Number(selectedLocationId));

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    const locs = locations.filter(l => l.state === newState);
    if (locs.length > 0) {
      setSelectedLocationId(locs[0].id);
    }
  };

  const handleRunSimulation = async (e) => {
    e?.preventDefault();
    if (!selectedLocation) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.simulateHazard({
        target_location: selectedLocation.name,
        origin_location: 'Guwahati',
        rainfall_mm: rainfall,
        soil_moisture: soilMoisture,
        jam_factor: jamFactor
      });

      if (res && res.success) {
        setSimResult(res);
      } else {
        throw new Error(res?.error || 'Simulation failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to run AI hazard simulation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title" style={{ color: '#A9573F' }}>
          Hazard Simulation Studio
        </h1>
        <p className="page-subtitle" style={{ color: '#20231F', opacity: 0.8 }}>
          Stress-test mountain passes & supply corridors with torrential monsoon cloudbursts and geotechnical failure simulations
        </p>
      </div>

      <div className="grid-two-col">
        {/* Left Column: Environmental Parameter Controls */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#20231F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} color="#30483B" /> Environmental Simulation Controls
          </h3>

          <form onSubmit={handleRunSimulation} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#20231F', fontWeight: '600' }}>1. Target State</label>
              <select
                className="form-select"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                {availableStates.map(st => (
                  <option key={`sim-st-${st}`} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#20231F', fontWeight: '600' }}>2. Target Mountain Location / Lifeline Pass</label>
              <select
                className="form-select"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(Number(e.target.value))}
              >
                {stateLocations.map(loc => (
                  <option key={`sim-loc-${loc.id}`} value={loc.id}>
                    {loc.name} - Alt: {loc.elevation_m}m ({loc.location_type?.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ color: '#20231F', margin: 0 }}>
                  <CloudRain size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Simulated 24h Rainfall
                </label>
                <span style={{ fontWeight: '700', color: rainfall > 200 ? '#A9573F' : '#30483B' }}>{rainfall} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                style={{ width: '100%', accentColor: rainfall > 200 ? '#A9573F' : '#30483B' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.6 }}>
                <span>0mm (Dry)</span>
                <span>150mm (Heavy)</span>
                <span>300mm+ (Extreme Cloudburst)</span>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ color: '#20231F', margin: 0 }}>
                  <Droplets size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Soil Moisture Saturation Index
                </label>
                <span style={{ fontWeight: '700', color: soilMoisture >= 0.40 ? '#A9573F' : '#30483B' }}>{soilMoisture.toFixed(2)} m³/m³</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.60"
                step="0.01"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#A9573F' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.6 }}>
                <span>0.15 (Dry Ground)</span>
                <span>0.35 (Field Capacity)</span>
                <span>0.45+ (Liquefaction / Slide)</span>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ color: '#20231F', margin: 0 }}>
                  <Activity size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Traffic Jam Factor
                </label>
                <span style={{ fontWeight: '700', color: '#20231F' }}>{jamFactor.toFixed(1)} / 10.0</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="10.0"
                step="0.5"
                value={jamFactor}
                onChange={(e) => setJamFactor(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#B8944A' }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
              {loading ? 'Running AI ML Geotechnical Simulation...' : 'Run Hazard Simulation'}
            </button>
          </form>

          {error && (
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(169, 87, 63, 0.1)', color: '#A9573F', fontSize: '0.85rem', fontWeight: '600' }}>
              {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Machine Learning Evaluation & Operational Directive */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#20231F', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <CloudRain size={20} color="#30483B" /> AI Simulation Response & Impact
            </h3>
            {simResult && (
              <span style={{ fontSize: '0.75rem', background: '#30483B', color: '#FFFFFF', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' }}>
                Random Forest & Gradient Boosting Evaluated
              </span>
            )}
          </div>

          {simResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* STATUS HEADER CARD */}
              <div style={{
                padding: '1.25rem',
                borderRadius: '12px',
                background: simResult.ml_assessment.is_corridor_blocked
                  ? 'linear-gradient(135deg, rgba(169, 87, 63, 0.2) 0%, rgba(169, 87, 63, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(48, 72, 59, 0.15) 0%, rgba(48, 72, 59, 0.05) 100%)',
                border: `1.5px solid ${simResult.ml_assessment.is_corridor_blocked ? '#A9573F' : '#30483B'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7 }}>AI Predicted Road State</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: simResult.ml_assessment.is_corridor_blocked ? '#A9573F' : '#30483B' }}>
                    {simResult.ml_assessment.predicted_state}
                  </div>
                </div>
                <RiskBadge severity={simResult.ml_assessment.severity_band} score={simResult.ml_assessment.disaster_risk_score} />
              </div>

              {/* GEOTECHNICAL RISK METRICS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', borderRadius: '10px', background: '#EDE8DC', border: '1px solid #CBD0C0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#20231F', opacity: 0.7 }}>Landslide Slope Failure Risk</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#A9573F' }}>
                    {simResult.ml_assessment.landslide_probability_pct}%
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${simResult.ml_assessment.landslide_probability_pct}%`, height: '100%', background: '#A9573F', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: '10px', background: '#EDE8DC', border: '1px solid #CBD0C0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#20231F', opacity: 0.7 }}>Road Capacity Degradation</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#20231F' }}>
                    -{simResult.ml_assessment.capacity_drop_pct}%
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${simResult.ml_assessment.capacity_drop_pct}%`, height: '100%', background: '#B8944A', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>

              {/* OPERATIONAL DIRECTIVE */}
              <div style={{
                padding: '1rem',
                borderRadius: '10px',
                background: '#EDE8DC',
                borderLeft: `4px solid ${simResult.ml_assessment.is_corridor_blocked ? '#A9573F' : '#30483B'}`,
                fontSize: '0.88rem',
                color: '#20231F',
                lineHeight: '1.5'
              }}>
                <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', color: simResult.ml_assessment.is_corridor_blocked ? '#A9573F' : '#30483B' }}>
                  <AlertTriangle size={16} /> Operational Disaster Directive
                </div>
                {simResult.ml_assessment.operational_directive}
              </div>

              {/* SIMULATION CORRIDOR DETAILS */}
              <div style={{ padding: '1rem', borderRadius: '10px', background: '#EDE8DC', border: '1px solid #CBD0C0' }}>
                <div style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7, marginBottom: '6px' }}>
                  Corridor Path to Target ({simResult.route_impact.nodes_in_path?.length || 0} nodes):
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#20231F', lineHeight: '1.5' }}>
                  {simResult.route_impact.nodes_in_path?.join(' → ') || 'N/A'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#20231F', opacity: 0.7, marginTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '6px' }}>
                  <span>Distance: {simResult.route_impact.total_distance_km} km</span>
                  <span>Est. Transit: {Math.round(simResult.route_impact.estimated_time_min)} mins ({(simResult.route_impact.estimated_time_min / 60).toFixed(1)} hrs)</span>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#20231F', opacity: 0.6 }}>
              <CloudRain size={42} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
              <div>Select environmental parameters on the left and click <strong>'Run Hazard Simulation'</strong> to evaluate live geotechnical impact and AI machine learning predictions.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Simulation;