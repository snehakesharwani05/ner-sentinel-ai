import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import RiskBadge from '../components/RiskBadge';
import { AlertOctagon, PlusCircle, CheckCircle2, ShieldAlert, WifiOff, UploadCloud } from 'lucide-react';
import { offlineEngine } from '../utils/offlineEngine';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

export function FieldReport() {
  const { isOnline, user } = useAuth();
  const { t } = useTranslation();
  const [disruptions, setDisruptions] = useState([]);
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

  useEffect(() => {
    loadDisruptions();
  }, []);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const reportPayload = {
      road_segment_id: Number(segmentId),
      disruption_type: disruptionType,
      severity: severity,
      description: description || 'Field incident report submitted from mobile terminal.',
      reporter: user?.name || 'Field Officer',
      reported_at: new Date().toISOString()
    };

    // If Offline: Queue in client-side storage
    if (!navigator.onLine) {
      offlineEngine.queueOfflineReport(reportPayload);
      setOfflineQueue(offlineEngine.getOfflineQueue());
      setMessage('🟡 Zero-Internet Mode: Incident report saved in Local Outbox Queue! It will automatically synchronize when connection returns.');
      setDescription('');
      setLoading(false);
      return;
    }

    try {
      const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJkaXNhc3RlckBuZXJzZW50aW5lbC5pbiIsInJvbGUiOiJkaXNhc3Rlcl9tZ210In0.test';

      await api.reportDisruption(reportPayload, demoToken).catch(async () => {
        return await fetch('http://localhost:5000/api/v1/disruptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportPayload)
        });
      });

      setMessage('✓ Disruption report submitted to Central Command! Dynamic rerouting engine updated.');
      setDescription('');
      loadDisruptions();
    } catch (err) {
      offlineEngine.queueOfflineReport(reportPayload);
      setOfflineQueue(offlineEngine.getOfflineQueue());
      setMessage('🟡 Report queued locally in Outbox due to network latency.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title" style={{ color: '#A9573F' }}>
          {t('nav_field_report', 'Field Disruption Reporting Hub')}
        </h1>
        <p className="page-subtitle" style={{ color: '#20231F', opacity: 0.8 }}>
          Submit real-time road hazard reports (landslides, flash floods, blockages) to trigger dynamic rerouting
        </p>
      </div>

      <div className="grid-two-col">
        {/* Form to submit new disruption */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#20231F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="#B8944A" /> {t('submit_incident', 'Submit New Field Hazard Report')}
          </h3>

          <form onSubmit={handleSubmitReport}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#20231F' }}>Road Segment ID (1-47)</label>
              <input
                type="number"
                className="form-input"
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#20231F' }}>Disruption Type</label>
              <select className="form-select" value={disruptionType} onChange={(e) => setDisruptionType(e.target.value)}>
                <option value="landslide">{t('landslide_alert', 'Landslide / Mudslide')}</option>
                <option value="flash_flood">{t('flood_alert', 'Flash Flood / Waterlogging')}</option>
                <option value="bridge_damage">Bridge Damage</option>
                <option value="roadblock">Roadblock / Strike</option>
                <option value="severe_weather">{t('heavy_rain', 'Severe Monsoon Fog/Weather')}</option>
                <option value="roadwork">Roadwork Repairs</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#20231F' }}>Severity Level</label>
              <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="low">Low (Minor Delay)</option>
                <option value="moderate">Moderate (+30m Delay)</option>
                <option value="high">High (+60m Hazard Delay)</option>
                <option value="critical_blocked">Critical Blocked (Road Closed)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#20231F' }}>Hazard Description / Field Notes</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder={t('report_desc', 'Describe current road conditions...')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <AlertOctagon size={18} />
              {loading ? 'Submitting Report...' : t('submit_incident', 'Register Disruption Report')}
            </button>

            {message && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: '#CBD0C0', color: '#20231F', fontSize: '0.85rem', border: '1px solid rgba(48, 72, 59, 0.2)' }}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Live Active Reports */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#20231F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="#A9573F" /> Active Field Reports
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '450px', overflowY: 'auto' }}>
            {disruptions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#20231F', opacity: 0.6 }}>
                No active field disruption reports currently registered.
              </div>
            ) : (
              disruptions.map(d => (
                <div
                  key={`field-dis-${d.id}`}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    backgroundColor: '#EDE8DC',
                    border: '1px solid #CBD0C0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', color: '#20231F', fontSize: '0.95rem' }}>
                      {d.highway_code || 'NH Highway'} ({d.origin_name} &rarr; {d.destination_name})
                    </span>
                    <RiskBadge severity={d.severity} />
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#20231F', opacity: 0.8, margin: 0 }}>
                    {d.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FieldReport;