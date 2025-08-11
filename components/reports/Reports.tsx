'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Download, TrendingUp, DollarSign, Building, Receipt, Printer, FileSpreadsheet } from 'lucide-react'
import reportService, { ReportData, ReportOptions } from '@/lib/services/reportService'
import { useProperties } from '@/hooks/useProperties'
import ErrorBoundary from '@/components/ErrorBoundary'

interface ReportFilters {
  reportType: 'portfolio' | 'property' | 'financial' | 'tax'
  propertyId: string
  startDate: string
  endDate: string
  includeCharts: boolean
  includeTransactions: boolean
  includeImages: boolean
}

export default function Reports() {
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'portfolio',
    propertyId: '',
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0] || '', // January 1st
    endDate: new Date().toISOString().split('T')[0] || '', // Today
    includeCharts: true,
    includeTransactions: true,
    includeImages: false
  })
  
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  const { data: properties = [] } = useProperties()

  const generateReportData = useCallback(async () => {
    try {
      const options: ReportOptions = {
        reportType: filters.reportType,
        dateRange: {
          startDate: filters.startDate,
          endDate: filters.endDate
        },
        propertyId: filters.propertyId || undefined,
        includeCharts: filters.includeCharts,
        includeTransactions: filters.includeTransactions,
        includeImages: filters.includeImages,
        format: 'pdf'
      }

      const data = filters.propertyId && filters.reportType === 'property'
        ? await reportService.generatePropertyReport(filters.propertyId, properties, options)
        : await reportService.generatePortfolioReport(properties, options)

      setReportData(data)
    } catch (error) {
      console.error('Error generating report data:', error)
    }
  }, [filters, properties])

  // Generate report data when filters change
  useEffect(() => {
    if (properties.length > 0) {
      generateReportData()
    }
  }, [generateReportData, properties])

  const handleGenerateReport = async (format: 'pdf' | 'html' | 'csv' = 'pdf') => {
    setIsGenerating(true)
    
    try {
      const options: ReportOptions = {
        reportType: filters.reportType,
        dateRange: {
          startDate: filters.startDate,
          endDate: filters.endDate
        },
        propertyId: filters.propertyId || undefined,
        includeCharts: filters.includeCharts,
        includeTransactions: filters.includeTransactions,
        includeImages: filters.includeImages,
        format: 'pdf'
      }

      // Generate fresh report data for export
      const currentReportData = await reportService.generateReportData(properties, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        propertyId: filters.propertyId || undefined
      })

      if (format === 'csv') {
        const csv = reportService.exportToCSV(currentReportData, 'properties')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `portfolio_report_${filters.startDate}_to_${filters.endDate}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (format === 'html') {
        const html = filters.reportType === 'tax'
          ? await reportService.generateTaxReport(properties, options)
          : await reportService.generateFinancialReport(properties, options)
        reportService.downloadHTMLReport(html, `${filters.reportType}_report_${new Date().toISOString().split('T')[0]}.html`)
      } else {
        // PDF generation
        const html = filters.reportType === 'tax'
          ? await reportService.generateTaxReport(properties, options)
          : await reportService.generateFinancialReport(properties, options)
        await reportService.generatePDF(html, `${filters.reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreviewReport = async () => {
    if (!reportData) return
    
    setIsGenerating(true)
    
    try {
      const options: ReportOptions = {
        reportType: filters.reportType,
        dateRange: {
          startDate: filters.startDate,
          endDate: filters.endDate
        },
        propertyId: filters.propertyId || undefined,
        includeCharts: filters.includeCharts,
        includeTransactions: filters.includeTransactions,
        includeImages: filters.includeImages,
        format: 'pdf'
      }

      const html = filters.reportType === 'tax'
        ? await reportService.generateTaxReport(properties, options)
        : await reportService.generateFinancialReport(properties, options)
      
      setPreviewHtml(html)
      setShowPreview(true)
    } catch (error) {
      console.error('Error generating preview:', error)
      alert('Error generating preview. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const reportTypes = [
    { value: 'portfolio', label: 'Portfolio Summary', icon: Building, description: 'Complete overview of your entire real estate portfolio' },
    { value: 'property', label: 'Property Report', icon: FileText, description: 'Detailed analysis of a specific property' },
    { value: 'financial', label: 'Financial Report', icon: DollarSign, description: 'Comprehensive financial performance analysis' },
    { value: 'tax', label: 'Tax Report', icon: Receipt, description: 'Tax-deductible expenses and deductions summary' }
  ]

  const getSummaryStats = () => {
    if (!reportData) return null

    return [
      {
        label: 'Total Portfolio Value',
        value: `$${reportData.portfolioSummary.totalValue.toLocaleString()}`,
        icon: DollarSign,
        color: 'text-blue-600'
      },
      {
        label: 'Properties Included',
        value: reportData.portfolioSummary.totalProperties.toString(),
        icon: Building,
        color: 'text-green-600'
      },
      {
        label: 'Net Cash Flow',
        value: `$${reportData.portfolioSummary.netCashFlow.toLocaleString()}`,
        icon: TrendingUp,
        color: reportData.portfolioSummary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
      },
      {
        label: 'Total Transactions',
        value: reportData.transactions.length.toString(),
        icon: Receipt,
        color: 'text-purple-600'
      }
    ]
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Reports</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Generate professional reports and export your real estate data</p>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Configuration</h3>
          
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {reportTypes.map((type) => (
              <div
                key={type.value}
                onClick={() => setFilters(prev => ({ ...prev, reportType: type.value as any }))}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  filters.reportType === type.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <type.icon className={`h-5 w-5 ${
                    filters.reportType === type.value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'
                  }`} />
                  <h4 className={`font-medium ${
                    filters.reportType === type.value ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-white'
                  }`}>
                    {type.label}
                  </h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Property Filter (only for property reports) */}
            {filters.reportType === 'property' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Property
                </label>
                <select
                  value={filters.propertyId}
                  onChange={(e) => setFilters(prev => ({ ...prev, propertyId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name || property.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4 mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includeCharts}
                onChange={(e) => setFilters(prev => ({ ...prev, includeCharts: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include Charts</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includeTransactions}
                onChange={(e) => setFilters(prev => ({ ...prev, includeTransactions: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include Transactions</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includeImages}
                onChange={(e) => setFilters(prev => ({ ...prev, includeImages: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include Property Images</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePreviewReport}
              disabled={isGenerating || properties.length === 0}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Preview Report
            </button>
            
            <button
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating || properties.length === 0}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate PDF'}
            </button>
            
            <button
              onClick={() => handleGenerateReport('html')}
              disabled={isGenerating || properties.length === 0}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download HTML
            </button>
            
            <button
              onClick={() => handleGenerateReport('csv')}
              disabled={isGenerating || properties.length === 0}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Report Summary */}
        {reportData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Summary</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {getSummaryStats()?.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
            
            {reportData.transactions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  {reportData.transactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()} - {transaction.category}
                      </span>
                      <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {reportData.transactions.length > 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      And {reportData.transactions.length - 5} more transactions...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {properties.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">No Properties Found</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Add some properties to your portfolio to generate reports.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewHtml && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPreview(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[80vh]">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded"
                    title="Report Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}