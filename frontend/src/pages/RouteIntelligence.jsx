import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import MapComponent from '../components/MapComponent';
import RiskBadge from '../components/RiskBadge';
import AIInsight from '../components/AIInsight';
import { mockLocations } from '../data/mockData';
import { Navigation, Clock, ShieldAlert, AlertTriangle, ArrowRight, Fuel, Zap, MapPin, WifiOff, Globe2, Cpu } from 'lucide-react';
import { offlineEngine } from '../utils/offlineEngine';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

export function RouteIntelligence() {
  const { t } = useTranslation();
  const { isOnline, isSimulatedOffline, toggleSimulateOffline } = useAuth();
  const [locations, setLocations] = useState([]);
  const [originState, setOriginState] = useState('Assam');
  const [originId, setOriginId] = useState(2); // Guwahati default
  const [destState, setDestState] = useState('Meghalaya');
  const [destId, setDestId] = useState(12);   // Shillong default
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await api.getLocations();
        if (res && res.data && res.data.length > 0) {
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

  // Extract unique sorted states
  const availableStates = Array.from(new Set(locations.map(l => l.state))).filter(Boolean).sort();

  // Filter locations by selected state
  const originLocations = locations.filter(l => l.state === originState);
  const destLocations = locations.filter(l => l.state === destState);

  // Handle Origin State change
  const handleOriginStateChange = (newState) => {
    setOriginState(newState);
    const locsInState = locations.filter(l => l.state === newState);
    if (locsInState.length > 0) {
      setOriginId(locsInState[0].id);
    }
  };

  // Handle Destination State change
  const handleDestStateChange = (newState) => {
    setDestState(newState);
    const locsInState = locations.filter(l => l.state === newState);
    if (locsInState.length > 0) {
      setDestId(locsInState[0].id);
    }
  };

  const isLocationValid = (loc) => {
    if (!loc) return false;
    const lat = Number(loc.latitude ?? loc.lat);
    const lng = Number(loc.longitude ?? loc.lng);
    const isValidNumber = !isNaN(lat) && !isNaN(lng) && lat !== null && lng !== null;
    const isNotZero = !(lat === 0 && lng === 0);
    const isInNER = lat >= 20.0 && lat <= 30.0 && lng >= 88.0 && lng <= 98.0;
    return isValidNumber && isNotZero && isInNER;
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!originId || !destId) {
      setError('Please select both Origin and Destination locations.');
      return;
    }

    if (Number(originId) === Number(destId)) {
      setError('Please select two distinct locations.');
      return;
    }

    const origObj = locations.find(l => l.id === Number(originId));
    const destObj = locations.find(l => l.id === Number(destId));

    if (!origObj || !destObj) {
      setError('Selected locations could not be resolved.');
      return;
    }

    if (!isLocationValid(origObj) || !isLocationValid(destObj)) {
      setError('Origin or Destination has invalid or out-of-bounds coordinates.');
      return;
    }

    const origName = origObj.name || "Guwahati";
    const destName = destObj.name || "Silchar";

    // 1. If Offline or in Simulated Offline Mode, immediately execute Autonomous Web Worker engine
    if (!isOnline || isSimulatedOffline) {
      setLoading(true);
      setError(null);
      try {
        const offlineResult = await offlineEngine.calculateDualRoutesAsync(origName, destName);
        if (offlineResult && (offlineResult.fastestRoute || offlineResult.safestRoute)) {
          setAnalysis(offlineResult);
        } else {
          setError('Autonomous offline routing could not calculate a traversable path between these nodes.');
        }
      } catch (offErr) {
        setError(offErr.message || 'Offline pathfinding encountered an issue.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Online Mode: Query backend hybrid engine with seamless offline fallback
    try {
      setLoading(true);
      setError(null);
      const res = await api.analyzeRoutes(Number(originId), Number(destId));
      if (res && res.data) {
        setAnalysis(res.data);
      }
    } catch (err) {
      console.warn('Online routing failed, falling back to autonomous client-side offline graph:', err.message);
      try {
        const offlineResult = await offlineEngine.calculateDualRoutesAsync(origName, destName);
        if (offlineResult && (offlineResult.fastestRoute || offlineResult.safestRoute)) {
          setAnalysis({
            ...offlineResult,
            recommendation: "🟡 Zero-Network Fallback Active: Real-time API unreachable. Route computed autonomously via client-side GeoGraph."
          });
        } else {
          setError(err.message || 'Failed to compute route analysis.');
        }
      } catch (fallbackErr) {
        setError(err.message || 'Failed to compute route analysis.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ color: '#A9573F' }}>
            {t('nav_routes', 'Route Intelligence Engine')}
          </h1>
          <p className="page-subtitle" style={{ color: '#20231F', opacity: 0.8 }}>
            Multi-State Hierarchical Corridor Navigation • Live Satellite & Autonomous Edge GIS Graph
          </p>
        </div>

        {/* Status Tag & Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isOnline ? '#CBD0C0' : '#FEF3C7',
            border: `1.5px solid ${isOnline ? '#30483B' : '#F59E0B'}`,
            color: isOnline ? '#20231F' : '#92400E'
          }}>
            {isOnline ? (
              <>
                <Globe2 size={14} color="#30483B" />
                <span>ONLINE: Live Hybrid Telemetry Engine</span>
              </>
            ) : (
              <>
                <Cpu size={14} color="#92400E" />
                <span>OFFLINE: Autonomous Edge Node Routing</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSimulateOffline}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              border: '1.5px solid #A0AEC0',
              background: isSimulatedOffline ? '#A9573F' : '#EDE8DC',
              color: isSimulatedOffline ? '#FFFFFF' : '#20231F',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <WifiOff size={13} />
            {isSimulatedOffline ? 'Restore Live Online Mode' : 'Test Zero-Internet Mode'}
          </button>
        </div>
      </div>

      {/* Control Panel: State-Wise Cascading Selectors */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            
            {/* ORIGIN STATE & LOCATION */}
            <div style={{ padding: '1rem', background: 'rgba(48, 72, 59, 0.04)', borderRadius: '10px', border: '1px solid rgba(48, 72, 59, 0.15)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#30483B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Navigation size={16} /> 1. {t('origin_point', 'Origin (Starting Point)')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#20231F', fontSize: '0.8rem' }}>Origin State</label>
                  <select
                    className="form-select"
                    value={originState}
                    onChange={(e) => handleOriginStateChange(e.target.value)}
                  >
                    {availableStates.map(st => (
                      <option key={`orig-st-${st}`} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#20231F', fontSize: '0.8rem' }}>Origin City / Location</label>
                  <select
                    className="form-select"
                    value={originId}
                    onChange={(e) => setOriginId(Number(e.target.value))}
                  >
                    {originLocations.map(loc => (
                      <option key={`orig-${loc.id}`} value={loc.id}>
                        {loc.name} {loc.district ? `(${loc.district})` : ''} - {loc.location_type?.replace(/_/g, ' ') || 'hub'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* DESTINATION STATE & LOCATION */}
            <div style={{ padding: '1rem', background: 'rgba(169, 87, 63, 0.04)', borderRadius: '10px', border: '1px solid rgba(169, 87, 63, 0.2)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#A9573F', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ArrowRight size={16} /> 2. {t('dest_point', 'Destination (Target Point)')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#20231F', fontSize: '0.8rem' }}>Destination State</label>
                  <select
                    className="form-select"
                    value={destState}
                    onChange={(e) => handleDestStateChange(e.target.value)}
                  >
                    {availableStates.map(st => (
                      <option key={`dest-st-${st}`} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#20231F', fontSize: '0.8rem' }}>Destination City / Location</label>
                  <select
                    className="form-select"
                    value={destId}
                    onChange={(e) => setDestId(Number(e.target.value))}
                  >
                    {destLocations.map(loc => (
                      <option key={`dest-${loc.id}`} value={loc.id}>
                        {loc.name} {loc.district ? `(${loc.district})` : ''} - {loc.location_type?.replace(/_/g, ' ') || 'hub'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              <Navigation size={18} />
              {loading ? 'Analyzing Real-Time Telemetry...' : t('analyze_corridors', 'Analyze Strategic Corridors')}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ marginTop: '1rem', color: '#A9573F', fontSize: '0.88rem', fontWeight: '600' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#30483B', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Clock size={20} color="#30483B" /> {t('fastest_route', 'Fastest Speed Route')}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(48,72,59,0.12)', color: '#30483B', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                      {t('isro_verified', '🛰️ ISRO Bhuvan Synced')}
                    </span>
                    <RiskBadge severity={analysis.fastestRoute.severityBand} score={analysis.fastestRoute.averageRiskScore} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7 }}>Distance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#20231F' }}>
                      {analysis.fastestRoute.totalDistanceKm} km
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7 }}>Estimated Time</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#20231F' }}>
                      {Math.floor(analysis.fastestRoute.totalTransitTimeMin / 60)}h {analysis.fastestRoute.totalTransitTimeMin % 60}m
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#20231F', opacity: 0.8, marginBottom: '0.5rem' }}>
                    Route Path Nodes ({analysis.fastestRoute.nodesCount})
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#20231F', lineHeight: '1.6' }}>
                    {analysis.fastestRoute.pathNodes.map(n => n.name).join(' → ')}
                  </div>
                </div>

                {analysis.fastestRoute.hazardsEncountered?.length > 0 && (
                  <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#EDE8DC', border: '1px solid #B8944A', fontSize: '0.82rem', color: '#20231F' }}>
                    <AlertTriangle size={14} color="#B8944A" style={{ display: 'inline', marginRight: '6px' }} />
                    Hazards Encountered: {analysis.fastestRoute.hazardsEncountered.map(h => `${h.highway} (${h.disruption.type})`).join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card" style={{ color: '#A9573F', padding: '2rem', textAlign: 'center' }}>
                No accessible fastest route available (Blocked).
              </div>
            )}

            {/* SAFEST ROUTE CARD */}
            {analysis.safestRoute ? (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#30483B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={20} color="#30483B" /> Safest Resilient Route (A*)
                  </h3>
                  <RiskBadge severity={analysis.safestRoute.severityBand} score={analysis.safestRoute.averageRiskScore} />
                </div>

                {(analysis.safestRoute.is_lane_buffered || analysis.safestRoute.buffer_status_tag) && (
                  <div style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', background: '#EFF6FF', border: '1.5px solid #93C5FD', color: '#1E40AF', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🛡️ {analysis.safestRoute.buffer_status_tag || 'Primary Arterial Corridor — Alternate Lane Buffer Applied'}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7 }}>Distance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#20231F' }}>
                      {analysis.safestRoute.totalDistanceKm} km
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7 }}>Estimated Time</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#20231F' }}>
                      {Math.floor(analysis.safestRoute.totalTransitTimeMin / 60)}h {analysis.safestRoute.totalTransitTimeMin % 60}m
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#20231F', opacity: 0.8, marginBottom: '0.5rem' }}>
                    Route Path Nodes ({analysis.safestRoute.nodesCount})
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#20231F', lineHeight: '1.6' }}>
                    {analysis.safestRoute.pathNodes.map(n => n.name).join(' → ')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ color: '#A9573F', padding: '2rem', textAlign: 'center' }}>
                No accessible safest route available (Blocked).
              </div>
            )}
          </div>

          {/* Real-Time Telemetry & AI Model Inference Breakdown */}
          {analysis.safestRoute?.pathSegments?.length > 0 && (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#20231F', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Navigation size={18} color="#30483B" /> Real-Time Corridor Telemetry & AI Predictions
                </h3>
                <span style={{ fontSize: '0.78rem', background: 'rgba(48, 72, 59, 0.15)', color: '#30483B', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
                  Live Feeds: Open-Meteo & TomTom (100% Failover)
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(48, 72, 59, 0.2)', color: '#20231F' }}>
                      <th style={{ padding: '8px 10px' }}>Corridor Segment</th>
                      <th style={{ padding: '8px 10px' }}>Highway</th>
                      <th style={{ padding: '8px 10px' }}>Distance / Time</th>
                      <th style={{ padding: '8px 10px' }}>Live Weather</th>
                      <th style={{ padding: '8px 10px' }}>TomTom Traffic</th>
                      <th style={{ padding: '8px 10px' }}>AI Predicted State</th>
                      <th style={{ padding: '8px 10px' }}>Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.safestRoute.pathSegments.map((seg, idx) => (
                      <tr key={`seg-${idx}`} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.4)' : 'transparent' }}>
                        <td style={{ padding: '10px', fontWeight: '600', color: '#20231F' }}>
                          {seg.from} → {seg.to}
                        </td>
                        <td style={{ padding: '10px', color: '#30483B', fontWeight: '600' }}>
                          {seg.highway || 'NH'}
                        </td>
                        <td style={{ padding: '10px', color: '#20231F' }}>
                          {seg.distanceKm} km ({Math.round(seg.transitTimeMin)}m)
                        </td>
                        <td style={{ padding: '10px', color: '#20231F' }}>
                          {seg.telemetry ? (
                            <div>
                              <span>{seg.telemetry.temperature_c}°C</span> • <span>{seg.telemetry.precipitation_mm || 0}mm rain</span>
                              <div style={{ fontSize: '0.74rem', opacity: 0.7 }}>Soil: {seg.telemetry.soil_moisture || 0.32} m³/m³</div>
                            </div>
                          ) : 'Baseline'}
                        </td>
                        <td style={{ padding: '10px', color: '#20231F' }}>
                          {seg.telemetry ? (
                            <div>
                              <span>{Math.round(seg.telemetry.current_speed_kmh || 45)} km/h</span>
                              <div style={{ fontSize: '0.74rem', opacity: 0.7 }}>Jam Factor: {seg.telemetry.jam_factor || 0.0}/10</div>
                            </div>
                          ) : 'Free Flow'}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: seg.predicted_state === 'CRITICAL_BLOCKED' ? '#A9573F' :
                                       (seg.predicted_state === 'HAZARD_WARNING' ? '#B8944A' :
                                       (seg.predicted_state === 'HEAVY_JAM' ? '#C27D38' :
                                       (seg.predicted_state === 'MODERATE_JAM' ? '#8F9B6E' : '#30483B'))),
                            color: '#FFFFFF'
                          }}>
                            {seg.predicted_state || 'CLEAR'}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontWeight: '700', color: seg.riskScore > 0.5 ? '#A9573F' : (seg.riskScore > 0.25 ? '#B8944A' : '#30483B') }}>
                          {seg.riskScore !== undefined ? seg.riskScore : 0.0} [{seg.severityBand || 'Low'}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* En-Route Refueling Stations & Strategic Fuel Bases */}
          {(analysis.safestRoute?.refueling_stations?.length > 0 || analysis.fastestRoute?.refueling_stations?.length > 0) && (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#20231F', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Fuel size={18} color="#B8944A" /> En-Route Refueling & Fuel Staging Bases
                </h3>
                <span style={{ fontSize: '0.78rem', background: '#30483B', color: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                  {(analysis.safestRoute?.refueling_stations || analysis.fastestRoute?.refueling_stations || []).length} Verified Fuel Points Along Route
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {(analysis.safestRoute?.refueling_stations || analysis.fastestRoute?.refueling_stations || []).map((st, idx) => (
                  <div
                    key={`rf-${st.id || idx}`}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      background: '#EDE8DC',
                      border: '1px solid #CBD0C0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#30483B', textTransform: 'uppercase' }}>
                        ⛽ {st.brand} Station
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#B8944A', fontWeight: '700', background: 'rgba(184, 148, 74, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                        Km {st.distance_from_origin_km}
                      </span>
                    </div>

                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#20231F' }}>
                      {st.name}
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#20231F', opacity: 0.8 }}>
                      Location: {st.location_name} (Elevation: {st.elevation_m}m)
                    </div>

                    <div style={{ fontSize: '0.74rem', background: 'rgba(48, 72, 59, 0.08)', padding: '4px 6px', borderRadius: '4px', marginTop: '2px' }}>
                      <strong>Fuels:</strong> {Array.isArray(st.fuel_types) ? st.fuel_types.join(', ') : 'Diesel, Petrol'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', marginTop: '4px' }}>
                      {st.has_ev_charging ? (
                        <span style={{ color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Zap size={12} /> EV Fast Charging
                        </span>
                      ) : (
                        <span style={{ opacity: 0.6 }}>Standard Dispenser</span>
                      )}
                      <span style={{ color: '#30483B', fontWeight: '600' }}>🟢 {st.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Map with Active Route Highlight & Fuel Stations */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#20231F', marginBottom: '1rem' }}>
              Visualized Route Corridor & Refueling Depots
            </h3>
            <MapComponent
              locations={locations}
              fastestRoute={analysis.fastestRoute}
              safestRoute={analysis.safestRoute}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteIntelligence;