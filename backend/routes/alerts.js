const { query } = require('../db/db');

// Get all alerts for a farm
const getAlertsByFarm = async (req, res, next) => {
  try {
    console.log(`[API] GET /api/alerts/farm/${req.params.farm_id}`);
    const result = await query(
      `SELECT a.*, t.farm_id FROM alerts a
       LEFT JOIN treatments t ON a.treatment_id = t.id
       WHERE a.farm_id = ?
       ORDER BY a.created_at DESC`,
      [req.params.farm_id]
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get all alerts across all farms (for authority)
const getAllAlerts = async (req, res, next) => {
  try {
    console.log('[API] GET /api/alerts/all');
    const result = await query(
      `SELECT a.*, f.name as farm_name, f.district, f.country FROM alerts a
       JOIN farms f ON a.farm_id = f.id
       WHERE a.severity IN ('high', 'critical')
       ORDER BY a.created_at DESC`
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get unread alerts for a farm
const getUnreadAlerts = async (req, res, next) => {
  try {
    console.log(`[API] GET /api/alerts/unread/farm/${req.params.farm_id}`);
    const result = await query(
      `SELECT * FROM alerts WHERE farm_id = ? AND is_read = FALSE
       ORDER BY created_at DESC`,
      [req.params.farm_id]
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Mark alert as read
const markAlertAsRead = async (req, res, next) => {
  try {
    console.log(`[API] PUT /api/alerts/${req.params.id}/read`);
    const { id } = req.params;

    await query(
      `UPDATE alerts SET is_read = TRUE WHERE id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Alert marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlertsByFarm, getAllAlerts, getUnreadAlerts, markAlertAsRead };
