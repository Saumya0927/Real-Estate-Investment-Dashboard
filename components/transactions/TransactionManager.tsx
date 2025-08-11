'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, Receipt, Edit2, Trash2 } from 'lucide-react'
import transactionService, { Transaction, TransactionSummary } from '@/lib/services/transactionService'
import { useProperties } from '@/hooks/useProperties'
import ErrorBoundary from '@/components/ErrorBoundary'

interface TransactionFormData {
  propertyId: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number | '';
  description: string;
  date: string;
  vendor: string;
  paymentMethod: string;
  taxDeductible: boolean;
  recurring: boolean;
  recurringFrequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  tags: string;
}

interface TransactionFormErrors {
  propertyId?: string;
  type?: string;
  category?: string;
  amount?: string;
  description?: string;
  date?: string;
  vendor?: string;
  paymentMethod?: string;
  taxDeductible?: string;
  recurring?: string;
  recurringFrequency?: string;
  tags?: string;
}

const INCOME_CATEGORIES = [
  'Rent', 'Security Deposit', 'Late Fees', 'Pet Fees', 'Parking', 'Laundry', 'Other Income'
];

const EXPENSE_CATEGORIES = [
  'Maintenance', 'Utilities', 'Property Tax', 'Insurance', 'Property Management', 
  'Marketing', 'Legal & Professional', 'Repairs', 'Improvements', 'Supplies', 'Other Expense'
];

const PAYMENT_METHODS = [
  'Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Online Payment', 'Venmo', 'Zelle', 'Other'
];

export default function TransactionManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    yearlyIncome: 0,
    yearlyExpenses: 0,
    transactionCount: 0
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState({
    propertyId: '',
    type: '',
    category: '',
    dateRange: '30'
  })

  const { data: properties = [] } = useProperties()

  // Form state
  const [formData, setFormData] = useState<TransactionFormData>({
    propertyId: '',
    type: 'INCOME',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0] || '',
    vendor: '',
    paymentMethod: '',
    taxDeductible: false,
    recurring: false,
    recurringFrequency: 'MONTHLY',
    tags: ''
  })
  const [formErrors, setFormErrors] = useState<TransactionFormErrors>({})

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = () => {
    const allTransactions = transactionService.getTransactions()
    setTransactions(allTransactions)
    
    // Calculate summary
    const portfolioSummary = transactionService.getPortfolioSummary()
    setSummary(portfolioSummary)
  }

  const applyFilters = useCallback(() => {
    let filtered = [...transactions]

    // Property filter
    if (filters.propertyId) {
      filtered = filtered.filter(t => t.propertyId === filters.propertyId)
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category)
    }

    // Date range filter
    if (filters.dateRange) {
      const daysAgo = parseInt(filters.dateRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    setFilteredTransactions(filtered)
  }, [transactions, filters])

  // Apply filters when they change
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const validateForm = (): boolean => {
    const errors: TransactionFormErrors = {}

    if (!formData.propertyId) errors.propertyId = 'Property is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Amount must be greater than 0'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.date) errors.date = 'Date is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const property = properties.find(p => p.id === formData.propertyId)
    const transactionData = {
      propertyId: formData.propertyId,
      propertyName: property?.name || 'Unknown Property',
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date,
      vendor: formData.vendor || undefined,
      paymentMethod: formData.paymentMethod || undefined,
      taxDeductible: formData.taxDeductible,
      recurring: formData.recurring,
      recurringFrequency: formData.recurring ? formData.recurringFrequency : undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined
    }

    if (editingTransaction) {
      // Update existing transaction
      transactionService.updateTransaction(editingTransaction.id, transactionData)
      setEditingTransaction(null)
    } else {
      // Create new transaction
      transactionService.recordTransaction(transactionData)
    }

    // Reset form and reload
    resetForm()
    loadTransactions()
  }

  const resetForm = () => {
    setFormData({
      propertyId: '',
      type: 'INCOME',
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0] || '',
      vendor: '',
      paymentMethod: '',
      taxDeductible: false,
      recurring: false,
      recurringFrequency: 'MONTHLY',
      tags: ''
    })
    setFormErrors({})
    setShowAddForm(false)
    setEditingTransaction(null)
  }

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      propertyId: transaction.propertyId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      vendor: transaction.vendor || '',
      paymentMethod: transaction.paymentMethod || '',
      taxDeductible: transaction.taxDeductible || false,
      recurring: transaction.recurring || false,
      recurringFrequency: transaction.recurringFrequency || 'MONTHLY',
      tags: transaction.tags ? transaction.tags.join(', ') : ''
    })
    setEditingTransaction(transaction)
    setShowAddForm(true)
  }

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`Are you sure you want to delete this ${transaction.type.toLowerCase()} transaction?`)) {
      transactionService.deleteTransaction(transaction.id)
      loadTransactions()
    }
  }

  const handleExport = () => {
    const csv = transactionService.exportToCSV(filteredTransactions)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    return property?.name || 'Unknown Property'
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Manager</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track income and expenses across your property portfolio</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${summary.totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${summary.totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${summary.netCashFlow.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.transactionCount}</p>
              </div>
              <Receipt className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select 
              value={filters.propertyId}
              onChange={(e) => setFilters(prev => ({ ...prev, propertyId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Properties</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>{property.name}</option>
              ))}
            </select>

            <select 
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>

            <select 
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              <optgroup label="Income Categories">
                {INCOME_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
              <optgroup label="Expense Categories">
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            </select>

            <select 
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Transaction Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={resetForm} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                  </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Property *
                      </label>
                      <select
                        value={formData.propertyId}
                        onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                          formErrors.propertyId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Select Property</option>
                        {properties.map(property => (
                          <option key={property.id} value={property.id}>{property.name}</option>
                        ))}
                      </select>
                      {formErrors.propertyId && <p className="text-red-500 text-xs mt-1">{formErrors.propertyId}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'INCOME' | 'EXPENSE', category: '' }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                          formErrors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {(formData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value ? Number(e.target.value) : '' }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                          formErrors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="0.00"
                      />
                      {formErrors.amount && <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                          formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select Payment Method</option>
                        {PAYMENT_METHODS.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                        formErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter transaction description"
                    />
                    {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vendor/Payee
                    </label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter vendor or payee name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="maintenance, urgent, tax-deductible"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.taxDeductible}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxDeductible: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Tax Deductible</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.recurring}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Recurring</span>
                    </label>

                    {formData.recurring && (
                      <select
                        value={formData.recurringFrequency}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurringFrequency: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' }))}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions ({filteredTransactions.length})
            </h3>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start by adding your first transaction</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getPropertyName(transaction.propertyId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'INCOME' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}