const { query } = require('../db/db');

// Get summary stats
const getSummaryStats = async (req, res, next) => {
  try {
    console.log('[API] GET /api/stats/summary');
    
    const totalFarms = await query('SELECT COUNT(*) as count FROM farms');
    const activeTreatments = await query('SELECT COUNT(*) as count FROM treatments WHERE status = "active"');
    const highRiskAlerts = await query('SELECT COUNT(*) as count FROM alerts WHERE severity IN ("high", "critical") AND is_read = FALSE');
    const farms = await query('SELECT COUNT(DISTINCT country) as count FROM farms');

    res.json({ 
      success: true, 
      data: {
        totalFarms: totalFarms[0].count,
        activeTreatments: activeTreatments[0].count,
        highRiskAlerts: highRiskAlerts[0].count,
        countries: farms[0].count
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get treatments by month (last 6 months)
const getTreatmentsByMonth = async (req, res, next) => {
  try {
    console.log('[API] GET /api/stats/treatments-by-month');
    
    const result = await query(
      `SELECT DATE_FORMAT(treatment_date, '%Y-%m') as month, COUNT(*) as count
       FROM treatments
       WHERE treatment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(treatment_date, '%Y-%m')
       ORDER BY month DESC`
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get treatments by species
const getTreatmentsBySpecies = async (req, res, next) => {
  try {
    console.log('[API] GET /api/stats/treatments-by-species');
    
    const result = await query(
      `SELECT a.species, COUNT(*) as count
       FROM treatments t
       LEFT JOIN animals a ON t.animal_id = a.id
       GROUP BY a.species
       ORDER BY count DESC`
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get top medicines used this month
const getTopMedicines = async (req, res, next) => {
  try {
    console.log('[API] GET /api/stats/top-medicines');
    
    const result = await query(
      `SELECT m.name, COUNT(*) as count
       FROM treatments t
       JOIN medicines m ON t.medicine_id = m.id
       WHERE MONTH(t.treatment_date) = MONTH(NOW()) AND YEAR(t.treatment_date) = YEAR(NOW())
       GROUP BY m.id, m.name
       ORDER BY count DESC
       LIMIT 10`
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummaryStats, getTreatmentsByMonth, getTreatmentsBySpecies, getTopMedicines };
