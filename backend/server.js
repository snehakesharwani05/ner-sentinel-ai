require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const disruptionRoutes = require('./routes/disruptionRoutes');
const routeRoutes = require('./routes/routeRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const convoyRoutes = require('./routes/convoyRoutes');
const assistantRoutes = require('./routes/assistantRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health & System Status Endpoint
app.get('/health', (req, res) => {
  try {
    const locationCount = db.prepare(`SELECT COUNT(*) as count FROM locations`).get()?.count || 0;
    const edgeCount = db.prepare(`SELECT COUNT(*) as count FROM road_segments`).get()?.count || 0;
    const activeDisruptions = db.prepare(`SELECT COUNT(*) as count FROM disruptions WHERE status = 'active'`).get()?.count || 0;

    res.json({
      status: 'ONLINE',
      system: 'NER Sentinel Intelligent Logistics Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        status: 'CONNECTED',
        type: 'SQLite (WASM)',
        nodesCount: locationCount,
        edgesCount: edgeCount,
        activeDisruptionsCount: activeDisruptions
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/disruptions', disruptionRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/shipments', shipmentRoutes);
app.use('/api/v1/convoys', convoyRoutes);
app.use('/api/v1/assistant', assistantRoutes);
app.use('/api/assistant', assistantRoutes);

// Global Error Handler
app.use(errorHandler);

// Initialize DB and start listening
async function startServer() {
  try {
    await db.init();
    console.log('[DB] SQLite database initialized successfully.');

    // Ensure users table schema columns exist
    try { db.exec(`ALTER TABLE users ADD COLUMN country_code TEXT DEFAULT '+91';`); } catch (e) {}
    try { db.exec(`ALTER TABLE users ADD COLUMN mobile_hash TEXT;`); } catch (e) {}
    try { db.exec(`ALTER TABLE users ADD COLUMN mobile_masked TEXT;`); } catch (e) {}
    try { db.exec(`ALTER TABLE users ADD COLUMN service_badge_id TEXT;`); } catch (e) {}

    // Auto-seed if database is empty
    const count = db.prepare(`SELECT COUNT(*) as count FROM locations`).get()?.count || 0;
    if (count === 0) {
      console.log('[DB] Database is empty. Running seed script...');
      const seedDatabase = require('./db/seed');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` NER Sentinel Backend Server Online on Port ${PORT} `);
      console.log(` Health Check: http://localhost:${PORT}/health `);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
