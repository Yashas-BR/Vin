const { query } = require('../db/db');

// Get all animals on a farm
const getAnimalsByFarm = async (req, res, next) => {
  try {
    console.log(`[API] GET /api/animals/farm/${req.params.farm_id}`);
    const result = await query(
      `SELECT * FROM animals WHERE farm_id = ? ORDER BY tag_id`,
      [req.params.farm_id]
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Add new animal
const addAnimal = async (req, res, next) => {
  try {
    console.log('[API] POST /api/animals');
    const { farm_id, tag_id, species, breed, age_months, weight_kg } = req.body;
    
    if (!farm_id || !species) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await query(
      `INSERT INTO animals (farm_id, tag_id, species, breed, age_months, weight_kg)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [farm_id, tag_id, species, breed, age_months, weight_kg]
    );

    res.status(201).json({ success: true, message: 'Animal added' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnimalsByFarm, addAnimal };
