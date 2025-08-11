const express = require('express');
const router = express.Router();

const reports = [
  {
    id: 1,
    name: 'Monthly Financial Report',
    type: 'Financial',
    date: '2024-01-31',
    size: '2.4 MB',
    status: 'Ready',
    downloadUrl: '/api/reports/download/1'
  },
  {
    id: 2,
    name: 'Property Performance Analysis',
    type: 'Performance',
    date: '2024-01-30',
    size: '1.8 MB',
    status: 'Ready',
    downloadUrl: '/api/reports/download/2'
  },
  {
    id: 3,
    name: 'Tax Summary Report',
    type: 'Tax',
    date: '2024-01-15',
    size: '3.1 MB',
    status: 'Ready',
    downloadUrl: '/api/reports/download/3'
  },
];

router.get('/', (req, res) => {
  res.json(reports);
});

router.get('/:id', (req, res) => {
  const report = reports.find(r => r.id === parseInt(req.params.id));
  if (report) {
    res.json(report);
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

router.post('/generate', (req, res) => {
  const { type, dateRange, properties } = req.body;
  
  setTimeout(() => {
    const newReport = {
      id: reports.length + 1,
      name: `${type} Report`,
      type,
      date: new Date().toISOString(),
      size: '1.5 MB',
      status: 'Ready',
      downloadUrl: `/api/reports/download/${reports.length + 1}`
    };
    reports.push(newReport);
    res.status(201).json(newReport);
  }, 2000);
});

router.get('/download/:id', (req, res) => {
  const report = reports.find(r => r.id === parseInt(req.params.id));
  if (report) {
    res.json({
      message: 'Download initiated',
      filename: `${report.name.replace(/ /g, '_')}.pdf`,
      content: 'Base64 encoded PDF content would go here'
    });
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

router.get('/summary', (req, res) => {
  res.json({
    totalRevenue: 54000,
    totalExpenses: 14500,
    netProfit: 39500,
    avgOccupancy: 94.5,
    totalProperties: 12,
    yearOverYear: 18.5,
  });
});

module.exports = router;