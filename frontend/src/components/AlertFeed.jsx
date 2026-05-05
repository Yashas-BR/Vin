import React, { useState } from 'react';

export default function AlertFeed({ alerts }) {
  const [filter, setFilter] = useState('All');

  const filterOptions = [
    { display: 'All', value: 'All' },
    { display: 'Runoff Risk', value: 'runoff_risk' },
    { display: 'Withdrawal', value: 'withdrawal_reminder' },
    { display: 'Weather', value: 'weather_alert' },
  ];

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All') return true;
    return alert.type === filter;
  });

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return '#C62828';
    if (severity === 'high') return '#F57F17';
    return '#558B2F';
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'critical') return 'badge-critical';
    if (severity === 'high') return 'badge-high';
    return 'badge-safe';
  };

  return (
    <div className="alert-feed">
      <div className="alert-filters">
        {filterOptions.map(option => (
          <button
            key={option.value}
            className={`filter-btn ${filter === option.value ? 'active' : ''}`}
            onClick={() => setFilter(option.value)}
          >
            {option.display}
          </button>
        ))}
      </div>

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="empty-alerts">
            <div className="empty-icon">✓</div>
            <p>No {filter !== 'All' ? filter.replace('_', ' ').toLowerCase() : ''} alerts</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="alert-item"
              style={{ borderLeftColor: getSeverityColor(alert.severity) }}
            >
              <div className="alert-header">
                <span className={`badge ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span className="alert-type">{alert.type.replace(/_/g, ' ')}</span>
              </div>
              <p className="alert-message">{alert.message}</p>
              <div className="alert-meta">
                {alert.farm_name && (
                  <span className="alert-farm">🏠 {alert.farm_name}</span>
                )}
                <span className="alert-time">
                  {new Date(alert.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
