// src/components/FinancialDashboardv2/components/dataEntry/ExpenseDataEntry.js

import React, { useState } from 'react';
import { formatCurrency, getFormattedValue, parseCurrencyInput } from '../../utils/formatting';
import { allMonths, expenseCategoryFields } from '../../constants';

export const ExpenseDataEntry = ({ 
  expenseData, 
  updateExpenseData, 
  startMonth, 
  endMonth,
  calculateExpenseTotals 
}) => {
  const [showSummary, setShowSummary] = useState(true);

  // Calculate totals for the selected period
  const periodTotals = calculateExpenseTotals(startMonth, endMonth);
  const totalExpenses = Object.values(periodTotals).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      {/* Header and Instructions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Expense Categories Data Entry</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter detailed expense breakdown by category for each month. This data will be used to generate the Sankey flow chart 
          showing how revenue flows through various expense categories.
        </p>
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Some of these values may overlap with data already entered in the P&L section (like COGS, Vehicle Expenses, and Wages).
            For the most accurate Sankey chart, ensure consistency between both data entry sections or consider using one as the primary source.
          </p>
        </div>
      </div>

      {/* Summary Section */}
      {showSummary && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Period Summary ({startMonth} to {endMonth})</h4>
            <button
              onClick={() => setShowSummary(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Hide Summary
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(expenseCategoryFields).map(([field, label]) => {
              const value = periodTotals[field];
              const percentage = totalExpenses > 0 ? (value / totalExpenses * 100).toFixed(1) : 0;
              
              return (
                <div key={field} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                    <p className="text-xs text-gray-500">{percentage}% of total</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(value)}</p>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-base font-semibold text-gray-900">Total Expenses</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Show Summary Button (when hidden) */}
      {!showSummary && (
        <div className="text-center">
          <button
            onClick={() => setShowSummary(true)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Show Period Summary
          </button>
        </div>
      )}

      {/* Data Entry Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900">Monthly Expense Categories</h4>
          <p className="text-sm text-gray-600 mt-1">
            Showing months from {startMonth} to {endMonth}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="bg-white shadow-sm">
                  <th className="sticky left-0 z-20 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300 border-r">
                    Month
                  </th>
                  {Object.entries(expenseCategoryFields).map(([field, label]) => (
                    <th key={field} className="px-4 py-3 text-left text-xs font-medium text-gray-700 whitespace-nowrap border-b-2 border-gray-300">
                      {label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-gray-100 border-b-2 border-gray-300">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allMonths.filter(month => month >= startMonth && month <= endMonth).map((month) => {
                  const monthTotal = Object.keys(expenseCategoryFields).reduce(
                    (sum, field) => sum + (expenseData[month]?.[field] || 0), 
                    0
                  );
                  
                  return (
                    <tr key={month} className="hover:bg-gray-50 group">
                      <td className="sticky left-0 z-10 px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap bg-white group-hover:bg-gray-50 border-r">
                        {month}
                      </td>
                      {Object.keys(expenseCategoryFields).map((field) => (
                        <td key={field} className="px-4 py-2">
                          <input
                            type="text"
                            className="w-28 border rounded px-2 py-1 text-sm"
                            placeholder="$0"
                            value={getFormattedValue(expenseData[month]?.[field])}
                            onChange={(e) => updateExpenseData(month, field, parseCurrencyInput(e.target.value))}
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2 bg-gray-50 text-sm font-semibold">
                        {formatCurrency(monthTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Table Footer with Totals */}
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td className="sticky left-0 z-10 px-4 py-3 text-sm font-bold text-gray-900 bg-gray-100">
                    TOTAL
                  </td>
                  {Object.keys(expenseCategoryFields).map((field) => {
                    const fieldTotal = allMonths
                      .filter(month => month >= startMonth && month <= endMonth)
                      .reduce((sum, month) => sum + (expenseData[month]?.[field] || 0), 0);
                    
                    return (
                      <td key={field} className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(fieldTotal)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 bg-gray-200">
                    {formatCurrency(totalExpenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-blue-50 border-t">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong>
            <br />• COGS Labor: Direct labor costs included in Cost of Goods Sold
            <br />• COGS Material: Materials, equipment, and other direct costs
            <br />• Indirect Payroll Costs: Salaries for admin, management, and support staff
            <br />• Other Income & Expenses: Use negative values for other income sources
            <br />• Data is automatically saved as you type
          </p>
        </div>
      </div>
    </div>
  );
};