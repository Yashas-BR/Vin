import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function HotspotMap({ farms }) {
  const getRiskColor = (riskScore) => {
    if (riskScore >= 7) return '#C62828'; // Red
    if (riskScore >= 5) return '#F57F17'; // Amber
    return '#2E7D32'; // Green
  };

  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: white;">📍</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  // Calculate map center from farms
  const center = farms.length > 0
    ? [
        farms.reduce((sum, f) => sum + parseFloat(f.latitude), 0) / farms.length,
        farms.reduce((sum, f) => sum + parseFloat(f.longitude), 0) / farms.length,
      ]
    : [20, 78]; // India center as default

  return (
    <div className="hotspot-map-container">
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {farms.map(farm => (
          <Marker
            key={farm.id}
            position={[parseFloat(farm.latitude), parseFloat(farm.longitude)]}
            icon={createCustomIcon(getRiskColor(farm.risk_score || 0))}
          >
            <Popup>
              <div style={{ fontSize: '14px', minWidth: '200px' }}>
                <strong>{farm.name}</strong><br />
                Farmer: {farm.farmer_name}<br />
                Location: {farm.district}, {farm.country}<br />
                <span style={{ 
                  backgroundColor: getRiskColor(farm.risk_score || 0),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  marginTop: '8px',
                  display: 'inline-block'
                }}>
                  Risk: {(farm.risk_score || 0).toFixed(1)}/10
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#2E7D32' }}></div>
          <span>Safe (&lt; 5)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#F57F17' }}></div>
          <span>Warning (5-7)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#C62828' }}></div>
          <span>High Risk (≥ 7)</span>
        </div>
      </div>
    </div>
  );
}
