const axios = require('axios');

// Get 48hr rainfall forecast for farm
const getForecast = async (req, res, next) => {
  try {
    console.log(`[API] GET /api/weather/forecast/${req.params.farm_id}`);
    const { farm_id } = req.params;

    // For now, return mock data
    // In production, you would call OpenWeatherMap API with the farm's lat/lng
    // Example: const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`);
    
    const mockForecast = {
      farm_id: parseInt(farm_id),
      rainfall_mm_48h: 15,
      timestamp: new Date().toISOString(),
      forecast: [
        { hours: 12, rainfall_mm: 5 },
        { hours: 24, rainfall_mm: 8 },
        { hours: 36, rainfall_mm: 12 },
        { hours: 48, rainfall_mm: 15 }
      ]
    };

    res.json({ success: true, data: mockForecast });
  } catch (error) {
    next(error);
  }
};

module.exports = { getForecast };
