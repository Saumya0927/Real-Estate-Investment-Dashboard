const express = require('express');
const router = express.Router();

router.get('/trends', (req, res) => {
  const trends = [
    { city: 'Los Angeles', change: 5.2, status: 'up', avgPrice: 850000 },
    { city: 'San Francisco', change: 3.8, status: 'up', avgPrice: 1200000 },
    { city: 'Austin', change: -1.2, status: 'down', avgPrice: 450000 },
    { city: 'Seattle', change: 0.5, status: 'stable', avgPrice: 680000 },
    { city: 'Miami', change: 7.3, status: 'up', avgPrice: 520000 },
    { city: 'Denver', change: 2.1, status: 'up', avgPrice: 480000 },
  ];
  res.json(trends);
});

router.get('/comparison', (req, res) => {
  const comparison = {
    portfolio: {
      roi: 8.5,
      occupancy: 94,
      growth: 15,
      income: 85,
      value: 78
    },
    market: {
      roi: 6.2,
      occupancy: 89,
      growth: 10,
      income: 70,
      value: 65
    }
  };
  res.json(comparison);
});

router.get('/forecast', (req, res) => {
  const forecast = {
    nextMonth: {
      expectedGrowth: 2.3,
      marketCondition: 'bullish',
      recommendations: [
        'Consider investing in Austin market',
        'Hold properties in San Francisco',
        'Monitor Miami market for opportunities'
      ]
    },
    nextQuarter: {
      expectedGrowth: 6.8,
      marketCondition: 'stable',
      riskLevel: 'medium'
    },
    nextYear: {
      expectedGrowth: 14.2,
      marketCondition: 'growth',
      riskLevel: 'low'
    }
  };
  res.json(forecast);
});

router.get('/opportunities', (req, res) => {
  const opportunities = [
    {
      id: 1,
      location: 'Austin, TX',
      type: 'Multi-Family',
      price: 380000,
      expectedROI: 9.2,
      riskLevel: 'low',
      description: 'Newly renovated apartment complex near tech hub'
    },
    {
      id: 2,
      location: 'Miami, FL',
      type: 'Commercial',
      price: 520000,
      expectedROI: 8.5,
      riskLevel: 'medium',
      description: 'Prime retail space in growing neighborhood'
    },
    {
      id: 3,
      location: 'Denver, CO',
      type: 'Residential',
      price: 420000,
      expectedROI: 7.8,
      riskLevel: 'low',
      description: 'Single-family homes in established community'
    }
  ];
  res.json(opportunities);
});

router.get('/alerts', (req, res) => {
  const alerts = [
    {
      id: 1,
      type: 'price_change',
      severity: 'high',
      message: 'Los Angeles property values increased by 5.2% this month',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'opportunity',
      severity: 'medium',
      message: 'New investment opportunity in Austin market',
      timestamp: new Date().toISOString()
    },
    {
      id: 3,
      type: 'market_update',
      severity: 'low',
      message: 'Federal Reserve announced interest rate decision',
      timestamp: new Date().toISOString()
    }
  ];
  res.json(alerts);
});

module.exports = router;