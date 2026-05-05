import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RiskScoreBadge from '../components/RiskScoreBadge';
import WithdrawalCard from '../components/WithdrawalCard';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './VetDashboard.css';

export default function VetDashboard() {
  const [farms, setFarms] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [activeTreatments, setActiveTreatments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [formData, setFormData] = useState({
    farm_id: '',
    animal_id: '',
    medicine_id: '',
    dosage: '',
    route: 'injection',
    duration_days: '',
    treatment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [animals, setAnimals] = useState([]);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [farmsRes, medicinesRes, treatmentsRes, statsRes] = await Promise.all([
        api.get('/api/farms'),
        api.get('/api/medicines'),
        api.get('/api/treatments/active'),
        api.get('/api/stats/treatments-by-month'),
      ]);

      setFarms(farmsRes.data.data);
      setMedicines(medicinesRes.data.data);
      setActiveTreatments(treatmentsRes.data.data);

      // Format chart data
      const sortedData = statsRes.data.data.sort((a, b) => a.month.localeCompare(b.month));
      const chartWithRegional = sortedData.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        'My Farms': item.count,
        'Regional Avg': 3,
      }));
      setChartData(chartWithRegional);

      setError(null);
    } catch (err) {
      console.error('[VET] Error fetching data:', err.message);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimalsByFarm = async (farmId) => {
    try {
      const res = await api.get(`/api/animals/farm/${farmId}`);
      setAnimals(res.data.data);
    } catch (err) {
      console.error('[VET] Error fetching animals:', err.message);
    }
  };

  const handleFarmChange = (e) => {
    const farmId = parseInt(e.target.value);
    setFormData({ ...formData, farm_id: farmId, animal_id: '' });
    setSelectedFarm(farms.find(f => f.id === farmId));
    fetchAnimalsByFarm(farmId);
  };

  const handleMedicineChange = (e) => {
    const medId = parseInt(e.target.value);
    const med = medicines.find(m => m.id === medId);
    setFormData({ ...formData, medicine_id: medId });
    setSelectedMedicine(med);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.farm_id || !formData.medicine_id || !formData.dosage || !formData.duration_days) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        farm_id: parseInt(formData.farm_id),
        animal_id: formData.animal_id ? parseInt(formData.animal_id) : null,
        vet_id: 1, // Hardcoded for now (Dr. Arjun Sharma)
        medicine_id: parseInt(formData.medicine_id),
        duration_days: parseInt(formData.duration_days),
      };

      const res = await api.post('/api/treatments', payload);
      
      setFormSuccess({
        withdrawalEnd: res.data.data.withdrawalEndDate,
        riskScore: res.data.data.riskScore,
        alertCreated: res.data.data.alertCreated,
      });

      // Reset form
      setFormData({
        farm_id: '',
        animal_id: '',
        medicine_id: '',
        dosage: '',
        route: 'injection',
        duration_days: '',
        treatment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setSelectedMedicine(null);
      setAnimals([]);

      // Refresh treatments
      setTimeout(() => fetchData(), 1000);
    } catch (err) {
      console.error('[VET] Form error:', err);
      setFormError(err.response?.data?.error || 'Failed to log treatment');
    }
  };

  const handleMarkComplete = async (treatmentId) => {
    try {
      await api.put(`/api/treatments/${treatmentId}/complete`);
      fetchData();
    } catch (err) {
      console.error('[VET] Error completing treatment:', err);
      setError('Failed to complete treatment');
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar 
          dashboardName="Vet Dashboard — Dr. Arjun Sharma" 
          userName="Dr. Arjun Sharma"
          userRole="vet"
        />
        <div className="dashboard-content">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar 
        dashboardName="Vet Dashboard — Dr. Arjun Sharma" 
        userName="Dr. Arjun Sharma"
        userRole="vet"
      />
      <div className="dashboard-content">
        {error && <div className="alert alert-error">❌ {error}</div>}

        {/* Section 1: My Farms */}
        <section className="section">
          <h2>My Farms</h2>
          <div className="farm-grid">
            {farms.map(farm => (
              <div key={farm.id} className="farm-card card">
                <h3>{farm.name}</h3>
                <p className="farm-detail">
                  <span className="label">Farmer:</span>
                  {farm.farmer_name}
                </p>
                <p className="farm-detail">
                  <span className="label">{farm.district}, {farm.country}</span>
                </p>
                <div className="farm-stats">
                  <div className="stat">
                    <span className="stat-label">Active Treatments</span>
                    <span className="stat-value badge badge-warning">
                      {activeTreatments.filter(t => t.farm_id === farm.id).length}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Latest Risk</span>
                    <RiskScoreBadge 
                      score={activeTreatments
                        .filter(t => t.farm_id === farm.id)
                        .reduce((max, t) => Math.max(max, parseFloat(t.runoff_risk_score)), 0)}
                    />
                  </div>
                </div>
                <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                  View Farm
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Log New Treatment */}
        <section className="section">
          <h2>Log New Treatment</h2>
          <div className="card treatment-form">
            {formSuccess && (
              <div className="alert alert-success">
                ✅ Treatment logged successfully!<br />
                Withdrawal ends: <strong>{formSuccess.withdrawalEnd}</strong><br />
                Risk Score: <strong>{formSuccess.riskScore}/10</strong>
                {formSuccess.alertCreated && ' — High risk alert created!'}
              </div>
            )}
            {formError && <div className="alert alert-error">❌ {formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Select Farm *</label>
                <select 
                  name="farm_id" 
                  value={formData.farm_id}
                  onChange={handleFarmChange}
                  required
                >
                  <option value="">Choose a farm...</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} — {farm.farmer_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Animal</label>
                <select 
                  name="animal_id" 
                  value={formData.animal_id}
                  onChange={handleFormChange}
                  disabled={!formData.farm_id}
                >
                  <option value="">Entire Batch / Herd</option>
                  {animals.map(animal => (
                    <option key={animal.id} value={animal.id}>
                      {animal.tag_id} — {animal.species} ({animal.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Medicine *</label>
                <select 
                  name="medicine_id" 
                  value={formData.medicine_id}
                  onChange={handleMedicineChange}
                  required
                >
                  <option value="">Choose a medicine...</option>
                  {medicines.map(med => (
                    <option key={med.id} value={med.id}>
                      {med.name} — {med.antibiotic_class}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMedicine && (
                <WithdrawalCard medicine={selectedMedicine} />
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Dosage *</label>
                  <input 
                    type="text" 
                    name="dosage" 
                    placeholder="e.g. 10mg/kg"
                    value={formData.dosage}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Route *</label>
                  <select 
                    name="route" 
                    value={formData.route}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="injection">Injection</option>
                    <option value="oral">Oral</option>
                    <option value="topical">Topical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (days) *</label>
                  <input 
                    type="number" 
                    name="duration_days" 
                    placeholder="5"
                    value={formData.duration_days}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Treatment Date *</label>
                  <input 
                    type="date" 
                    name="treatment_date" 
                    value={formData.treatment_date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  name="notes" 
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={handleFormChange}
                />
              </div>

              <button type="submit" className="btn-primary">Log Treatment</button>
            </form>
          </div>
        </section>

        {/* Section 3: Active Treatments */}
        <section className="section">
          <h2>Active Treatments</h2>
          {activeTreatments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No active treatments</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="treatments-table">
                <thead>
                  <tr>
                    <th>Farm</th>
                    <th>Animal</th>
                    <th>Medicine</th>
                    <th>Date</th>
                    <th>Withdrawal Ends</th>
                    <th>Days Left</th>
                    <th>Risk Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTreatments.map(t => {
                    const today = new Date().toISOString().split('T')[0];
                    const daysLeft = Math.ceil((new Date(t.withdrawal_end_date) - new Date(today)) / (1000 * 60 * 60 * 24));
                    
                    let daysLeftBadge = 'badge-safe';
                    if (daysLeft > 14) daysLeftBadge = 'badge-safe';
                    else if (daysLeft > 7) daysLeftBadge = 'badge-warning';
                    else if (daysLeft > 0) daysLeftBadge = 'badge-active';
                    else daysLeftBadge = 'badge-safe';

                    return (
                      <tr key={t.id}>
                        <td><strong>{t.farm_name}</strong></td>
                        <td>{t.animal_tag || 'Batch'}</td>
                        <td>{t.medicine_name}</td>
                        <td>{new Date(t.treatment_date).toLocaleDateString()}</td>
                        <td>{new Date(t.withdrawal_end_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${daysLeftBadge}`}>
                            {daysLeft <= 0 ? 'Cleared' : `${daysLeft} days`}
                          </span>
                        </td>
                        <td>
                          <RiskScoreBadge score={t.runoff_risk_score} />
                        </td>
                        <td>
                          <button 
                            className="btn-secondary" 
                            onClick={() => handleMarkComplete(t.id)}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            Complete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 4: AMU Benchmarking Chart */}
        <section className="section">
          <h2>AMU Benchmarking — Last 6 Months</h2>
          {chartData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>No treatment data available</p>
            </div>
          ) : (
            <div className="card chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}
                  />
                  <Legend />
                  <Bar dataKey="My Farms" fill="var(--green-mid)" />
                  <Bar dataKey="Regional Avg" fill="#CCCCCC" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
