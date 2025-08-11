'use client'

import { ArrowLeft, MapPin, Calendar, DollarSign, Users, TrendingUp, Download, Edit } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'

interface PropertyDetailsProps {
  property: any
  onBack: () => void
}

export default function PropertyDetails({ property, onBack }: PropertyDetailsProps) {
  const { darkMode } = useTheme()
  
  // Dynamic colors for charts in dark mode
  const gridColor = darkMode ? '#374151' : '#f0f0f0'
  const axisColor = darkMode ? '#9ca3af' : '#6b7280'
  const tooltipBg = darkMode ? '#1f2937' : '#ffffff'
  const tooltipBorder = darkMode ? '#374151' : '#e5e7eb'
  const performanceData = [
    { month: 'Jan', income: 3000, expenses: 750, occupancy: 90 },
    { month: 'Feb', income: 3100, expenses: 780, occupancy: 92 },
    { month: 'Mar', income: 3150, expenses: 800, occupancy: 95 },
    { month: 'Apr', income: 3200, expenses: 750, occupancy: 95 },
    { month: 'May', income: 3200, expenses: 820, occupancy: 95 },
    { month: 'Jun', income: 3200, expenses: 800, occupancy: 95 },
  ]

  const expenseBreakdown = [
    { name: 'Mortgage', value: 400, color: '#3b82f6' },
    { name: 'Maintenance', value: 200, color: '#10b981' },
    { name: 'Insurance', value: 100, color: '#f59e0b' },
    { name: 'Property Tax', value: 100, color: '#ef4444' },
  ]

  const tenants = [
    { unit: '1A', name: 'John Smith', rentAmount: 1200, status: 'Current', since: '2022-03-15' },
    { unit: '1B', name: 'Sarah Johnson', rentAmount: 1100, status: 'Current', since: '2021-07-01' },
    { unit: '2A', name: 'Mike Wilson', rentAmount: 1300, status: 'Current', since: '2023-01-10' },
    { unit: '2B', name: 'Available', rentAmount: 0, status: 'Vacant', since: '-' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Properties
        </button>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 overflow-hidden">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <p className="flex items-center mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              {property.location}
            </p>
          </div>
          <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded dark:text-white">
            <span className="text-sm font-medium">{property.type}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${property.currentValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +{property.appreciation}% since purchase
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${property.monthlyIncome.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Net: ${(property.monthlyIncome - property.expenses).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{property.occupancy}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {property.units - 1}/{property.units} units occupied
                  </p>
                </div>
                <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Annual ROI</p>
                  <p className="text-2xl font-bold text-primary-600">{property.roi}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Above market avg
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
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
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseBreakdown.map((entry, index) => (
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
          <div className="grid grid-cols-2 gap-2 mt-4">
            {expenseBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}: ${item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tenant Information</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Unit</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tenant Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Rent Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Since</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.unit} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{tenant.unit}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{tenant.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {tenant.rentAmount > 0 ? `$${tenant.rentAmount}` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      tenant.status === 'Current' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{tenant.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}