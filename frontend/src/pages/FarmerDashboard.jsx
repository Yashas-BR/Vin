import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AlertFeed from '../components/AlertFeed';
import Chatbot from '../components/Chatbot';
import api from '../api/axios';
import './FarmerDashboard.css';

export default function FarmerDashboard() {
  const [farm, setFarm] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const farmId = 1; // Hardcoded for Ramu Patil's farm

      const [farmsRes, animalsRes, treatmentsRes, alertsRes, weatherRes] = await Promise.all([
        api.get('/api/farms'),
        api.get(`/api/animals/farm/${farmId}`),
        api.get(`/api/treatments/farm/${farmId}`),
        api.get(`/api/alerts/farm/${farmId}`),
        api.get(`/api/weather/forecast/${farmId}`),
      ]);

      const currentFarm = farmsRes.data.data.find(f => f.id === farmId);
      setFarm(currentFarm);
      setAnimals(animalsRes.data.data);
      setTreatments(treatmentsRes.data.data.filter(t => t.status === 'active'));
      setAlerts(alertsRes.data.data);
      setWeather(weatherRes.data.data);

      setError(null);
    } catch (err) {
      console.error('[FARMER] Error fetching data:', err.message);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar
          dashboardName="Farmer Dashboard — Ramu Patil"
          userName="Ramu Patil"
          userRole="farmer"
        />
        <div className="dashboard-content">
          <div className="loading">
            <span className="spinner" aria-hidden="true" />
            Loading your farm data...
          </div>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="dashboard">
        <Navbar
          dashboardName="Farmer Dashboard — Ramu Patil"
          userName="Ramu Patil"
          userRole="farmer"
        />
        <div className="dashboard-content">
          <div className="alert alert-error">❌ Farm data not found</div>
        </div>
      </div>
    );
  }

  // Calculate herd status
  const cattleCount = animals.filter(a => a.species === 'cattle').length;
  const poultryCounts = animals.filter(a => a.species === 'poultry').length;
  const goatCount = animals.filter(a => a.species === 'goat').length;

  // Calculate runoff risk
  const avgRiskScore = treatments.length > 0
    ? (treatments.reduce((sum, t) => sum + parseFloat(t.runoff_risk_score), 0) / treatments.length).toFixed(1)
    : 0;

  // Get rain forecast
  const rainForecast = weather?.forecast?.[0]?.rainfall_mm || 0;
  const rainTomorrow = weather?.forecast?.[1]?.rainfall_mm || 0;

  // Determine runoff alert color
  let runoffAlertColor = 'green';
  if (avgRiskScore >= 7) runoffAlertColor = 'red';
  else if (avgRiskScore >= 5) runoffAlertColor = 'amber';

  return (
    <div className="dashboard">
      <Navbar
        dashboardName="Farmer Dashboard — Ramu Patil"
        userName="Ramu Patil"
        userRole="farmer"
      />
      <div className="dashboard-content">
        {error && (
          <div className="alert alert-error">
            <span>❌ {error}</span>
            <div className="alert-actions">
              <button className="btn-secondary btn-retry" onClick={fetchData}>Retry</button>
            </div>
          </div>
        )}

        {/* Section 1: Farm Summary Metrics */}
        <section className="section">
          <h2>Farm Summary</h2>
          <div className="metrics-grid">
            <div className="metric-card card">
              <div className="metric-icon">🏠</div>
              <div className="metric-info">
                <p className="metric-label">Farm</p>
                <p className="metric-value">{farm.name}</p>
              </div>
            </div>

            <div className="metric-card card">
              <div className="metric-icon">📍</div>
              <div className="metric-info">
                <p className="metric-label">Location</p>
                <p className="metric-value">{farm.district}, {farm.country}</p>
              </div>
            </div>

            <div className="metric-card card">
              <div className="metric-icon">🐄</div>
              <div className="metric-info">
                <p className="metric-label">Total Animals</p>
                <p className="metric-value">{animals.length}</p>
              </div>
            </div>

            <div className="metric-card card">
              <div className="metric-icon">💊</div>
              <div className="metric-info">
                <p className="metric-label">Active Treatments</p>
                <p className="metric-value">{treatments.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Pre-Rain Runoff Risk Card */}
        <section className="section">
          <h2>Pre-Rain Runoff Risk</h2>
          <div className={`runoff-card card runoff-${runoffAlertColor}`}>
            <div className="runoff-content">
              <div className="runoff-left">
                <div className="runoff-icon">⚠️</div>
              </div>
              <div className="runoff-middle">
                <h3>Runoff Risk Assessment</h3>
                <p className="runoff-status">
                  Current risk score: <strong>{avgRiskScore}/10</strong>
                </p>
                <p className="runoff-forecast">
                  🌧️ Tomorrow: <strong>{rainTomorrow}mm rain expected</strong>
                </p>
                {!weather && <p className="subtle-text">Forecast data unavailable</p>}
              </div>
              <div className="runoff-right">
                <div className={`risk-circle risk-${runoffAlertColor}`}>
                  {avgRiskScore}
                </div>
              </div>
            </div>
            <div className="runoff-recommendation">
              {runoffAlertColor === 'red' && (
                <p>⛔ <strong>High Risk!</strong> Consider reducing manure application and ensure proper storage before rain.</p>
              )}
              {runoffAlertColor === 'amber' && (
                <p>⚠️ <strong>Moderate Risk:</strong> Monitor weather closely. Ensure drainage systems are clear.</p>
              )}
              {runoffAlertColor === 'green' && (
                <p>✅ <strong>Safe:</strong> Runoff conditions are good. Continue standard management practices.</p>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Herd Status Cards */}
        <section className="section">
          <h2>Herd Status</h2>
          <div className="herd-grid">
            <div className="herd-card card">
              <div className="herd-icon">🐄</div>
              <div className="herd-info">
                <p className="herd-species">Cattle</p>
                <p className="herd-count">{cattleCount}</p>
              </div>
            </div>

            <div className="herd-card card">
              <div className="herd-icon">🐔</div>
              <div className="herd-info">
                <p className="herd-species">Poultry</p>
                <p className="herd-count">{poultryCounts}</p>
              </div>
            </div>

            <div className="herd-card card">
              <div className="herd-icon">🐐</div>
              <div className="herd-info">
                <p className="herd-species">Goats</p>
                <p className="herd-count">{goatCount}</p>
              </div>
            </div>

            <div className="herd-card card">
              <div className="herd-icon">📋</div>
              <div className="herd-info">
                <p className="herd-species">Total Herd</p>
                <p className="herd-count">{animals.length}</p>
              </div>
            </div>
          </div>

          {/* Active Treatments for Herd */}
          {treatments.length > 0 && (
            <div className="treatments-list-farmer card" style={{ marginTop: '1.5rem' }}>
              <h3>Active Treatments</h3>
              <div className="treatment-items">
                {treatments.map(t => {
                  const today = new Date().toISOString().split('T')[0];
                  const daysLeft = Math.ceil((new Date(t.withdrawal_end_date) - new Date(today)) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={t.id} className="treatment-item-farmer">
                      <div className="treatment-header-farmer">
                        <strong>{t.medicine_name}</strong>
                        <span className={`badge ${daysLeft > 7 ? 'badge-warning' : 'badge-active'}`}>
                          {daysLeft} days
                        </span>
                      </div>
                      <p className="treatment-detail">Applied: {new Date(t.treatment_date).toLocaleDateString()}</p>
                      <p className="treatment-detail">Clear: {new Date(t.withdrawal_end_date).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {treatments.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No active treatments</p>
            </div>
          )}
        </section>

        {/* Section 4: Alert Feed */}
        <section className="section">
          <h2>Alerts & Notifications</h2>
          <AlertFeed alerts={alerts} />
        </section>

        {/* Section 5: Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
}
