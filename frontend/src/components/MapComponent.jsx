import React from 'react';

export function MapComponent({ locations = [], disruptions = [], activeRoute = null }) {
  // Projections for North East India GPS bounding box (Lat 22.0 to 28.5, Lng 88.0 to 96.0)
  const minLat = 22.0, maxLat = 28.5;
  const minLng = 88.0, maxLng = 96.0;

  const projectCoord = (lat, lng) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - (((lat - minLat) / (maxLat - minLat)) * 100);
    return { x: `${x}%`, y: `${y}%`, numX: x, numY: y };
  };

  // Get list of node IDs in active route
  const activeNodeIds = new Set(activeRoute?.pathNodes?.map(n => n.id) || []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        backgroundColor: '#0a0f1d',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
      }}
    >
      {/* Background Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5
        }}
      />

      {/* Map Header Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 10,
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          backgroundColor: 'rgba(17, 24, 39, 0.85)',
          padding: '6px 14px',
          borderRadius: '9999px',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}
      >
        <span style={{ color: 'var(--accent-cyan)' }}>North Eastern Region (NER) Road Network Topology</span>
      </div>

      {/* Render Location Nodes */}
      {locations.map(loc => {
        const { x, y } = projectCoord(loc.latitude, loc.longitude);
        const isActiveInRoute = activeNodeIds.has(loc.id);
        const isCapital = loc.location_type === 'state_capital';
        const isPass = loc.location_type === 'mountain_pass';

        let nodeColor = '#3b82f6';
        if (isCapital) nodeColor = '#10b981';
        if (isPass) nodeColor = '#f59e0b';
        if (isActiveInRoute) nodeColor = '#6366f1';

        return (
          <div
            key={loc.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: isActiveInRoute ? 25 : 15
            }}
            title={`${loc.name} (${loc.state}) - Alt: ${loc.elevation_m}m`}
          >
            <div
              style={{
                width: isActiveInRoute ? '14px' : (isCapital ? '12px' : '8px'),
                height: isActiveInRoute ? '14px' : (isCapital ? '12px' : '8px'),
                borderRadius: '50%',
                backgroundColor: nodeColor,
                border: '2px solid #fff',
                boxShadow: isActiveInRoute ? '0 0 12px #6366f1' : '0 0 6px rgba(0,0,0,0.5)'
              }}
            />
            {(isCapital || isPass || isActiveInRoute) && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  color: isActiveInRoute ? '#fff' : 'var(--text-secondary)',
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                }}
              >
                {loc.name}
              </span>
            )}
          </div>
        );
      })}

      {/* Disruption Alert Badges on Map */}
      {disruptions.map(d => {
        // Approximate placement on map
        return (
          <div
            key={`disrupt-${d.id}`}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
              pointerEvents: 'none'
            }}
          />
        );
      })}
    </div>
  );
}

export default MapComponent;
