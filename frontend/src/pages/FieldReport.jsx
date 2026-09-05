import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import RiskBadge from '../components/RiskBadge';
import { 
  AlertOctagon, PlusCircle, CheckCircle2, ShieldAlert, UserCheck, 
  Radio, Clock, MapPin, Tag, AlertTriangle, X, ShieldCheck 
} from 'lucide-react';
import { offlineEngine } from '../utils/offlineEngine';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { verifyReportAuthenticity, validateFieldReport, clusterTomTomIncidents } from '../services/liveDisruptionService';

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export function FieldReport() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [disruptions, setDisruptions] = useState([]);
  const [segments, setSegments] = useState([]);
  const [segmentId, setSegmentId] = useState(26);
  const [disruptionType, setDisruptionType] = useState('landslide');
  const [severity, setSeverity] = useState('critical_blocked');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState(() => offlineEngine.getOfflineQueue());

  const loadDisruptions = async () => {
    try {
      const res = await api.getDisruptions('active');
      if (res && res.data) {
        setDisruptions(clusterTomTomIncidents(res.data));
      }
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

  const selectedSegment = segments.find(s => s.id === Number(segmentId));

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setRejectionModal(null);

    const activeUserName = user?.name || 'Field Officer';
    const activeUserRole = user?.role || 'field_officer';
    const activeTimestamp = new Date().toISOString();

    // Determine segment coordinates for validation gateway
    const segLat = Number(selectedSegment?.origin_lat || selectedSegment?.origin_latitude || 27.503);
    const segLng = Number(selectedSegment?.origin_lng || selectedSegment?.origin_longitude || 92.102);

    // 1. Run Ground-Truth Telemetry Cross-Check Gateway against Live External APIs
    const verification = await verifyReportAuthenticity([segLat, segLng], disruptionType);

    if (!verification.approved) {
      setRejectionModal({
        title: 'Report Rejected: Live Telemetry Verification Failed',
        reason: verification.errorMsg || 'Ground-truth sensor mismatch detected with live ground sensors.'
      });
      setLoading(false);
      return;
    }

    const reportPayload = {
      road_segment_id: Number(segmentId),
      disruption_type: disruptionType,
      severity: severity,
      severity_level: severity,
      description: description || `Field incident report submitted for road segment #${segmentId}.`,
      reported_by_name: activeUserName,
      reported_by_role: activeUserRole,
      reported_at: activeTimestamp,
      reporter: activeUserName,
      telemetry_summary: verification.telemetrySummary,
      is_telemetry_verified: true
    };

    // If Offline: Queue in client-side storage
    if (!navigator.onLine) {
      offlineEngine.queueOfflineReport(reportPayload);
      setOfflineQueue(offlineEngine.getOfflineQueue());
      setMessage(`🟡 Zero-Internet Mode: Incident report verified (${verification.telemetrySummary || 'Live Sensors'}) & queued in Local Outbox.`);
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
        setMessage(`✔ ${verification.telemetrySummary || 'Verified by Live Sensors'} — Report active & dynamic routing updated.`);
        setDescription('');
        loadDisruptions();
      } else {
        throw new Error('Server returned error');
      }
    } catch (err) {
      offlineEngine.queueOfflineReport(reportPayload);
      setOfflineQueue(offlineEngine.getOfflineQueue());
      setMessage('🟡 Report verified & queued in Local Outbox due to network latency.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title" style={{ color: '#A9573F' }}>
          {t('nav_field_report', 'Field Incident Reporting Hub')}
        </h1>
        <p className="page-subtitle" style={{ color: '#20231F', opacity: 0.8 }}>
          SIH 26002: Live field hazard triage with automated telemetry cross-check gateway & authentic verified attribution
        </p>
      </div>

      {/* REJECTION MODAL DIALOG */}
      {rejectionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(32, 35, 31, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '2px solid #DC2626',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626' }}>
                <AlertTriangle size={24} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
                  {rejectionModal.title}
                </h3>
              </div>
              <button 
                onClick={() => setRejectionModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              fontSize: '0.88rem',
              lineHeight: '1.5',
              color: '#991B1B'
            }}>
              <strong>Reason for Rejection:</strong>
              <p style={{ margin: '6px 0 0 0' }}>{rejectionModal.reason}</p>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#20231F', opacity: 0.8 }}>
              To ensure zero false positives, all field hazard submissions must align with active telemetry (precipitation, soil saturation, or TomTom flow delay).
            </div>

            <button
              onClick={() => setRejectionModal(null)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: '#30483B',
                color: '#FFFFFF',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                alignSelf: 'flex-end'
              }}
            >
              Acknowledge & Edit Report
            </button>
          </div>
        </div>
      )}

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
                <option value="traffic_jam">Traffic Bottleneck / Congestion</option>
                <option value="road_blockage">Road Blockage / Physical Closure</option>
                <option value="bridge_damage">Bridge Structural Damage</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#20231F', fontWeight: '600' }}>Severity Level</label>
              <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="critical_blocked">CRITICAL BLOCKED (100% Impassable)</option>
                <option value="high">HIGH (Severe Delay / 1-Way Convoys)</option>
                <option value="moderate">MODERATE (Wet Slurry / Caution)</option>
                <option value="low">LOW (Minor Congestion)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#20231F', fontWeight: '600' }}>Observations & Field Advisory</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail current pass accessibility, debris status, or local police diversions..."
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px'
              }}
            >
              <ShieldCheck size={18} />
              <span>{loading ? 'Cross-Checking Live Sensors...' : 'Validate & Submit Verified Report'}</span>
            </button>

            {message && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: message.includes('✔') ? 'rgba(22, 163, 74, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                border: message.includes('✔') ? '1px solid #16A34A' : '1px solid #D97706',
                color: '#20231F',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} color={message.includes('✔') ? '#16A34A' : '#D97706'} />
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
              <div style={{
                padding: '2rem 1.5rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(48, 72, 59, 0.08)',
                border: '1.5px dashed #30483B',
                textAlign: 'center',
                color: '#30483B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}>
                <ShieldCheck size={28} color="#30483B" />
                <strong style={{ fontSize: '0.92rem' }}>All Monitored Lifelines Clear — No Active Roadblocks or Extreme Weather Hazards Reported by Live Sensors.</strong>
                <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>0 Active Roadblocks Reported Across NER Corridors</span>
              </div>
            ) : (
              disruptions.map(d => {
                const isUserReport = d.source_type === 'USER_FIELD_REPORT' || !!d.reported_by_name;

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
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: '700', color: '#20231F', fontSize: '0.95rem' }}>
                          {d.title || `${d.highway_code || 'NH Highway'} (${d.origin_name || 'Corridor'} → ${d.destination_name || 'Destination'})`}
                        </span>
                        {d.is_telemetry_verified && (
                          <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            ✔ {d.telemetry_summary || (d.confidence_score ? `Verified via Live Sensors (${d.confidence_score}%)` : 'Verified via Live Sensors')}
                          </span>
                        )}
                      </div>
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
                            Source: {d.source || 'TomTom / USGS Telemetry'}
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