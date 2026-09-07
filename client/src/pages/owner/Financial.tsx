import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';

export default function Financial() {
  return (
    <div className="p-6 space-y-6 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage invoices, payments, and financial health</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity">
          <FileText size={20} />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 font-medium">Monthly Income</p>
              <h3 className="text-3xl font-bold mt-2">$84,250</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-indigo-100 bg-white/10 w-max px-3 py-1 rounded-full">
            <ArrowUpRight size={16} />
            <span>+12.5% from last month</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Pending Payments</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">$12,400</h3>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 w-max px-3 py-1 rounded-full">
            <ArrowUpRight size={16} />
            <span>8 invoices overdue</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Expenses</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">$32,100</h3>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 w-max px-3 py-1 rounded-full">
            <ArrowDownRight size={16} />
            <span>Maintenance costs up 5%</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-medium mb-2">Recent Transactions</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">The detailed transaction log and invoice management system will be implemented here.</p>
      </div>
    </div>
  );
}
