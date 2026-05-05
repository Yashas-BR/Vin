const { query } = require('../db/db');

// Get all farms with farmer and vet names
const getAllFarms = async (req, res, next) => {
  try {
    console.log('[API] GET /api/farms');
    const result = await query(
      `SELECT f.*, 
              u1.name as farmer_name, 
              u2.name as vet_name
       FROM farms f
       LEFT JOIN users u1 ON f.farmer_id = u1.id
       LEFT JOIN users u2 ON f.vet_id = u2.id`
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get single farm by ID
const getFarmById = async (req, res, next) => {
  try {
    console.log(`[API] GET /api/farms/${req.params.id}`);
    const result = await query(
      `SELECT f.*, 
              u1.name as farmer_name, 
              u2.name as vet_name
       FROM farms f
       LEFT JOIN users u1 ON f.farmer_id = u1.id
       LEFT JOIN users u2 ON f.vet_id = u2.id
       WHERE f.id = ?`,
      [req.params.id]
    );
    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }
    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
};

// Create new farm
const createFarm = async (req, res, next) => {
  try {
    console.log('[API] POST /api/farms');
    const { name, farmer_id, vet_id, latitude, longitude, soil_type, slope, manure_storage, district, country } = req.body;
    
    if (!name || !farmer_id || !vet_id) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await query(
      `INSERT INTO farms (name, farmer_id, vet_id, latitude, longitude, soil_type, slope, manure_storage, district, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, farmer_id, vet_id, latitude, longitude, soil_type, slope, manure_storage, district, country]
    );

    res.status(201).json({ success: true, message: 'Farm created' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllFarms, getFarmById, createFarm };
