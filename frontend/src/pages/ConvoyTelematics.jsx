import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import MapComponent from '../components/MapComponent';
import { 
  Truck, ShieldAlert, Radio, AlertTriangle, CheckCircle2, 
  RefreshCw, Search, Phone, User, Package, Navigation, Send, Activity
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export function ConvoyTelematics() {
  const { t } = useTranslation();
  const [convoys, setConvoys] = useState([]);
  const [locations, setLocations] = useState([]);
  const [disruptions, setDisruptions] = useState([]);
  const [commodityFilter, setCommodityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvoy, setSelectedConvoy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pingSuccess, setPingSuccess] = useState(null);

  // Ping test form state
  const [testConvoyId, setTestConvoyId] = useState('CVY-NE-01');
  const [testLat, setTestLat] = useState('27.2000');
  const [testLng, setTestLng] = useState('92.4200');
  const [testSpeed, setTestSpeed] = useState('35.0');

  const loadData = async () => {
    try {
      setLoading(true);
      const [convoysRes, locsRes, disruptionsRes] = await Promise.all([
        api.getConvoys('ALL').catch(() => null),
        api.getLocations().catch(() => null),
        api.getDisruptions('active').catch(() => null)
      ]);

      if (convoysRes && convoysRes.data) setConvoys(convoysRes.data);
      if (locsRes && locsRes.data) setLocations(locsRes.data);
      if (disruptionsRes && disruptionsRes.data) setDisruptions(disruptionsRes.data);
    } catch (err) {
      console.error('Failed to load convoy telematics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s auto poll
    return () => clearInterval(interval);
  }, []);

  // Handle manual GPS ping injection (Simulates real Traccar / AIS-140 stream)
  const handleSendPing = async (e) => {
    e.preventDefault();
    try {
      setPingSuccess(null);
      await api.pingConvoy({
        convoy_id: testConvoyId,
        lat: parseFloat(testLat),
        lng: parseFloat(testLng),
        speed: parseFloat(testSpeed)
      });
      setPingSuccess(`Live GPS telemetry ping acknowledged for ${testConvoyId}!`);
      loadData();
    } catch (err) {
      setPingSuccess(`Ping Error: ${err.message}`);
    }
  };

  // Handle Dynamic Reroute Trigger
  const handleTriggerReroute = async (convoyId) => {
    try {
      const res = await api.triggerConvoyReroute(convoyId, 'Active Highway Hazard');
      if (res.success) {
        setPingSuccess(`⚡ Dynamic A* reroute successfully computed for Convoy ${convoyId}!`);
        loadData();
      }
    } catch (err) {
      alert(`Reroute failed: ${err.message}`);
    }
  };

  // Stats computation
  const totalCount = convoys.length;
  const polCount = convoys.filter(c => c.commodity_type === 'POL_TANKER').length;
  const medCount = convoys.filter(c => c.commodity_type === 'MEDICAL_AID').length;
  const foodCount = convoys.filter(c => c.commodity_type === 'FOOD_GRAINS').length;
  const delayedCount = convoys.filter(c => c.status === 'DELAYED_LANDSLIDE' || c.status === 'REROUTING').length;

  // Filtered convoys
  const filteredConvoys = convoys.filter(c => {
    const matchesCommodity = commodityFilter === 'ALL' || c.commodity_type === commodityFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(query) ||
      c.vehicle_reg_no.toLowerCase().includes(query) ||
      c.driver_name.toLowerCase().includes(query) ||
      c.origin.toLowerCase().includes(query) ||
      c.destination.toLowerCase().includes(query);
    return matchesCommodity && matchesSearch;
  });

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. TOP HEADER & OPERATIONAL BRIEF */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ color: '#20231F', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Truck size={30} color="#B8944A" /> Essential Supplies & Disaster Relief Convoy Telematics Hub
          </h1>
          <p className="page-subtitle" style={{ color: '#20231F', opacity: 0.8 }}>
            Real-Time AIS-140 GPS telematics & dynamic automated landslide rerouting for 14 active relief fleets across North East India
          </p>
        </div>

        <button 
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            backgroundColor: '#30483B',
            color: '#EDE8DC',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <RefreshCw size={15} /> Refresh Telematics
        </button>
      </div>

      {/* ISRO BHUVAN DUAL VALIDATION CALLOUT */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderRadius: '10px',
        backgroundColor: '#EDE8DC',
        border: '1.5px solid #30483B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🛰️</span>
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#30483B' }}>
              ISRO Bhuvan & MOSDAC Dual-Source Satellite Telematics Active
            </strong>
            <div style={{ fontSize: '0.76rem', color: '#20231F', opacity: 0.8 }}>
              All 14 relief fleets are cross-referenced with ISRO Bhuvan National Geoportal Road Network & Open-Meteo ECMWF/GFS Radar.
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.74rem', background: '#30483B', color: '#FFFFFF', padding: '3px 9px', borderRadius: '6px', fontWeight: '700' }}>
          Token: 911a3211... Active (24h)
        </span>
      </div>

      {/* 2. FLEET METRIC RIBBON */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #30483B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#30483B', textTransform: 'uppercase' }}>{t('total_convoys', 'Active Tracked Fleets')}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#20231F', marginTop: '4px' }}>{totalCount} Convoys</div>
          <div style={{ fontSize: '0.75rem', color: '#20231F', opacity: 0.7, marginTop: '2px' }}>9 North East States Covered</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #B8944A' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#B8944A', textTransform: 'uppercase' }}>⛽ {t('pol_tankers', 'POL Fuel Tankers')}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#20231F', marginTop: '4px' }}>{polCount} Units</div>
          <div style={{ fontSize: '0.75rem', color: '#20231F', opacity: 0.7, marginTop: '2px' }}>88,000L Fuel & Arctic Diesel</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #A9573F' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#A9573F', textTransform: 'uppercase' }}>💊 {t('medical_aid', 'Critical Medical Aid')}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#20231F', marginTop: '4px' }}>{medCount} Units</div>
          <div style={{ fontSize: '0.75rem', color: '#20231F', opacity: 0.7, marginTop: '2px' }}>18.7T Plasma & Trauma Kits</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #30483B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#30483B', textTransform: 'uppercase' }}>🌾 {t('food_grains', 'FCI Food Grains')}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#20231F', marginTop: '4px' }}>{foodCount} Units</div>
          <div style={{ fontSize: '0.75rem', color: '#20231F', opacity: 0.7, marginTop: '2px' }}>105T Fortified Rice & Rations</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #EF4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#EF4444', textTransform: 'uppercase' }}>⚠️ {t('delayed_convoys', 'Rerouting / Delayed')}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#EF4444', marginTop: '4px' }}>{delayedCount} Flagged</div>
          <div style={{ fontSize: '0.75rem', color: '#EF4444', opacity: 0.85, marginTop: '2px' }}>Auto-Rerouting Triggered</div>
        </div>
      </div>

      {/* 3. INTERACTIVE FLEET MAP & GPS TELEMATICS INGESTION DUAL VIEW */}
      <div className="grid-two-col">
        {/* Left: Dedicated Interactive Map */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#20231F', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <Radio size={18} color="#30483B" /> Live Geospatial Convoy Fleet Radar
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#30483B', color: '#FFFFFF', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' }}>
              AIS-140 Active Pings
            </span>
          </div>
          <MapComponent locations={locations} disruptions={disruptions} convoys={filteredConvoys} />
        </div>

        {/* Right: GPS Ping Ingestion Simulator & Quick Triage */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#20231F', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={18} color="#B8944A" /> Live GPS Ingestion & Field Telematics Stream
            </h3>
            <span style={{ fontSize: '0.72rem', background: 'rgba(48,72,59,0.1)', color: '#30483B', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
              PORT 5000 / AIS-140 API
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#20231F', opacity: 0.8, margin: 0 }}>
            Connect real field drivers using the <strong>Traccar Client</strong> app (Server: <code>/api/v1/convoys/ping</code>) or inject real-time telemetry coordinates below:
          </p>

          <form onSubmit={handleSendPing} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Select Target Convoy</label>
              <select className="form-select" value={testConvoyId} onChange={e => setTestConvoyId(e.target.value)}>
                {convoys.map(c => (
                  <option key={c.convoy_id} value={c.convoy_id}>
                    [{c.commodity_type}] {c.vehicle_reg_no} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current Latitude</label>
              <input className="form-input" value={testLat} onChange={e => setTestLat(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Current Longitude</label>
              <input className="form-input" value={testLng} onChange={e => setTestLng(e.target.value)} required />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Live Speed (km/h)</label>
              <input className="form-input" value={testSpeed} onChange={e => setTestSpeed(e.target.value)} required />
            </div>

            <button
              type="submit"
              style={{
                gridColumn: 'span 2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                background: '#30483B',
                color: '#EDE8DC',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Send size={16} /> Broadcast Live GPS Telemetry Ping
            </button>
          </form>

          {pingSuccess && (
            <div style={{ fontSize: '0.8rem', padding: '8px 12px', borderRadius: '6px', background: 'rgba(48,72,59,0.12)', color: '#30483B', fontWeight: '600' }}>
              ✓ {pingSuccess}
            </div>
          )}
        </div>
      </div>

      {/* 4. CONVOY REGISTRY FILTER & FLEET CARDS */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Commodity Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCommodityFilter('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: '1px solid #CBD0C0',
                cursor: 'pointer',
                background: commodityFilter === 'ALL' ? '#30483B' : '#EDE8DC',
                color: commodityFilter === 'ALL' ? '#FFFFFF' : '#20231F'
              }}
            >
              All Fleets ({totalCount})
            </button>
            <button
              onClick={() => setCommodityFilter('POL_TANKER')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: '1px solid #CBD0C0',
                cursor: 'pointer',
                background: commodityFilter === 'POL_TANKER' ? '#B8944A' : '#EDE8DC',
                color: commodityFilter === 'POL_TANKER' ? '#FFFFFF' : '#20231F'
              }}
            >
              ⛽ POL Tankers ({polCount})
            </button>
            <button
              onClick={() => setCommodityFilter('MEDICAL_AID')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: '1px solid #CBD0C0',
                cursor: 'pointer',
                background: commodityFilter === 'MEDICAL_AID' ? '#A9573F' : '#EDE8DC',
                color: commodityFilter === 'MEDICAL_AID' ? '#FFFFFF' : '#20231F'
              }}
            >
              💊 Medical Aid ({medCount})
            </button>
            <button
              onClick={() => setCommodityFilter('FOOD_GRAINS')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: '1px solid #CBD0C0',
                cursor: 'pointer',
                background: commodityFilter === 'FOOD_GRAINS' ? '#30483B' : '#EDE8DC',
                color: commodityFilter === 'FOOD_GRAINS' ? '#FFFFFF' : '#20231F'
              }}
            >
              🌾 Food Grains ({foodCount})
            </button>
            <button
              onClick={() => setCommodityFilter('GENERAL_SUPPLY')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                border: '1px solid #CBD0C0',
                cursor: 'pointer',
                background: commodityFilter === 'GENERAL_SUPPLY' ? '#30483B' : '#EDE8DC',
                color: commodityFilter === 'GENERAL_SUPPLY' ? '#FFFFFF' : '#20231F'
              }}
            >
              🏗️ Heavy Gear ({convoys.filter(c => c.commodity_type === 'GENERAL_SUPPLY').length})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Reg No, Driver, Route..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: '8px',
                border: '1px solid #CBD0C0',
                backgroundColor: '#EDE8DC',
                fontSize: '0.82rem',
                color: '#20231F'
              }}
            />
          </div>
        </div>

        {/* Fleet Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredConvoys.map(c => {
            const isDelayed = c.status === 'DELAYED_LANDSLIDE';
            const isRerouting = c.status === 'REROUTING';
            const statusColor = isDelayed ? '#EF4444' : (isRerouting ? '#F59E0B' : '#10B981');
            const typeIcon = c.commodity_type === 'POL_TANKER' ? '⛽' : (c.commodity_type === 'MEDICAL_AID' ? '💊' : (c.commodity_type === 'FOOD_GRAINS' ? '🌾' : '🏗️'));

            return (
              <div
                key={c.convoy_id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '14px',
                  backgroundColor: '#EDE8DC',
                  border: `2px solid ${isDelayed ? '#EF4444' : (isRerouting ? '#F59E0B' : '#CBD0C0')}`,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#30483B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{typeIcon}</span> {c.vehicle_reg_no}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      color: '#FFFFFF',
                      background: statusColor,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase'
                    }}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>

                  <strong style={{ fontSize: '1.02rem', color: '#20231F', display: 'block', marginBottom: '6px' }}>
                    {c.name}
                  </strong>

                  {/* Payload Card */}
                  <div style={{ fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.8)', padding: '8px 10px', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(48,72,59,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', color: '#30483B', marginBottom: '2px' }}>
                      <Package size={15} /> <span>{c.payload_description}</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                      Cargo: <strong>{c.cargo_weight_tonnes} Tonnes</strong> • Priority: <span style={{ fontWeight: '700', color: c.priority_level === 'CRITICAL_HIGH' ? '#A9573F' : '#30483B' }}>{c.priority_level}</span>
                    </div>
                  </div>

                  {/* Corridor Path */}
                  <div style={{ fontSize: '0.82rem', color: '#20231F', marginBottom: '4px' }}>
                    📍 <strong>Live Position:</strong> {c.current_location_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.85, marginBottom: '6px' }}>
                    🛣️ <strong>Assigned Corridor:</strong> {c.origin} &rarr; {c.destination} ({c.speed_kmh} km/h)
                  </div>

                  {/* Driver & Escort Contact */}
                  <div style={{ fontSize: '0.76rem', color: '#20231F', opacity: 0.85, background: 'rgba(48,72,59,0.05)', padding: '6px 8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} /> {c.driver_name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <Phone size={13} /> {c.driver_contact}
                    </span>
                  </div>
                </div>

                {/* Hazard / Landslide Alert */}
                {c.hazard_flag && (
                  <div style={{
                    fontSize: '0.76rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: isDelayed ? 'rgba(239, 68, 68, 0.15)' : (isRerouting ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.12)'),
                    color: isDelayed ? '#991B1B' : (isRerouting ? '#92400E' : '#065F46'),
                    fontWeight: '700'
                  }}>
                    ⚠️ {c.hazard_flag}
                  </div>
                )}

                {/* Dynamic Reroute Button */}
                <button
                  onClick={() => handleTriggerReroute(c.convoy_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#30483B',
                    color: '#EDE8DC',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ⚡ Trigger Dynamic A* Reroute
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ConvoyTelematics;
