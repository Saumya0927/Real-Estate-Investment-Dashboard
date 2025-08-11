const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load local overrides first, then parent directory
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });


const app = express();
const PORT = process.env.PORT || 3001;

// Simple CORS for personal use
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Basic body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const propertiesRouter = require('./routes/properties');
const transactionsRouter = require('./routes/transactions');
const analyticsRouter = require('./routes/analytics');
const reportsRouter = require('./routes/reports');
const authRouter = require('./routes/auth');
const marketRouter = require('./routes/market');
const calculatorRouter = require('./routes/calculator');

app.use('/api/properties', propertiesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/market', marketRouter);
app.use('/api/calculator', calculatorRouter);

// Root endpoint for backend health check
app.get('/', (req, res) => {
  res.json({
    message: 'Real Estate Dashboard Backend API',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      transactions: '/api/transactions',
      analytics: '/api/analytics',
      reports: '/api/reports',
      market: '/api/market',
      calculator: '/api/calculator'
    }
  });
});

// Simple API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Personal Real Estate Dashboard API',
    status: 'running'
  });
});

// Basic error handling
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});