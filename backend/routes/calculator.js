const express = require('express');
const router = express.Router();

router.post('/roi', (req, res) => {
  const { purchasePrice, downPayment, monthlyRent, monthlyExpenses, appreciationRate } = req.body;
  
  const annualRent = monthlyRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const netIncome = annualRent - annualExpenses;
  const totalInvestment = downPayment;
  const roi = (netIncome / totalInvestment) * 100;
  const cashOnCash = roi;
  const totalReturn = roi + appreciationRate;
  
  res.json({
    roi: roi.toFixed(2),
    cashOnCash: cashOnCash.toFixed(2),
    totalReturn: totalReturn.toFixed(2),
    netIncome: netIncome,
    annualRent: annualRent,
    calculations: {
      monthlyNetIncome: netIncome / 12,
      capRate: (netIncome / purchasePrice) * 100,
      grossRentMultiplier: purchasePrice / annualRent
    }
  });
});

router.post('/mortgage', (req, res) => {
  const { loanAmount, interestRate, loanTerm, propertyTax, insurance, hoa } = req.body;
  
  const principal = loanAmount;
  const rate = interestRate / 100 / 12;
  const payments = loanTerm * 12;
  
  const monthlyPayment = principal * (rate * Math.pow(1 + rate, payments)) / (Math.pow(1 + rate, payments) - 1);
  const totalPayment = monthlyPayment * payments;
  const totalInterest = totalPayment - principal;
  const totalMonthly = monthlyPayment + (propertyTax || 0) + (insurance || 0) + (hoa || 0);
  
  const amortizationSchedule = [];
  let balance = principal;
  
  for (let i = 1; i <= Math.min(12, payments); i++) {
    const interestPayment = balance * rate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    
    amortizationSchedule.push({
      month: i,
      payment: monthlyPayment.toFixed(2),
      principal: principalPayment.toFixed(2),
      interest: interestPayment.toFixed(2),
      balance: balance.toFixed(2)
    });
  }
  
  res.json({
    monthlyPayment: monthlyPayment.toFixed(2),
    totalMonthly: totalMonthly.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
    totalPayment: totalPayment.toFixed(2),
    amortizationSchedule
  });
});

router.post('/cashflow', (req, res) => {
  const { monthlyRent, mortgage, propertyTax, insurance, maintenance, propertyManagement, vacancy } = req.body;
  
  const effectiveRent = monthlyRent * (1 - (vacancy || 0) / 100);
  const totalExpenses = (mortgage || 0) + (propertyTax || 0) + (insurance || 0) + 
                        (maintenance || 0) + (propertyManagement || 0);
  const netCashFlow = effectiveRent - totalExpenses;
  const annualCashFlow = netCashFlow * 12;
  const cashFlowRatio = (netCashFlow / effectiveRent) * 100;
  
  res.json({
    netCashFlow: netCashFlow.toFixed(2),
    annualCashFlow: annualCashFlow.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
    effectiveRent: effectiveRent.toFixed(2),
    cashFlowRatio: cashFlowRatio.toFixed(2),
    breakdown: {
      mortgage: mortgage || 0,
      propertyTax: propertyTax || 0,
      insurance: insurance || 0,
      maintenance: maintenance || 0,
      propertyManagement: propertyManagement || 0,
      vacancyLoss: monthlyRent - effectiveRent
    }
  });
});

router.post('/investment-analysis', (req, res) => {
  const { propertyPrice, downPaymentPercent, interestRate, loanTerm, monthlyRent, expenses } = req.body;
  
  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                         (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const monthlyNetIncome = monthlyRent - monthlyPayment - expenses;
  const annualNetIncome = monthlyNetIncome * 12;
  const cashOnCashReturn = (annualNetIncome / downPayment) * 100;
  const capRate = ((monthlyRent - expenses) * 12 / propertyPrice) * 100;
  
  res.json({
    downPayment: downPayment.toFixed(2),
    loanAmount: loanAmount.toFixed(2),
    monthlyPayment: monthlyPayment.toFixed(2),
    monthlyNetIncome: monthlyNetIncome.toFixed(2),
    annualNetIncome: annualNetIncome.toFixed(2),
    cashOnCashReturn: cashOnCashReturn.toFixed(2),
    capRate: capRate.toFixed(2),
    breakEvenPoint: Math.ceil(downPayment / monthlyNetIncome)
  });
});

module.exports = router;