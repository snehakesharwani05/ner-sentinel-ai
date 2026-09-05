import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import RiskBadge from '../components/RiskBadge';
import {
  Sliders,
  CloudRain,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Activity,
  Navigation,
  Wind,
  Droplets,
  Thermometer,
  Radio,
  CheckCircle2,
  TrendingDown,
  Layers
} from 'lucide-react';
import {
  fetchLocationTelemetry,
  fetchBatchLifelineTelemetry,
  startTelemetryPoller,
  calculateHazardMetrics,
  KEY_LIFELINES
} from '../services/telemetryService';
import { CriticalLifelinesTicker } from '../components/LifelineTicker';

export function Simulation() {
  const [locations, setLocations] = useState([]);
  const [selectedState, setSelectedState] = useState('Arunachal Pradesh');
  const [selectedLocationId, setSelectedLocationId] = useState(21); // Sela Pass default
  const [rainfall, setRainfall] = useState(45);
  const [soilMoisture, setSoilMoisture] = useState(0.28);
  const [jamFactor, setJamFactor] = useState(3.0);
  const [telemetryInfo, setTelemetryInfo] = useState(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [batchTelemetry, setBatchTelemetry] = useState({});
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load locations and start background batch poller
  useEffect(() => {
    async function loadData() {
      const res = await api.getLocations().catch(() => null);
      if (res && res.data && res.data.length > 0) {
        setLocations(res.data);
        const inState = res.data.filter(l => l.state === 'Arunachal Pradesh');
        if (inState.length > 0) {
          setSelectedLocationId(inState[0].id);
        }
      } else {
        // Fallback to built-in lifeline registry
        setLocations(KEY_LIFELINES);
        setSelectedLocationId(KEY_LIFELINES[0].id);
      }
    }
    loadData();

    // Start 15-minute background batch poller for key lifelines
    const cleanupPoller = startTelemetryPoller((data) => {
      setBatchTelemetry(data);
    }, 15 * 60 * 1000);

    return () => cleanupPoller();
  }, []);

  const availableStates = Array.from(new Set(locations.map(l => l.state))).filter(Boolean).sort();
  const stateLocations = locations.filter(l => l.state === selectedState);
  const selectedLocation = locations.find(l => l.id === selectedLocationId || l.id === Number(selectedLocationId)) || locations[0];

  // Fetch Open-Meteo telemetry on Location Change
  const syncTelemetryForLocation = useCallback(async (loc) => {
    if (!loc) return;
    setTelemetryLoading(true);
    try {
      const data = await fetchLocationTelemetry(loc);
      setTelemetryInfo(data);
      // Auto-populate sliders with live telemetry defaults
      setRainfall(data.rainfall24h ?? 0);
      setSoilMoisture(data.soilMoisture ?? 0.22);
      
      // Auto-calculate instant baseline
      const metrics = calculateHazardMetrics({
        rainfall24h: data.rainfall24h ?? 0,
        soilMoisture: data.soilMoisture ?? 0.22,
        trafficFactor: jamFactor,
        altitudeMeters: loc.elevation_m || loc.elevation || 500,
        targetName: loc.name
      });

      setSimResult({
        simulation: {
          target_location: loc.name,
          target_state: loc.state,
          elevation_m: loc.elevation_m || loc.elevation || 500,
          terrain: loc.location_type || 'MOUNTAIN_CORRIDOR',
          simulated_rainfall_mm: data.rainfall24h ?? 0,
          simulated_soil_moisture: data.soilMoisture ?? 0.22,
          simulated_jam_factor: jamFactor
        },
        ml_assessment: {
          predicted_state: metrics.predictedRoadState,
          disaster_risk_score: metrics.rawDisasterScore,
          severity_band: metrics.severityLevel === 'CRITICAL' ? 'High' : (metrics.severityLevel === 'HIGH' ? 'High' : (metrics.severityLevel === 'MODERATE' ? 'Moderate' : 'Low')),
          landslide_probability_pct: metrics.landslideRiskPct,
          capacity_drop_pct: Math.abs(metrics.roadCapacityDegradation),
          operational_directive: metrics.operationalDirective
        },
        route_impact: {
          nodes_in_path: ['Guwahati', loc.name],
          total_distance_km: 180,
          estimated_time_min: 240
        }
      });
    } catch (err) {
      console.warn('[Simulation] Telemetry sync error:', err);
    } finally {
      setTelemetryLoading(false);
    }
  }, [jamFactor]);

  useEffect(() => {
    if (selectedLocation) {
      syncTelemetryForLocation(selectedLocation);
    }
  }, [selectedLocationId]);

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    const locs = locations.filter(l => l.state === newState);
    if (locs.length > 0) {
      setSelectedLocationId(locs[0].id);
    }
  };

  const handleQuickLifelineSelect = (lifeline) => {
    if (lifeline.state) setSelectedState(lifeline.state);
    setSelectedLocationId(lifeline.id);
  };

  // Decoupled Client-Side Hazard Evaluation (No Network Calls on Slider Drags)
  const updateSimulationLocally = useCallback((r, m, j, loc) => {
    const targetLoc = loc || selectedLocation;
    if (!targetLoc) return;

    const alt = Number(targetLoc.elevation_m || targetLoc.elevation || 500);

    const metrics = calculateHazardMetrics({
      rainfall24h: r,
      soilMoisture: m,
      trafficFactor: j,
      altitudeMeters: alt,
      targetName: targetLoc.name
    });

    setSimResult({
      simulation: {
        target_location: targetLoc.name,
        target_state: targetLoc.state || selectedState,
        elevation_m: alt,
        terrain: targetLoc.location_type || 'MOUNTAIN_PASS',
        simulated_rainfall_mm: r,
        simulated_soil_moisture: m,
        simulated_jam_factor: j
      },
      ml_assessment: {
        predicted_state: metrics.predictedRoadState,
        disaster_risk_score: metrics.rawDisasterScore,
        severity_band: metrics.severityLevel === 'CRITICAL' ? 'High' : (metrics.severityLevel === 'HIGH' ? 'High' : (metrics.severityLevel === 'MODERATE' ? 'Moderate' : 'Low')),
        landslide_probability_pct: metrics.landslideRiskPct,
        capacity_drop_pct: Math.abs(metrics.roadCapacityDegradation),
        operational_directive: metrics.operationalDirective
      },
      route_impact: {
        nodes_in_path: ['Guwahati', targetLoc.name],
        total_distance_km: Math.round(alt > 1000 ? 280 : 120),
        estimated_time_min: Math.round(alt > 1000 ? 360 : 150)
      }
    });
  }, [selectedLocation, selectedState]);

  // Recalculate instant metrics locally whenever sliders or location change (zero network overhead)
  useEffect(() => {
    if (selectedLocation) {
      updateSimulationLocally(rainfall, soilMoisture, jamFactor, selectedLocation);
    }
  }, [rainfall, soilMoisture, jamFactor, selectedLocationId]);

  // Explicit Run Button triggers local calculation and optional background log without blocking
  const handleRunSimulation = (e) => {
    e?.preventDefault();
    if (!selectedLocation) return;
    updateSimulationLocally(rainfall, soilMoisture, jamFactor, selectedLocation);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <h1 className="page-title" style={{ color: '#A9573F' }}>
          Hazard Simulation Studio
        </h1>
        <p className="page-subtitle" style={{ color: '#20231F', opacity: 0.8 }}>
          Live Open-Meteo environmental telemetry ingestion, physics-based geotechnical slope failure simulation & capacity degradation stress-testing.
        </p>
      </div>

      {/* INFINITE SMOOTH AUTO-SCROLLING CRITICAL LIFELINES MARQUEE */}
      <CriticalLifelinesTicker
        passes={KEY_LIFELINES.map(item => {
          const batchItem = batchTelemetry[item.id] || batchTelemetry[item.name];
          return {
            id: item.id,
            name: item.name,
            elevation: item.elevation_m || item.elevation || 500,
            temp: batchItem?.temperatureC ?? (item.elevation_m > 3000 ? 4.2 : 24.5),
            rain24h: batchItem?.rainfall24h ?? (item.elevation_m > 3000 ? 18.5 : 12.0),
            state: item.state,
            location_type: item.location_type,
            lat: item.lat,
            lng: item.lng
          };
        })}
        selectedPassId={selectedLocation?.id || selectedLocation?.name}
        onSelectPass={(pass) => {
          const loc = locations.find(l => l.id === pass.id || l.name === pass.name) || pass;
          handleQuickLifelineSelect(loc);
        }}
      />

      <div className="grid-two-col">
        {/* Left Column: Environmental Parameter Controls & Live Open-Meteo Telemetry */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#20231F', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Sliders size={20} color="#30483B" /> Environmental Simulation Controls
            </h3>
            {telemetryInfo && (
              <span style={{
                fontSize: '0.72rem',
                backgroundColor: telemetryInfo.isLive ? 'rgba(22, 163, 74, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                color: telemetryInfo.isLive ? '#15803D' : '#B45309',
                border: `1px solid ${telemetryInfo.isLive ? '#86EFAC' : '#FDE68A'}`,
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle2 size={12} />
                {telemetryInfo.isLive ? 'Live Open-Meteo Telemetry Synced' : 'Cached Offline Telemetry'}
              </span>
            )}
          </div>

          {/* Live Telemetry Sensor Bar */}
          {telemetryInfo && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: '#EDE8DC',
              border: '1px solid #CBD0C0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CloudRain size={16} color="#30483B" />
                <div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.7 }}>24h Rain</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{telemetryInfo.rainfall24h} mm</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Droplets size={16} color="#30483B" />
                <div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.7 }}>Soil Moisture</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{telemetryInfo.soilMoisture.toFixed(2)} m³/m³</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Thermometer size={16} color="#A9573F" />
                <div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.7 }}>Temp / Wind</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{telemetryInfo.temperatureC}°C • {telemetryInfo.windSpeedKmh}k/h</div>
                </div>
              </div>
            </div>
          )}

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
                onChange={(e) => setSelectedLocationId(e.target.value)}
              >
                {stateLocations.map(loc => (
                  <option key={`sim-loc-${loc.id}`} value={loc.id}>
                    {loc.name} - Alt: {loc.elevation_m || loc.elevation || 500}m ({loc.location_type?.replace(/_/g, ' ') || 'Corridor'})
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
                step="5"
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
                max="0.50"
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
                  Traffic Jam / Freight Congestion Factor
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

            <button type="submit" className="btn-primary" disabled={loading || telemetryLoading} style={{ marginTop: '0.5rem' }}>
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
              {loading ? 'Evaluating Geotechnical Physics...' : 'Run Hazard Simulation'}
            </button>
          </form>

          {error && (
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(169, 87, 63, 0.1)', color: '#A9573F', fontSize: '0.85rem', fontWeight: '600' }}>
              {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Geotechnical Assessment & Operational Directive */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#20231F', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <CloudRain size={20} color="#30483B" /> Geotechnical Physics & Risk Impact
            </h3>
            {simResult && (
              <span style={{ fontSize: '0.75rem', background: '#30483B', color: '#FFFFFF', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' }}>
                Elevation & Saturation Calibrated
              </span>
            )}
          </div>

          {simResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* STATUS HEADER CARD */}
              <div style={{
                padding: '1.25rem',
                borderRadius: '12px',
                background: (simResult.ml_assessment.predicted_state === 'CRITICAL_BLOCKED' || simResult.ml_assessment.predicted_state === 'SEVERED_BLOCKED')
                  ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)'
                  : (simResult.ml_assessment.predicted_state === 'RESTRICTED_CONVOY'
                  ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)'
                  : (simResult.ml_assessment.predicted_state === 'MODERATE_CAUTION' || simResult.ml_assessment.predicted_state === 'CAUTION_WET'
                  ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(22, 163, 74, 0.15) 0%, rgba(22, 163, 74, 0.05) 100%)')),
                border: `1.5px solid ${(simResult.ml_assessment.predicted_state === 'CRITICAL_BLOCKED' || simResult.ml_assessment.predicted_state === 'SEVERED_BLOCKED') ? '#DC2626' : (simResult.ml_assessment.predicted_state === 'RESTRICTED_CONVOY' ? '#D97706' : (simResult.ml_assessment.predicted_state === 'MODERATE_CAUTION' || simResult.ml_assessment.predicted_state === 'CAUTION_WET' ? '#CA8A04' : '#16A34A'))}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7 }}>Geotechnical Road State</div>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: (simResult.ml_assessment.predicted_state === 'CRITICAL_BLOCKED' || simResult.ml_assessment.predicted_state === 'SEVERED_BLOCKED') ? '#DC2626' : (simResult.ml_assessment.predicted_state === 'RESTRICTED_CONVOY' ? '#D97706' : (simResult.ml_assessment.predicted_state === 'MODERATE_CAUTION' || simResult.ml_assessment.predicted_state === 'CAUTION_WET' ? '#CA8A04' : '#16A34A'))
                  }}>
                    {simResult.ml_assessment.predicted_state}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#20231F', opacity: 0.8, marginTop: '2px' }}>
                    {simResult.simulation?.target_location} (Alt: {simResult.simulation?.elevation_m || 0}m)
                  </div>
                </div>
                <RiskBadge severity={simResult.ml_assessment.severity_band} score={simResult.ml_assessment.disaster_risk_score} />
              </div>

              {/* GEOTECHNICAL RISK METRICS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', borderRadius: '10px', background: '#EDE8DC', border: '1px solid #CBD0C0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#20231F', opacity: 0.7 }}>
                    {simResult.simulation?.elevation_m >= 600 ? 'Landslide Slope Failure Risk' : 'Urban Inundation / Waterlogging'}
                  </div>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: simResult.ml_assessment.landslide_probability_pct >= 50 ? '#DC2626' : (simResult.ml_assessment.landslide_probability_pct >= 25 ? '#D97706' : '#16A34A')
                  }}>
                    {simResult.ml_assessment.landslide_probability_pct}%
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, simResult.ml_assessment.landslide_probability_pct)}%`,
                      height: '100%',
                      background: simResult.ml_assessment.landslide_probability_pct >= 50 ? '#DC2626' : (simResult.ml_assessment.landslide_probability_pct >= 25 ? '#D97706' : '#16A34A'),
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: '10px', background: '#EDE8DC', border: '1px solid #CBD0C0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#20231F', opacity: 0.7 }}>Road Capacity Degradation</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#20231F' }}>
                    -{simResult.ml_assessment.capacity_drop_pct}%
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, simResult.ml_assessment.capacity_drop_pct)}%`, height: '100%', background: '#B8944A', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>

              {/* OPERATIONAL DIRECTIVE WITH DYNAMIC INTERPOLATION */}
              <div style={{
                padding: '1rem',
                borderRadius: '10px',
                background: '#EDE8DC',
                borderLeft: `4px solid ${(simResult.ml_assessment.predicted_state === 'CRITICAL_BLOCKED' || simResult.ml_assessment.predicted_state === 'SEVERED_BLOCKED') ? '#DC2626' : (simResult.ml_assessment.predicted_state === 'RESTRICTED_CONVOY' ? '#D97706' : (simResult.ml_assessment.predicted_state === 'MODERATE_CAUTION' || simResult.ml_assessment.predicted_state === 'CAUTION_WET' ? '#CA8A04' : '#16A34A'))}`,
                fontSize: '0.88rem',
                color: '#20231F',
                lineHeight: '1.5'
              }}>
                <div style={{
                  fontWeight: '700',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: (simResult.ml_assessment.predicted_state === 'CRITICAL_BLOCKED' || simResult.ml_assessment.predicted_state === 'SEVERED_BLOCKED') ? '#DC2626' : (simResult.ml_assessment.predicted_state === 'RESTRICTED_CONVOY' ? '#D97706' : (simResult.ml_assessment.predicted_state === 'MODERATE_CAUTION' || simResult.ml_assessment.predicted_state === 'CAUTION_WET' ? '#CA8A04' : '#16A34A'))
                }}>
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
              <div>Select environmental parameters on the left and click <strong>'Run Hazard Simulation'</strong> to evaluate live geotechnical impact.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Simulation;