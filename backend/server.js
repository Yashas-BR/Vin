require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const farmsRoutes = require('./routes/farms');
const animalsRoutes = require('./routes/animals');
const treatmentsRoutes = require('./routes/treatments');
const alertsRoutes = require('./routes/alerts');
const weatherRoutes = require('./routes/weather');
const medicinesRoutes = require('./routes/medicines');
const statsRoutes = require('./routes/stats');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  console.log('[API] Health check');
  res.json({ success: true, message: 'Backend is running' });
});

// Register routes
// Farms
app.get('/api/farms', farmsRoutes.getAllFarms);
app.get('/api/farms/:id', farmsRoutes.getFarmById);
app.post('/api/farms', farmsRoutes.createFarm);

// Animals
app.get('/api/animals/farm/:farm_id', animalsRoutes.getAnimalsByFarm);
app.post('/api/animals', animalsRoutes.addAnimal);

// Treatments
app.get('/api/treatments/farm/:farm_id', treatmentsRoutes.getTreatmentsByFarm);
app.get('/api/treatments/active', treatmentsRoutes.getActiveTreatments);
app.post('/api/treatments', treatmentsRoutes.createTreatment);
app.put('/api/treatments/:id/complete', treatmentsRoutes.completeTreatment);

// Alerts
app.get('/api/alerts/farm/:farm_id', alertsRoutes.getAlertsByFarm);
app.get('/api/alerts/all', alertsRoutes.getAllAlerts);
app.get('/api/alerts/unread/farm/:farm_id', alertsRoutes.getUnreadAlerts);
app.put('/api/alerts/:id/read', alertsRoutes.markAlertAsRead);

// Weather
app.get('/api/weather/forecast/:farm_id', weatherRoutes.getForecast);

// Medicines
app.get('/api/medicines', medicinesRoutes.getAllMedicines);

// Stats
app.get('/api/stats/summary', statsRoutes.getSummaryStats);
app.get('/api/stats/treatments-by-month', statsRoutes.getTreatmentsByMonth);
app.get('/api/stats/treatments-by-species', statsRoutes.getTreatmentsBySpecies);
app.get('/api/stats/top-medicines', statsRoutes.getTopMedicines);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ FarmTrack Backend running on port ${PORT}`);
  console.log(`   API Health: http://localhost:${PORT}/api/health\n`);
});
