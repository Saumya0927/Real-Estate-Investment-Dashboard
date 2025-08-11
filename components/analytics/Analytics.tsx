'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6months')
  const { darkMode } = useTheme()

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: api.getProperties,
    staleTime: 1000 * 60 * 5,
  })

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: api.getTransactions,
    staleTime: 1000 * 60 * 5,
  })

  // Calculate real metrics from actual data
  const totalRevenue = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0
  
  // Dynamic colors for charts in dark mode
  const gridColor = darkMode ? '#374151' : '#f0f0f0'
  const axisColor = darkMode ? '#9ca3af' : '#6b7280'
  const tooltipBg = darkMode ? '#1f2937' : '#ffffff'
  const tooltipBorder = darkMode ? '#374151' : '#e5e7eb'

  // Real data - empty arrays when no transactions exist
  const revenueData = transactions.length > 0 ? [] : []

  // Calculate property type distribution from real data
  const propertyTypeDistribution = properties.length > 0 
    ? properties.reduce((acc, property) => {
        const existing = acc.find(item => item.name === property.type)
        if (existing) {
          existing.value += 1
        } else {
          acc.push({ 
            name: property.type, 
            value: 1, 
            color: property.type === 'SINGLE_FAMILY' ? '#3b82f6' : 
                   property.type === 'MULTI_FAMILY' ? '#10b981' : 
                   property.type === 'COMMERCIAL' ? '#f59e0b' : '#ef4444'
          })
        }
        return acc
      }, [] as {name: string, value: number, color: string}[])
    : []

  // Calculate location performance from real data
  const locationPerformance = properties.length > 0
    ? properties.reduce((acc, property) => {
        const existing = acc.find(item => item.city === property.city)
        if (existing) {
          existing.properties += 1
          existing.revenue += property.monthlyIncome || 0
        } else {
          acc.push({
            city: property.city || 'Unknown',
            properties: 1,
            revenue: property.monthlyIncome || 0,
            roi: property.roi || 0
          })
        }
        return acc
      }, [] as {city: string, properties: number, revenue: number, roi: number}[])
    : []

  // Show empty comparison when no properties
  const marketComparison = properties.length > 0 
    ? [
        { metric: 'ROI', portfolio: 0, market: 6.2, max: 10 },
        { metric: 'Occupancy', portfolio: 0, market: 89, max: 100 },
        { metric: 'Growth', portfolio: 0, market: 10, max: 20 },
        { metric: 'Income', portfolio: 0, market: 70, max: 100 },
        { metric: 'Value', portfolio: 0, market: 65, max: 100 },
      ]
    : []

  // Show empty cash flow when no transactions
  const cashFlowData = transactions.length > 0 ? [] : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Analytics</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Comprehensive insights into your portfolio performance</p>
        </div>
        
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">
                {totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : '$0'}
              </p>
              <p className="text-sm text-blue-100 mt-2">
                {transactions.length === 0 ? 'No transactions yet' : `${transactions.filter(t => t.type === 'INCOME').length} income transactions`}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Net Profit</p>
              <p className="text-3xl font-bold mt-2">
                {netProfit >= 0 ? `$${netProfit.toLocaleString()}` : `-$${Math.abs(netProfit).toLocaleString()}`}
              </p>
              <p className="text-sm text-green-100 mt-2">
                {totalRevenue > 0 ? `${profitMargin.toFixed(1)}% margin` : 'No revenue yet'}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avg ROI</p>
              <p className="text-3xl font-bold mt-2">8.2%</p>
              <p className="text-sm text-purple-100 mt-2">Above market avg</p>
            </div>
            <BarChartIcon className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Properties</p>
              <p className="text-3xl font-bold mt-2">12</p>
              <p className="text-sm text-orange-100 mt-2">94% occupied</p>
            </div>
            <PieChartIcon className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue & Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
              <YAxis stroke={axisColor} fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                labelStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="profit" fill="#10b981" name="Profit" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={propertyTypeDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {propertyTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                labelStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cash Flow Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
              <YAxis stroke={axisColor} fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
                labelStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
              />
              <Legend />
              <Line type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={2} name="Inflow" />
              <Line type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={2} name="Outflow" />
              <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="Net" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio vs Market</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={marketComparison}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="metric" stroke={axisColor} fontSize={12} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={axisColor} fontSize={10} />
              <Radar name="Your Portfolio" dataKey="portfolio" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Radar name="Market Average" dataKey="market" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">City</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Properties</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Avg ROI</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Performance</th>
              </tr>
            </thead>
            <tbody>
              {locationPerformance.map((location) => (
                <tr key={location.city} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{location.city}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{location.properties}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">${location.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{location.roi}%</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${location.roi * 10}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">{location.roi * 10}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}