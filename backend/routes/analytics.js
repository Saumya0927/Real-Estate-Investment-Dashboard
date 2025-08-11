const express = require('express');
const router = express.Router();

router.get('/portfolio', (req, res) => {
  const portfolioData = {
    totalValue: 2456780,
    totalProperties: 12,
    monthlyIncome: 18450,
    monthlyExpenses: 4800,
    netIncome: 13650,
    avgOccupancy: 94.5,
    avgROI: 8.2,
    yearOverYear: 18.5,
    performanceHistory: [
      { month: 'Jan', value: 2150000, income: 15200, properties: 10 },
      { month: 'Feb', value: 2180000, income: 15800, properties: 10 },
      { month: 'Mar', value: 2210000, income: 16200, properties: 11 },
      { month: 'Apr', value: 2250000, income: 16500, properties: 11 },
      { month: 'May', value: 2280000, income: 17000, properties: 11 },
      { month: 'Jun', value: 2320000, income: 17400, properties: 12 },
      { month: 'Jul', value: 2380000, income: 17800, properties: 12 },
      { month: 'Aug', value: 2420000, income: 18200, properties: 12 },
      { month: 'Sep', value: 2456780, income: 18450, properties: 12 },
    ]
  };
  res.json(portfolioData);
});

router.get('/revenue', (req, res) => {
  const revenueData = {
    monthly: [
      { month: 'Jan', revenue: 42000, expenses: 12000, profit: 30000 },
      { month: 'Feb', revenue: 44000, expenses: 13000, profit: 31000 },
      { month: 'Mar', revenue: 45000, expenses: 12500, profit: 32500 },
      { month: 'Apr', revenue: 48000, expenses: 14000, profit: 34000 },
      { month: 'May', revenue: 52000, expenses: 15000, profit: 37000 },
      { month: 'Jun', revenue: 54000, expenses: 14500, profit: 39500 },
    ],
    yearToDate: {
      revenue: 285000,
      expenses: 81000,
      profit: 204000,
      margin: 71.6
    }
  };
  res.json(revenueData);
});

router.get('/distribution', (req, res) => {
  const distribution = {
    byType: [
      { name: 'Residential', value: 45, count: 5 },
      { name: 'Commercial', value: 30, count: 4 },
      { name: 'Multi-Family', value: 20, count: 2 },
      { name: 'Industrial', value: 5, count: 1 },
    ],
    byLocation: [
      { city: 'Los Angeles', properties: 4, value: 1800000 },
      { city: 'San Francisco', properties: 3, value: 2040000 },
      { city: 'Austin', properties: 2, value: 640000 },
      { city: 'Seattle', properties: 3, value: 1560000 },
    ]
  };
  res.json(distribution);
});

router.get('/cashflow', (req, res) => {
  const cashFlowData = {
    monthly: [
      { month: 'Jan', inflow: 42000, outflow: 12000, net: 30000 },
      { month: 'Feb', inflow: 44000, outflow: 13000, net: 31000 },
      { month: 'Mar', inflow: 45000, outflow: 12500, net: 32500 },
      { month: 'Apr', inflow: 48000, outflow: 14000, net: 34000 },
      { month: 'May', inflow: 52000, outflow: 15000, net: 37000 },
      { month: 'Jun', inflow: 54000, outflow: 14500, net: 39500 },
    ],
    projections: {
      nextMonth: { inflow: 56000, outflow: 15000, net: 41000 },
      nextQuarter: { inflow: 168000, outflow: 45000, net: 123000 },
    }
  };
  res.json(cashFlowData);
});

router.get('/performance/:propertyId', (req, res) => {
  const performanceData = {
    propertyId: req.params.propertyId,
    metrics: {
      roi: 8.5,
      cashOnCash: 7.2,
      capRate: 6.8,
      grossRentMultiplier: 12.5,
    },
    history: [
      { month: 'Jan', income: 3000, expenses: 750, occupancy: 90 },
      { month: 'Feb', income: 3100, expenses: 780, occupancy: 92 },
      { month: 'Mar', income: 3150, expenses: 800, occupancy: 95 },
      { month: 'Apr', income: 3200, expenses: 750, occupancy: 95 },
      { month: 'May', income: 3200, expenses: 820, occupancy: 95 },
      { month: 'Jun', income: 3200, expenses: 800, occupancy: 95 },
    ]
  };
  res.json(performanceData);
});

module.exports = router;