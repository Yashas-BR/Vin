const { query } = require('../db/db');
const { calculateRunoffRiskScore } = require('../utils/riskScore');

// Get all treatments for a farm
const getTreatmentsByFarm = async (req, res, next) => {
  try {
    console.log(`[API] GET /api/treatments/farm/${req.params.farm_id}`);
    const result = await query(
      `SELECT t.*, m.name as medicine_name, a.tag_id as animal_tag, u.name as vet_name
       FROM treatments t
       JOIN medicines m ON t.medicine_id = m.id
       LEFT JOIN animals a ON t.animal_id = a.id
       JOIN users u ON t.vet_id = u.id
       WHERE t.farm_id = ?
       ORDER BY t.treatment_date DESC`,
      [req.params.farm_id]
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get all active treatments across all farms
const getActiveTreatments = async (req, res, next) => {
  try {
    console.log('[API] GET /api/treatments/active');
    const result = await query(
      `SELECT t.*, m.name as medicine_name, a.tag_id as animal_tag, u.name as vet_name, f.name as farm_name
       FROM treatments t
       JOIN medicines m ON t.medicine_id = m.id
       LEFT JOIN animals a ON t.animal_id = a.id
       JOIN users u ON t.vet_id = u.id
       JOIN farms f ON t.farm_id = f.id
       WHERE t.status = 'active'
       ORDER BY t.runoff_risk_score DESC, t.treatment_date DESC`
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Log new treatment
const createTreatment = async (req, res, next) => {
  try {
    console.log('[API] POST /api/treatments');
    const { farm_id, animal_id, vet_id, medicine_id, dosage, route, duration_days, treatment_date, notes } = req.body;
    
    if (!farm_id || !vet_id || !medicine_id || !route || !duration_days || !treatment_date) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get medicine details for withdrawal period
    const medicines = await query('SELECT * FROM medicines WHERE id = ?', [medicine_id]);
    if (medicines.length === 0) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }
    const medicine = medicines[0];

    // Calculate withdrawal end date (use meat withdrawal as default)
    const treatmentDateObj = new Date(treatment_date);
    const withdrawalEndDate = new Date(treatmentDateObj);
    withdrawalEndDate.setDate(withdrawalEndDate.getDate() + medicine.withdrawal_days_meat);

    // Get farm details for risk score calculation
    const farms = await query('SELECT * FROM farms WHERE id = ?', [farm_id]);
    if (farms.length === 0) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }
    const farm = farms[0];

    // Calculate runoff risk score (mock rainfall 15mm if API not available)
    const rainfallMm = 15;
    const riskScore = calculateRunoffRiskScore(farm, rainfallMm);

    // Insert treatment
    await query(
      `INSERT INTO treatments (farm_id, animal_id, vet_id, medicine_id, dosage, route, duration_days, treatment_date, withdrawal_end_date, runoff_risk_score, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [farm_id, animal_id || null, vet_id, medicine_id, dosage, route, duration_days, treatment_date, withdrawalEndDate.toISOString().split('T')[0], riskScore, notes || null]
    );

    // Create alert if risk score >= 7
    if (riskScore >= 7) {
      const lastTreatment = await query(
        `SELECT id FROM treatments WHERE farm_id = ? ORDER BY id DESC LIMIT 1`,
        [farm_id]
      );
      const treatmentId = lastTreatment[0]?.id;

      await query(
        `INSERT INTO alerts (farm_id, treatment_id, type, message, severity, is_read)
         VALUES (?, ?, 'runoff_risk', ?, 'high', FALSE)`,
        [farm_id, treatmentId, `High runoff risk detected. Risk Score: ${riskScore}/10`]
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Treatment logged',
      data: {
        withdrawalEndDate: withdrawalEndDate.toISOString().split('T')[0],
        riskScore: riskScore,
        alertCreated: riskScore >= 7
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mark treatment as completed
const completeTreatment = async (req, res, next) => {
  try {
    console.log(`[API] PUT /api/treatments/${req.params.id}/complete`);
    const { id } = req.params;

    await query(
      `UPDATE treatments SET status = 'completed' WHERE id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Treatment marked as completed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTreatmentsByFarm, getActiveTreatments, createTreatment, completeTreatment };
