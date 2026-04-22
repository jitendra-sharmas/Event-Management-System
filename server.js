require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const frontendDist = path.join(__dirname, 'frontend', 'dist');
const hasBuiltFrontend = fs.existsSync(path.join(frontendDist, 'index.html'));

if (hasBuiltFrontend) {
  app.use(express.static(frontendDist));
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', frontendBuilt: hasBuiltFrontend });
});

// Serve frontend for any non-API route
app.get('{*path}', (req, res) => {
  if (!hasBuiltFrontend) {
    return res.status(503).send('Frontend build not found. Run npm run client:build');
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('🎓 ═══════════════════════════════════════════════');
  console.log('   College Event Management System');
  console.log('   Server running on http://localhost:' + PORT);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});
