const { query } = require('../db/db');

// Get all medicines
const getAllMedicines = async (req, res, next) => {
  try {
    console.log('[API] GET /api/medicines');
    const result = await query(
      `SELECT * FROM medicines ORDER BY name`
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllMedicines };
