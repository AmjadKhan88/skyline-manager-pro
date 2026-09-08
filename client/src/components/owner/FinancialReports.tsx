import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Download, Calendar, PieChart as PieChartIcon, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export function FinancialReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const incomeBreakdown = [
    { name: 'Rent Payments', value: 156000, color: '#3b82f6' },
    { name: 'Parking Fees', value: 18000, color: '#8b5cf6' },
    { name: 'Service Charges', value: 12340, color: '#10b981' },
    { name: 'Late Fees', value: 3110, color: '#f59e0b' },
  ];

  const expenseBreakdown = [
    { name: 'Staff Salaries', value: 78000, color: '#ef4444' },
    { name: 'Maintenance', value: 28000, color: '#f59e0b' },
    { name: 'Utilities', value: 15000, color: '#8b5cf6' },
    { name: 'Insurance', value: 8000, color: '#ec4899' },
    { name: 'Other', value: 5000, color: '#6b7280' },
  ];

  const monthlyComparison = [
    { month: 'Aug', income: 145000, expenses: 118000, profit: 27000 },
    { month: 'Sep', income: 152000, expenses: 122000, profit: 30000 },
    { month: 'Oct', income: 168000, expenses: 128000, profit: 40000 },
    { month: 'Nov', income: 175000, expenses: 132000, profit: 43000 },
    { month: 'Dec', income: 182000, expenses: 129000, profit: 53000 },
    { month: 'Jan', income: 189450, expenses: 134000, profit: 55450 },
  ];

  const transactions = [
    { id: 1, type: 'income', category: 'Rent Payment', amount: 1500, tenant: 'Alice Cooper', date: '2026-01-22', status: 'completed' },
    { id: 2, type: 'expense', category: 'Maintenance', amount: 850, vendor: 'ABC Repairs', date: '2026-01-22', status: 'completed' },
    { id: 3, type: 'income', category: 'Parking Fee', amount: 200, tenant: 'Bob Thompson', date: '2026-01-21', status: 'completed' },
    { id: 4, type: 'expense', category: 'Staff Salary', amount: 3200, employee: 'Robert Wilson', date: '2026-01-20', status: 'pending' },
    { id: 5, type: 'income', category: 'Rent Payment', amount: 1800, tenant: 'Carol White', date: '2026-01-20', status: 'completed' },
  ];

  const totalIncome = incomeBreakdown.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + item.value, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Financial Reports
          </h1>
          <p className="text-gray-600">Comprehensive financial overview and transaction history</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Total Income</h3>
          </div>
          <p className="text-3xl font-bold mb-2">${totalIncome.toLocaleString()}</p>
          <p className="text-green-100 text-sm">This month</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Total Expenses</h3>
          </div>
          <p className="text-3xl font-bold mb-2">${totalExpenses.toLocaleString()}</p>
          <p className="text-red-100 text-sm">This month</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Net Profit</h3>
          </div>
          <p className="text-3xl font-bold mb-2">${netProfit.toLocaleString()}</p>
          <p className="text-blue-100 text-sm">This month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Profit Margin</h3>
          </div>
          <p className="text-3xl font-bold mb-2">{profitMargin}%</p>
          <p className="text-purple-100 text-sm">Performance</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Income Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {incomeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {incomeBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {expenseBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">6-Month Financial Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              <FileText className="w-4 h-4" />
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.tenant || transaction.employee || transaction.vendor}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      transaction.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
