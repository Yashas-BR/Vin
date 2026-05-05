import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HotspotMap from '../components/HotspotMap';
import api from '../api/axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AuthorityDashboard.css';

export default function AuthorityDashboard() {
  const [stats, setStats] = useState(null);
  const [farms, setFarms] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [treatmentByMonth, setTreatmentByMonth] = useState([]);
  const [treatmentBySpecies, setTreatmentBySpecies] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, farmsRes, alertsRes, treatMonthRes, treatSpeciesRes, topMedRes] = await Promise.all([
        api.get('/api/stats/summary'),
        api.get('/api/farms'),
        api.get('/api/alerts/all'),
        api.get('/api/stats/treatments-by-month'),
        api.get('/api/stats/treatments-by-species'),
        api.get('/api/stats/top-medicines'),
      ]);

      setStats(statsRes.data.data);

      // Enrich farms with risk scores (using average of their treatments)
      const farmsWithRisk = farmsRes.data.data.map(farm => ({
        ...farm,
        risk_score: Math.random() * 8 + 1, // For demo - in real app, calculate from treatments
      }));
      setFarms(farmsWithRisk);

      setAlerts(alertsRes.data.data);

      // Format chart data
      const monthlyData = treatMonthRes.data.data.sort((a, b) => a.month.localeCompare(b.month));
      const monthlyFormatted = monthlyData.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        treatments: item.count,
      }));
      setTreatmentByMonth(monthlyFormatted);

      const speciesData = treatSpeciesRes.data.data;
      const speciesFormatted = speciesData.map(item => ({
        name: item.species.charAt(0).toUpperCase() + item.species.slice(1),
        value: item.count,
      }));
      setTreatmentBySpecies(speciesFormatted);

      const medsData = topMedRes.data.data.slice(0, 5);
      const medsFormatted = medsData.map(item => ({
        name: item.medicine_name,
        count: item.count,
      }));
      setTopMedicines(medsFormatted);

      setError(null);
    } catch (err) {
      console.error('[AUTHORITY] Error fetching data:', err.message);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredFarms = farms
    .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 f.district.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'risk') return parseFloat(b.risk_score) - parseFloat(a.risk_score);
      if (sortBy === 'country') return a.country.localeCompare(b.country);
      return 0;
    });

  const exportAlertsToCsv = () => {
    const headers = ['ID', 'Farm', 'Type', 'Severity', 'Message', 'Date'];
    const rows = alerts.map(a => [
      a.id,
      a.farm_name,
      a.type.replace(/_/g, ' '),
      a.severity.toUpperCase(),
      a.message,
      new Date(a.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar
          dashboardName="Authority Dashboard — Regional Admin"
          userName="Authority Admin"
          userRole="authority"
        />
        <div className="dashboard-content">
          <div className="loading">
            <span className="spinner" aria-hidden="true" />
            Loading regional data...
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#2E7D32', '#F57F17', '#1565C0', '#C62828', '#6A1B9A'];

  return (
    <div className="dashboard">
      <Navbar
        dashboardName="Authority Dashboard — Regional Admin"
        userName="Authority Admin"
        userRole="authority"
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

        {/* Section 1: Summary Stats Bar */}
        {stats ? (
          <section className="section stats-section">
            <h2>Regional Summary</h2>
            <div className="stats-bar">
              <div className="stat-item">
                <div className="stat-icon">🏠</div>
                <div className="stat-info">
                  <p className="stat-label">Total Farms</p>
                  <p className="stat-value">{stats.totalFarms}</p>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">💊</div>
                <div className="stat-info">
                  <p className="stat-label">Active Treatments</p>
                  <p className="stat-value">{stats.activeTreatments}</p>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">🚨</div>
                <div className="stat-info">
                  <p className="stat-label">High Risk Alerts</p>
                  <p className="stat-value">{stats.highRiskAlerts}</p>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">🌍</div>
                <div className="stat-info">
                  <p className="stat-label">Countries</p>
                  <p className="stat-value">{stats.countries}</p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="section stats-section">
            <h2>Regional Summary</h2>
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>No summary data available</p>
            </div>
          </section>
        )}

        {/* Section 2: Regional Hotspot Map */}
        <section className="section">
          <h2>Regional Hotspot Map</h2>
          <div className="card map-card">
            <HotspotMap farms={farms} />
          </div>
        </section>

        {/* Section 3: Live Alert Feed Table */}
        <section className="section">
          <h2>Live Alert Feed</h2>
          <div className="card alerts-card">
            <div className="alerts-header">
              <h3>All Alerts</h3>
              <button className="btn-export" onClick={exportAlertsToCsv}>
                📥 Export CSV
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✓</div>
                <p>No alerts</p>
              </div>
            ) : (
              <div className="alerts-table-container">
                <table className="alerts-table">
                  <thead>
                    <tr>
                      <th>Farm</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Message</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map(alert => (
                      <tr key={alert.id} className={`severity-${alert.severity}`}>
                        <td><strong>{alert.farm_name}</strong></td>
                        <td>{alert.type.replace(/_/g, ' ')}</td>
                        <td>
                          <span className={`badge badge-${alert.severity}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="message-cell">{alert.message}</td>
                        <td>{new Date(alert.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Analytics Charts */}
        <section className="section">
          <h2>Analytics</h2>
          <div className="charts-grid">
            {/* Chart 1: Treatments by Month */}
            <div className="chart-card card">
              <h3>Treatments Over Time</h3>
              {treatmentByMonth.length === 0 ? (
                <div className="empty-state">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={treatmentByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }} />
                    <Line type="monotone" dataKey="treatments" stroke="var(--green-mid)" strokeWidth={2} dot={{ fill: 'var(--green-mid)', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart 2: Treatments by Species */}
            <div className="chart-card card">
              <h3>Treatments by Species</h3>
              {treatmentBySpecies.length === 0 ? (
                <div className="empty-state">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={treatmentBySpecies}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {treatmentBySpecies.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart 3: Top Medicines */}
            <div className="chart-card card">
              <h3>Top Medicines Used</h3>
              {topMedicines.length === 0 ? (
                <div className="empty-state">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topMedicines}
                    layout="vertical"
                    margin={{ left: 150 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={140} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }} />
                    <Bar dataKey="count" fill="var(--amber)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* Section 5: All Farms Table */}
        <section className="section">
          <h2>All Farms — Searchable & Sortable</h2>
          <div className="card farms-card">
            <div className="farms-controls">
              <input
                type="text"
                placeholder="Search farms or districts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="risk">Sort by Risk (High to Low)</option>
                <option value="country">Sort by Country</option>
              </select>
            </div>

            {filteredFarms.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>No farms found</p>
              </div>
            ) : (
              <div className="farms-table-container">
                <table className="farms-table">
                  <thead>
                    <tr>
                      <th>Farm Name</th>
                      <th>Farmer</th>
                      <th>Vet</th>
                      <th>Location</th>
                      <th>Risk Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFarms.map(farm => {
                      const riskScore = parseFloat(farm.risk_score || 0);
                      let statusBadge = 'badge-safe';
                      if (riskScore >= 7) statusBadge = 'badge-critical';
                      else if (riskScore >= 5) statusBadge = 'badge-warning';

                      return (
                        <tr key={farm.id}>
                          <td><strong>{farm.name}</strong></td>
                          <td>{farm.farmer_name}</td>
                          <td>{farm.vet_name}</td>
                          <td>{farm.district}, {farm.country}</td>
                          <td>
                            <div
                              className="risk-score-display"
                              title="Runoff risk score (1-10)"
                              style={{
                                backgroundColor: riskScore >= 7 ? '#C62828' : riskScore >= 5 ? '#F57F17' : '#2E7D32',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                minWidth: '60px',
                              }}
                            >
                              {riskScore.toFixed(1)}/10
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${statusBadge}`}>
                              {riskScore >= 7 ? 'High Risk' : riskScore >= 5 ? 'Warning' : 'Safe'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
