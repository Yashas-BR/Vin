require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes placeholder (will be added in Phase 2)
app.get('/api/health', (req, res) => {
  console.log('[API] Health check');
  res.json({ success: true, message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ FarmTrack Backend running on port ${PORT}`);
  console.log(`   API Health: http://localhost:${PORT}/api/health\n`);
});
