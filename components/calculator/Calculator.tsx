'use client'

import { useState } from 'react'
import { Calculator as CalcIcon, TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react'

export default function Calculator() {
  const [calculatorType, setCalculatorType] = useState('roi')
  
  // Helper function to handle number inputs that can be empty
  const handleNumberChange = (value: string) => {
    if (value === '') return ''
    const numValue = parseFloat(value)
    return isNaN(numValue) ? '' : numValue
  }
  
  const [roiInputs, setRoiInputs] = useState<{[key: string]: number | string}>({
    purchasePrice: 500000,
    downPayment: 100000,
    monthlyRent: 3500,
    monthlyExpenses: 1200,
    appreciationRate: 3,
  })

  const [mortgageInputs, setMortgageInputs] = useState<{[key: string]: number | string}>({
    loanAmount: 400000,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTax: 500,
    insurance: 200,
    hoa: 150,
  })

  const [cashFlowInputs, setCashFlowInputs] = useState<{[key: string]: number | string}>({
    monthlyRent: 3500,
    mortgage: 2100,
    propertyTax: 500,
    insurance: 200,
    maintenance: 300,
    propertyManagement: 350,
    vacancy: 5,
  })

  const calculateROI = () => {
    const monthlyRent = Number(roiInputs.monthlyRent) || 0
    const monthlyExpenses = Number(roiInputs.monthlyExpenses) || 0
    const downPayment = Number(roiInputs.downPayment) || 0
    const appreciationRate = Number(roiInputs.appreciationRate) || 0
    
    const annualRent = monthlyRent * 12
    const annualExpenses = monthlyExpenses * 12
    const netIncome = annualRent - annualExpenses
    const totalInvestment = downPayment
    const roi = totalInvestment > 0 ? (netIncome / totalInvestment) * 100 : 0
    const cashOnCash = roi
    const totalReturn = roi + appreciationRate
    
    return {
      roi: roi.toFixed(2),
      cashOnCash: cashOnCash.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      netIncome: netIncome.toLocaleString(),
      annualRent: annualRent.toLocaleString(),
    }
  }

  const calculateMortgage = () => {
    const principal = Number(mortgageInputs.loanAmount) || 0
    const rate = (Number(mortgageInputs.interestRate) || 0) / 100 / 12
    const payments = (Number(mortgageInputs.loanTerm) || 0) * 12
    
    if (principal <= 0 || rate <= 0 || payments <= 0) {
      return {
        monthlyPayment: '0.00',
        totalMonthly: '0.00',
        totalInterest: '0.00',
        totalPayment: '0.00',
      }
    }
    
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, payments)) / (Math.pow(1 + rate, payments) - 1)
    const totalPayment = monthlyPayment * payments
    const totalInterest = totalPayment - principal
    const totalMonthly = monthlyPayment + (Number(mortgageInputs.propertyTax) || 0) + (Number(mortgageInputs.insurance) || 0) + (Number(mortgageInputs.hoa) || 0)
    
    return {
      monthlyPayment: monthlyPayment.toFixed(2),
      totalMonthly: totalMonthly.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
    }
  }

  const calculateCashFlow = () => {
    const monthlyRent = Number(cashFlowInputs.monthlyRent) || 0
    const vacancy = Number(cashFlowInputs.vacancy) || 0
    const effectiveRent = monthlyRent * (1 - vacancy / 100)
    const totalExpenses = (Number(cashFlowInputs.mortgage) || 0) + (Number(cashFlowInputs.propertyTax) || 0) + 
                          (Number(cashFlowInputs.insurance) || 0) + (Number(cashFlowInputs.maintenance) || 0) + 
                          (Number(cashFlowInputs.propertyManagement) || 0)
    const netCashFlow = effectiveRent - totalExpenses
    const annualCashFlow = netCashFlow * 12
    const cashFlowRatio = (netCashFlow / effectiveRent) * 100
    
    return {
      netCashFlow: netCashFlow.toFixed(2),
      annualCashFlow: annualCashFlow.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      effectiveRent: effectiveRent.toFixed(2),
      cashFlowRatio: cashFlowRatio.toFixed(2),
    }
  }

  const roiResults = calculateROI()
  const mortgageResults = calculateMortgage()
  const cashFlowResults = calculateCashFlow()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Calculator</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Calculate ROI, mortgage payments, and cash flow for your investments</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setCalculatorType('roi')}
          className={`px-4 py-2 font-medium transition-colors ${
            calculatorType === 'roi' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          ROI Calculator
        </button>
        <button
          onClick={() => setCalculatorType('mortgage')}
          className={`px-4 py-2 font-medium transition-colors ${
            calculatorType === 'mortgage' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Mortgage Calculator
        </button>
        <button
          onClick={() => setCalculatorType('cashflow')}
          className={`px-4 py-2 font-medium transition-colors ${
            calculatorType === 'cashflow' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Cash Flow Calculator
        </button>
      </div>

      {calculatorType === 'roi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalcIcon className="h-5 w-5" />
              ROI Inputs
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Price
                </label>
                <input
                  type="number"
                  value={roiInputs.purchasePrice}
                  onChange={(e) => setRoiInputs({...roiInputs, purchasePrice: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Down Payment
                </label>
                <input
                  type="number"
                  value={roiInputs.downPayment}
                  onChange={(e) => setRoiInputs({...roiInputs, downPayment: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Rental Income
                </label>
                <input
                  type="number"
                  value={roiInputs.monthlyRent}
                  onChange={(e) => setRoiInputs({...roiInputs, monthlyRent: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Expenses
                </label>
                <input
                  type="number"
                  value={roiInputs.monthlyExpenses}
                  onChange={(e) => setRoiInputs({...roiInputs, monthlyExpenses: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Annual Appreciation Rate (%)
                </label>
                <input
                  type="number"
                  value={roiInputs.appreciationRate}
                  onChange={(e) => setRoiInputs({...roiInputs, appreciationRate: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ROI Results
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Cash-on-Cash Return</p>
                <p className="text-3xl font-bold text-primary-600">{roiResults.cashOnCash}%</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Return (with appreciation)</p>
                <p className="text-3xl font-bold text-green-600">{roiResults.totalReturn}%</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Annual Rental Income</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">${roiResults.annualRent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Net Annual Income</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">${roiResults.netIncome}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {calculatorType === 'mortgage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Mortgage Inputs
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Amount
                </label>
                <input
                  type="number"
                  value={mortgageInputs.loanAmount}
                  onChange={(e) => setMortgageInputs({...mortgageInputs, loanAmount: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={mortgageInputs.interestRate}
                  onChange={(e) => setMortgageInputs({...mortgageInputs, interestRate: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Term (years)
                </label>
                <input
                  type="number"
                  value={mortgageInputs.loanTerm}
                  onChange={(e) => setMortgageInputs({...mortgageInputs, loanTerm: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Property Tax
                </label>
                <input
                  type="number"
                  value={mortgageInputs.propertyTax}
                  onChange={(e) => setMortgageInputs({...mortgageInputs, propertyTax: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Insurance
                </label>
                <input
                  type="number"
                  value={mortgageInputs.insurance}
                  onChange={(e) => setMortgageInputs({...mortgageInputs, insurance: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly HOA Fees
                </label>
                <input
                  type="number"
                  value={mortgageInputs.hoa}
                  onChange={(e) => setMortgageInputs({...mortgageInputs, hoa: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Breakdown
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Principal & Interest</p>
                <p className="text-3xl font-bold text-primary-600">${mortgageResults.monthlyPayment}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Monthly Payment</p>
                <p className="text-3xl font-bold text-blue-600">${mortgageResults.totalMonthly}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest Paid</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">${mortgageResults.totalInterest}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount Paid</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">${mortgageResults.totalPayment}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {calculatorType === 'cashflow' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Cash Flow Inputs
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Rental Income
                </label>
                <input
                  type="number"
                  value={cashFlowInputs.monthlyRent}
                  onChange={(e) => setCashFlowInputs({...cashFlowInputs, monthlyRent: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mortgage Payment
                </label>
                <input
                  type="number"
                  value={cashFlowInputs.mortgage}
                  onChange={(e) => setCashFlowInputs({...cashFlowInputs, mortgage: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Property Tax
                </label>
                <input
                  type="number"
                  value={cashFlowInputs.propertyTax}
                  onChange={(e) => setCashFlowInputs({...cashFlowInputs, propertyTax: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Insurance
                </label>
                <input
                  type="number"
                  value={cashFlowInputs.insurance}
                  onChange={(e) => setCashFlowInputs({...cashFlowInputs, insurance: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maintenance & Repairs
                </label>
                <input
                  type="number"
                  value={cashFlowInputs.maintenance}
                  onChange={(e) => setCashFlowInputs({...cashFlowInputs, maintenance: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Property Management
                </label>
                <input
                  type="number"
                  value={cashFlowInputs.propertyManagement}
                  onChange={(e) => setCashFlowInputs({...cashFlowInputs, propertyManagement: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vacancy Rate (%)
                </label>
                <input
                  type="number"
                  value={cashFlowInputs.vacancy}
                  onChange={(e) => setCashFlowInputs({...cashFlowInputs, vacancy: handleNumberChange(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cash Flow Analysis
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Net Cash Flow</p>
                <p className={`text-3xl font-bold ${Number(cashFlowResults.netCashFlow) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${cashFlowResults.netCashFlow}
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Annual Cash Flow</p>
                <p className={`text-3xl font-bold ${Number(cashFlowResults.annualCashFlow) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${cashFlowResults.annualCashFlow}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Effective Rent</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">${cashFlowResults.effectiveRent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">${cashFlowResults.totalExpenses}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Cash Flow Ratio</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${Math.max(0, Math.min(100, Number(cashFlowResults.cashFlowRatio)))}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium dark:text-white">{cashFlowResults.cashFlowRatio}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}