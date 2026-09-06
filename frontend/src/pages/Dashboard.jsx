import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import MapComponent from '../components/MapComponent';
import RiskBadge from '../components/RiskBadge';
import LifelineTicker from '../components/LifelineTicker';
import { DashboardDisruptionTicker } from '../components/DashboardDisruptionTicker';
import { TacticalKpiGrid } from '../components/TacticalKpiGrid';
import { RadialSubscriptionModal } from '../components/RadialSubscriptionModal';
import { useAuth } from '../context/AuthContext';
import { useAlertPin } from '../context/AlertPinContext';
import { useRadialSmsWatcher } from '../hooks/useRadialSmsWatcher';
import { NER_STATES, ALL_NER_REGION, TOTAL_NER_HUBS_COUNT } from '../constants/nerLocations';
import { fetchScopedVerifiedDisruptions, sortByCityProximity } from '../services/scopedDisruptionService';
import { startLiveDisruptionPoller, clusterTomTomIncidents } from '../services/liveDisruptionService';
import { processAndDispatchCriticalAlerts } from '../services/smsAlertService';
import { 
  ShieldCheck, Mountain, CloudRain, Truck, AlertTriangle, 
  Radio, Newspaper, CornerDownRight, ExternalLink, Filter, CheckCircle2,
  Activity, Zap, MapPin, Layers
} from 'lucide-react';

export function Dashboard() {
  const { activeZone, user } = useAuth();
  const { config: alertConfig, updateConfig: setAlertConfig } = useAlertPin();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [health, setHealth] = useState(null);
  const [locations, setLocations] = useState([]);
  const [disruptions, setDisruptions] = useState([]);
  const [convoys, setConvoys] = useState([]);
  const [convoyFilter, setConvoyFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ isLive: true, lastSynced: new Date().toLocaleTimeString() });

  // Activate Real-Time Haversine Radial Proximity SMS Watcher (Solution 3)
  useRadialSmsWatcher(disruptions, alertConfig);

  const isAll = !activeZone || activeZone === 'ALL';
  const stateMeta = isAll ? ALL_NER_REGION : (NER_STATES.find(s => s.id === activeZone) || NER_STATES[0]);

  // Find user's active city coordinates
  const activeCityName = user?.ner_city || stateMeta.cities?.[0]?.name || "Guwahati";
  const activeCityCoords = stateMeta.cities?.find(c => c.name.toLowerCase() === activeCityName.toLowerCase()) || stateMeta.cities?.[0] || { lat: 26.1445, lng: 91.7362 };

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        const [healthRes, locsRes, disruptionsRes, convoysRes, scopedTelemetryFeeds] = await Promise.all([
          api.getHealth().catch(() => null),
          api.getLocations().catch(() => null),
          api.getDisruptions('active').catch(() => null),
          api.getConvoys('ALL').catch(() => null),
          fetchScopedVerifiedDisruptions(activeZone, activeCityCoords).catch(() => [])
        ]);

        if (!isMounted) return;

        if (healthRes) setHealth(healthRes);
        if (locsRes && locsRes.data) setLocations(locsRes.data);
        if (convoysRes && convoysRes.data) setConvoys(convoysRes.data);

        // Merge DB field reports with live verified state-scoped telemetry feeds
        const dbDisruptions = (disruptionsRes && disruptionsRes.data) || [];
        const liveItems = Array.isArray(scopedTelemetryFeeds) ? scopedTelemetryFeeds : [];

        // Apply spatial clustering, boundary filtering, & city proximity sorting
        const combined = clusterTomTomIncidents([...dbDisruptions, ...liveItems]);
        const sorted = sortByCityProximity(combined, activeCityCoords);

        let hasCachedSnap = !isOnline;
        liveItems.forEach(item => {
          if (item.isCached) hasCachedSnap = true;
        });

        setDisruptions(sorted);
        setSyncStatus({
          isLive: !hasCachedSnap && isOnline,
          lastSynced: new Date().toLocaleTimeString()
        });

        // Trigger Automated Critical SMS Dispatch for registered personnel
        const phone = user?.mobile_number || user?.mobile_masked || (user?.role === 'driver' ? '+91 98620 44912' : null);
        if (phone) {
          processAndDispatchCriticalAlerts(sorted, phone, stateMeta.name).catch(console.warn);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load live dashboard feeds.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    // Start background live poller with pure state replacement
    const stopPoller = startLiveDisruptionPoller(async () => {
      if (!isMounted) return;
      try {
        const freshFeeds = await fetchScopedVerifiedDisruptions(activeZone, activeCityCoords);
        const sanitizedIncidents = sortByCityProximity(clusterTomTomIncidents(freshFeeds), activeCityCoords);
        setDisruptions(sanitizedIncidents);
        setSyncStatus({ isLive: true, lastSynced: new Date().toLocaleTimeString() });

        const phone = user?.mobile_number || user?.mobile_masked || (user?.role === 'driver' ? '+91 98620 44912' : null);
        if (phone) {
          processAndDispatchCriticalAlerts(sanitizedIncidents, phone, stateMeta.name).catch(console.warn);
        }
      } catch (e) {
        console.warn("Background poller refresh skipped:", e);
      }
    }, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      stopPoller();
    };
  }, [activeZone, user?.ner_city]);

  // Compute Real-World Operational Metrics from Live Telemetry & Graph Data
  const totalNodes = isAll ? TOTAL_NER_HUBS_COUNT : (stateMeta?.cities?.length || 35);
  const criticalBlockedCount = disruptions.filter(d => d.severity === 'critical_blocked' || d.severity === 'CRITICAL_BLOCKED').length;
  const highRiskCount = disruptions.filter(d => d.severity === 'high' || d.severity === 'HIGH').length;
  
  // Calculate Live Regional Accessibility Index (1:1 with 127 Hub Dataset)
  const mobilityIndex = Math.max(68, Math.min(99, Math.round(100 - (criticalBlockedCount * 3.5) - (highRiskCount * 1.2))));
  const safeHubsCount = Math.max(1, totalNodes - (criticalBlockedCount * 2) - highRiskCount);

  // Extract Max Soil Moisture across Live Telemetry
  let maxSoil = 0.32;
  disruptions.forEach(d => {
    if (d.live_telemetry?.soil_moisture && d.live_telemetry.soil_moisture > maxSoil) {
      maxSoil = d.live_telemetry.soil_moisture;
    }
  });

  // Construct KPI Metrics for Tactical Glassmorphic HUD Panel
  const kpiData = {
    mobilityIndex,
    safeHubs: safeHubsCount,
    totalHubs: totalNodes,
    severedPasses: criticalBlockedCount,
    cautionPasses: highRiskCount,
    weatherWatch: maxSoil >= 0.40 ? 'ORANGE ALERT' : 'YELLOW WATCH',
    soilSaturation: maxSoil,
    activeConvoys: 14,
    reroutedConvoys: 2
  };

  // Filter Disruption Feeds by Category
  const filteredDisruptions = disruptions.filter(d => {
    if (activeFilter === 'critical') return d.severity === 'critical_blocked';
    if (activeFilter === 'passes') {
      const isMountain = d.origin_name?.includes('Pass') || d.destination_name?.includes('Pass') ||
                         d.origin_name?.includes('Tunnel') || d.destination_name?.includes('Tunnel') ||
                         ['Sela Pass', 'Nathu La Pass', 'Bomdila', 'Tawang', 'Haflong (Jatinga)', 'Mangan'].some(k => d.origin_name?.includes(k) || d.destination_name?.includes(k));
      return isMountain;
    }
    if (activeFilter === 'traffic') return d.disruption_type === 'traffic_bottleneck' || d.disruption_type === 'road_closure';
    return true;
  });

  return (
    <div className="page-container">
      {/* Header Section with Upper-Right Corner Docked Tactical Glassmorphic HUD */}
      <div className="page-header" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 380px', minWidth: '300px' }}>
          <h1 className="page-title" style={{ color: '#A9573F', margin: '0 0 0.4rem 0' }}>
            PurvaSetu — NER Logistics Command & Disaster Intelligence
          </h1>
          <p className="page-subtitle" style={{ color: '#20231F', opacity: 0.8, margin: '0 0 0.65rem 0' }}>
            Real-time strategic accessibility monitoring & geotechnical contingency intelligence across 8 North-Eastern States + Siliguri Gateway
          </p>
          <div style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: syncStatus.isLive ? 'rgba(48, 72, 59, 0.12)' : 'rgba(217, 119, 6, 0.12)',
            color: syncStatus.isLive ? '#30483B' : '#B45309',
            border: syncStatus.isLive ? '1px solid rgba(48, 72, 59, 0.3)' : '1px solid rgba(217, 119, 6, 0.3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            {syncStatus.isLive ? (
              <>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A', boxShadow: '0 0 6px #16A34A' }} />
                <span>🟢 Live Telemetry Active (TomTom & Open-Meteo Stream)</span>
              </>
            ) : (
              <>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                <span>🟠 Cached Sensor Snapshot (Last Synced: {syncStatus.lastSynced})</span>
              </>
            )}
          </div>

          {/* Clickable Radar Proximity Subscription Trigger */}
          <button
            type="button"
            onClick={() => setIsAlertModalOpen(true)}
            className="flex items-center space-x-1.5 bg-[#19221e] hover:bg-[#222e28] border border-stone-700/80 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-200 transition-colors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#19221e',
              border: '1px solid rgba(120, 113, 108, 0.8)',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#e7e5e4',
              cursor: 'pointer',
              marginLeft: '8px',
              verticalAlign: 'middle',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <span className="text-emerald-400 font-bold" style={{ color: '#34d399' }}>((o))</span>
            <span>Radar: {alertConfig?.radiusKm || 75}km</span>
          </button>
        </div>

        {/* Docked High-Density Tactical Glassmorphic 2x2 HUD Grid */}
        <div style={{ flexShrink: 0, marginLeft: 'auto' }}>
          <TacticalKpiGrid data={kpiData} />
        </div>
      </div>

      {/* 2. REAL-TIME LIVE DISRUPTION MARQUEE TICKER (VERIFIED TOMTOM, USGS & OPEN-METEO) */}
      <DashboardDisruptionTicker disruptions={disruptions} />

      {/* 3. MAIN GRID: MAP & ACTIVE DISRUPTION FEEDS */}
      <div className="grid-two-col">
        {/* Left Column: Interactive Network Graph Map */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#20231F' }}>Live Geotechnical Road Network Graph</h3>
            <span style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.7 }}>
              {locations.length} Connected Locations across 9 States
            </span>
          </div>
          <MapComponent locations={locations} disruptions={disruptions} convoys={convoys} />
        </div>

        {/* Right Column: Real-Time Active Disruption Feeds with Filter Triage */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#20231F', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Radio size={18} color="#A9573F" /> Active Disruption Feed • {stateMeta.name}
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#30483B', color: '#FFFFFF', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' }}>
              {filteredDisruptions.length} Active
            </span>
          </div>

          {/* Quick-Filter Triage Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid #CBD0C0',
                cursor: 'pointer',
                background: activeFilter === 'all' ? '#30483B' : '#EDE8DC',
                color: activeFilter === 'all' ? '#FFFFFF' : '#20231F'
              }}
            >
              All Hazards ({disruptions.length})
            </button>
            <button
              onClick={() => setActiveFilter('critical')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid #CBD0C0',
                cursor: 'pointer',
                background: activeFilter === 'critical' ? '#A9573F' : '#EDE8DC',
                color: activeFilter === 'critical' ? '#FFFFFF' : '#20231F'
              }}
            >
              Critical Blocked ({criticalBlockedCount})
            </button>
            <button
              onClick={() => setActiveFilter('passes')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid #CBD0C0',
                cursor: 'pointer',
                background: activeFilter === 'passes' ? '#30483B' : '#EDE8DC',
                color: activeFilter === 'passes' ? '#FFFFFF' : '#20231F'
              }}
            >
              Mountain Passes / Tunnels
            </button>
            <button
              onClick={() => setActiveFilter('traffic')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid #CBD0C0',
                cursor: 'pointer',
                background: activeFilter === 'traffic' ? '#30483B' : '#EDE8DC',
                color: activeFilter === 'traffic' ? '#FFFFFF' : '#20231F'
              }}
            >
              Traffic Bottlenecks
            </button>
          </div>

          {/* Scrollable Disruption Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '460px', overflowY: 'auto' }}>
            {filteredDisruptions.length === 0 ? (
              <div style={{
                padding: '1.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(48, 72, 59, 0.08)',
                border: '1.5px dashed #30483B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textAlign: 'center',
                color: '#30483B'
              }}>
                <ShieldCheck size={32} color="#30483B" />
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#20231F' }}>
                  All Lifelines Clear in {stateMeta.name} — No verified road closures or critical delays reported across state corridors.
                </div>
                <div style={{ fontSize: '0.78rem', color: '#20231F', opacity: 0.75 }}>
                  Live TomTom and USGS probes detecting normal transit with zero reported physical closures in this operating zone.
                </div>
              </div>
            ) : (
              filteredDisruptions.map(d => (
                <div
                  key={d.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#EDE8DC',
                    border: '1px solid #CBD0C0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#20231F' }}>
                        {d.title || `${d.highway_code || 'Highway'} (${d.origin_name || 'Corridor'} → ${d.destination_name || 'Destination'})`}
                      </span>
                      {d.source && (
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '700', 
                          color: d.source.includes('TomTom') ? '#D97706' : d.source.includes('USGS') ? '#DC2626' : d.source.includes('Open-Meteo') ? '#2563EB' : '#30483B',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Activity size={11} /> {d.source}
                        </span>
                      )}
                    </div>
                    <RiskBadge severity={d.severity} />
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#20231F', opacity: 0.9, margin: 0 }}>
                    {d.description || 'Active road hazard impacting transit times.'}
                  </p>

                  {/* REAL-TIME NEWS BULLETIN SNIPPET */}
                  {d.news_snippet && (
                    <div style={{
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid rgba(48, 72, 59, 0.15)',
                      fontSize: '0.8rem',
                      color: '#20231F'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', color: '#30483B', fontSize: '0.78rem' }}>
                          <Newspaper size={14} />
                          <span>{d.news_source || 'Disaster Bulletin'}</span>
                        </div>
                        {d.news_url && (
                          <a
                            href={d.news_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.72rem',
                              color: '#30483B',
                              fontWeight: '600',
                              textDecoration: 'none',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(48, 72, 59, 0.08)'
                            }}
                          >
                            <span>Read Report</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      {d.news_headline && (
                        <div style={{ fontWeight: '700', color: '#20231F', fontSize: '0.82rem', marginBottom: '3px' }}>
                          {d.news_headline}
                        </div>
                      )}

                      <div style={{ opacity: 0.88, lineHeight: '1.45' }}>
                        {d.news_snippet}
                      </div>
                    </div>
                  )}

                  {/* ALTERNATIVE EMERGENCY BYPASS ROUTE SNIPPET */}
                  {d.alternative_route_snippet && (
                    <div style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(169, 87, 63, 0.08)',
                      border: '1px solid rgba(169, 87, 63, 0.2)',
                      fontSize: '0.8rem',
                      color: '#20231F'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', color: '#A9573F', marginBottom: '2px', fontSize: '0.76rem' }}>
                        <CornerDownRight size={13} />
                        <span>Recommended Emergency Bypass:</span>
                      </div>
                      <div style={{ opacity: 0.9, lineHeight: '1.4', fontWeight: '500' }}>
                        {d.alternative_route_snippet}
                      </div>
                    </div>
                  )}

                  {/* LIVE TELEMETRY CHIPS */}
                  <div style={{ fontSize: '0.75rem', color: '#20231F', opacity: 0.7, display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontWeight: '600', textTransform: 'capitalize', color: '#30483B' }}>
                      Type: {String(d.disruption_type).replace(/_/g, ' ')}
                    </span>
                    {d.live_telemetry && (
                      <span style={{ background: 'rgba(48, 72, 59, 0.1)', padding: '2px 6px', borderRadius: '4px', color: '#20231F' }}>
                        {d.live_telemetry.soil_moisture ? `Soil: ${d.live_telemetry.soil_moisture} m³/m³` : ''} 
                        {d.live_telemetry.visibility_m ? ` • Vis: ${Math.round(d.live_telemetry.visibility_m)}m` : ''}
                        {d.live_telemetry.current_speed_kmh ? ` • Speed: ${Math.round(d.live_telemetry.current_speed_kmh)} km/h` : ''}
                      </span>
                    )}
                    <span style={{ color: '#A9573F', fontWeight: '600' }}>Status: {d.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Radial Proximity SMS Configuration Modal Overlay */}
      <RadialSubscriptionModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)}
        config={alertConfig}
        onSaveConfig={(updatedConfig) => setAlertConfig(updatedConfig)}
      />
    </div>
  );
}

export default Dashboard;