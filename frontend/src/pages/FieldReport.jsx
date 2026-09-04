import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import RiskBadge from '../components/RiskBadge';
import { AlertOctagon, PlusCircle, CheckCircle2, ShieldAlert, UserCheck, Radio, Clock, MapPin, Tag } from 'lucide-react';
import { offlineEngine } from '../utils/offlineEngine';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function FieldReport() {
  const { isOnline, user } = useAuth();
  const { t } = useTranslation();
  const [disruptions, setDisruptions] = useState([]);
  const [segments, setSegments] = useState([]);
  const [segmentId, setSegmentId] = useState(26); // Default Dirang -> Sela Pass
  const [disruptionType, setDisruptionType] = useState('landslide');
  const [severity, setSeverity] = useState('critical_blocked');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState(() => offlineEngine.getOfflineQueue());

  const loadDisruptions = async () => {
    try {
      const res = await api.getDisruptions('active');
      if (res && res.data) setDisruptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSegments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/routes/segments');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setSegments(data.data);
        if (data.data.length > 0 && !segmentId) {
          setSegmentId(data.data[0].id);
        }
      }
    } catch (e) {
      console.warn('Could not load segments list:', e);
    }
  };

  useEffect(() => {
    loadDisruptions();
    loadSegments();
  }, []);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const activeUserName = user?.name || 'Field Officer';
    const activeUserRole = user?.role || 'field_officer';
    const activeTimestamp = new Date().toISOString();

    const reportPayload = {
      road_segment_id: Number(segmentId),
      disruption_type: disruptionType,
      severity: severity,
      severity_level: severity,
      description: description || `Field incident report submitted for road segment #${segmentId}.`,
      reported_by_name: activeUserName,
      reported_by_role: activeUserRole,
      reported_at: activeTimestamp,
      reporter: activeUserName
    };

    // If Offline: Queue in client-side storage
    if (!navigator.onLine) {
      offlineEngine.queueOfflineReport(reportPayload);
      setOfflineQueue(offlineEngine.getOfflineQueue());
      setMessage('🟡 Zero-Internet Mode: Incident report saved in Local Outbox Queue! Auto-sync when connection returns.');
      setDescription('');
      setLoading(false);
      return;
    }

    try {
      const demoToken = localStorage.getItem('ner_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJkaXNhc3RlckBuZXJzZW50aW5lbC5pbiIsInJvbGUiOiJkaXNhc3Rlcl9tZ210In0.test';

      const res = await fetch('http://localhost:5000/api/v1/disruptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${demoToken}`
        },
        body: JSON.stringify(reportPayload)
      });

      if (res.ok) {
        setMessage('✓ Incident report submitted & persisted to central database! Dynamic graph rerouting updated.');
        setDescription('');
        loadDisruptions();
      } else {
        throw new Error('Server returned error');
      }
    } catch (err) {
      offlineEngine.queueOfflineReport(reportPayload);
      setOfflineQueue(offlineEngine.getOfflineQueue());
      setMessage('🟡 Report queued in Local Outbox Queue due to network latency.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSegment = segments.find(s => s.id === Number(segmentId));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title" style={{ color: '#A9573F' }}>
          {t('nav_field_report', 'Field Incident Reporting Hub')}
        </h1>
        <p className="page-subtitle" style={{ color: '#20231F', opacity: 0.8 }}>
          SIH 26002: Live field hazard triage with verified user attribution and dynamic GIS graph penalization
        </p>
      </div>

      <div className="grid-two-col">
        {/* Form to submit new disruption */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#20231F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="#B8944A" /> {t('submit_incident', 'Submit New Field Hazard Report')}
          </h3>

          <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#20231F', fontWeight: '600' }}>
                Affected Highway Corridor / Segment
              </label>
              {segments.length > 0 ? (
                <select
                  className="form-select"
                  value={segmentId}
                  onChange={(e) => setSegmentId(Number(e.target.value))}
                  required
                >
                  {segments.map(s => (
                    <option key={`seg-opt-${s.id}`} value={s.id}>
                      #{s.id} • {s.highway_code}: {s.origin_name} ({s.origin_state}) → {s.destination_name} ({s.destination_state}) [{s.distance_km} km]
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="form-input"
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  placeholder="e.g. 26"
                  required
                />
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#20231F', fontWeight: '600' }}>Disruption Type</label>
              <select className="form-select" value={disruptionType} onChange={(e) => setDisruptionType(e.target.value)}>
                <option value="landslide">{t('landslide_alert', 'Landslide / Mudslide Slope Failure')}</option>
                <option value="flash_flood">{t('flood_alert', 'Flash Flood / Urban Inundation')}</option>
                <option value="bridge_damage">Bridge Structural Damage</option>
                <option value="roadblock">Roadblock / Transit Strike</option>
                <option value="severe_weather">{t('heavy_rain', 'Dense Alpine Fog / Cloudburst')}</option>
                <option value="roadwork">Emergency Roadwork Repairs</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#20231F', fontWeight: '600' }}>Severity Level</label>
              <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="low">LOW — Minor Delay (Passable)</option>
                <option value="moderate">MEDIUM / MODERATE — Wet Surface (+30m Delay)</option>
                <option value="high">HIGH — Heavy Hazard (+60m / Escort Convoy Only)</option>
                <option value="critical_blocked">CRITICAL_BLOCKED — Road Severed (Full Closure)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#20231F', fontWeight: '600' }}>Hazard Description / Field Notes</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder={t('report_desc', 'Describe current ground conditions, debris volume, or clearance status...')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Read-Only Metadata & Attribution Badge */}
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(48, 72, 59, 0.08)',
              border: '1px solid rgba(48, 72, 59, 0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#30483B'
            }}>
              <UserCheck size={16} color="#30483B" />
              <span>
                <strong>Submitting as:</strong> {user?.name || 'Field Officer'} ({user?.role || 'field_officer'}) • <em>Auto-tagged via AIS-140/GPS</em>
              </span>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <AlertOctagon size={18} />
              {loading ? 'Submitting & Updating GIS Graph...' : t('submit_incident', 'Register Disruption Report')}
            </button>

            {message && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: '#EDE8DC',
                color: '#20231F',
                fontSize: '0.85rem',
                border: '1.5px solid #CBD0C0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span>{message}</span>
              </div>
            )}
          </form>
        </div>

        {/* Live Active Reports */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#20231F', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <ShieldAlert size={20} color="#A9573F" /> Active Field Reports & Feed
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#30483B', color: '#FFFFFF', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' }}>
              {disruptions.length} Active Incidents
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '520px', overflowY: 'auto' }}>
            {disruptions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#20231F', opacity: 0.6 }}>
                No active field disruption reports currently registered.
              </div>
            ) : (
              disruptions.map(d => {
                const isUserReport = d.source_type === 'USER_FIELD_REPORT' || !!d.reported_by_name;
                const isAutomated = d.source_type === 'AUTOMATED_TELEMETRY' || d.reported_by_role === 'automated_telemetry';

                return (
                  <div
                    key={`field-dis-${d.id}`}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: '#EDE8DC',
                      border: isUserReport ? '1.5px solid #30483B' : '1px solid #CBD0C0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ fontWeight: '700', color: '#20231F', fontSize: '0.95rem' }}>
                        {d.highway_code || 'NH Highway'} ({d.origin_name} &rarr; {d.destination_name})
                      </span>
                      <RiskBadge severity={d.severity} />
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#20231F', opacity: 0.9, margin: 0, lineHeight: '1.4' }}>
                      {d.description}
                    </p>

                    {/* Author Attribution & Timestamp Footer */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      paddingTop: '6px',
                      borderTop: '1px solid rgba(48, 72, 59, 0.1)',
                      fontSize: '0.76rem',
                      color: '#20231F'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isUserReport ? (
                          <span style={{ fontWeight: '700', color: '#30483B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <UserCheck size={13} />
                            Reported by: {d.reported_by_name || 'Field Officer'} ({d.reported_by_role || 'field_officer'})
                          </span>
                        ) : (
                          <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Radio size={13} color="#D97706" />
                            Source: Open-Meteo Telemetry / TomTom
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.75 }}>
                        <Clock size={12} />
                        <span>{formatRelativeTime(d.reported_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FieldReport;