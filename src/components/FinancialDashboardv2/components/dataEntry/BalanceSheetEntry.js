// src/components/FinancialDashboard/components/dataEntry/BalanceSheetEntry.js

import React from 'react';
import { formatCurrency, getFormattedValue, parseCurrencyInput } from '../../utils/formatting';
import { allMonths } from '../../constants';

export const BalanceSheetEntry = ({ balanceSheetData, updateBalanceSheetData, startMonth, endMonth, balanceSheetMetrics }) => {
  return (
    <div className="space-y-6">
      {/* Balance Sheet Data Entry */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Balance Sheet Data Entry</h3>
        <p className="text-sm text-gray-600 mb-6">
          Enter consolidated balance sheet data for each month. All values are company-wide.
        </p>
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <strong>Note:</strong> Monthly Operating Expenses defaults to $1.6M per month but can be adjusted. 
          The "Months of Coverage" metric shows how many months your liquid reserves (Checking + Money Market + ST Treasuries) can cover operating expenses.
        </div>
      </div>

      {/* Balance Sheet Entry Table */}
      {balanceSheetData && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h4 className="font-medium text-gray-900">Monthly Balance Sheet Data</h4>
            <p className="text-sm text-gray-600 mt-1">
              Showing months from {startMonth} to {endMonth} - All values are company-wide
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[600px]">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="bg-white shadow-sm">
                    <th className="sticky left-0 z-20 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300 border-r">Month</th>
                    <th colSpan="6" className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-gray-100 border-b-2 border-gray-300">
                      Current Assets
                    </th>
                    <th colSpan="2" className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-white border-b-2 border-gray-300">
                      Fixed & Other Assets
                    </th>
                    <th colSpan="3" className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-gray-100 border-b-2 border-gray-300">
                      Current Liabilities
                    </th>
                    <th colSpan="3" className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-white border-b-2 border-gray-300">
                      Long Term Liabilities
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-gray-100 border-b-2 border-gray-300">
                      Equity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-white border-b-2 border-gray-300">
                      Monthly Exp
                    </th>
                  </tr>
                  <tr className="bg-white">
                    <th className="sticky left-0 z-20 px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-white border-b border-gray-300 border-r"></th>
                    {/* Current Assets */}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Checking</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Money Market</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">ST Treasuries</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Payroll</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">A/R</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Other Current</th>
                    {/* Fixed & Other Assets */}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">Fixed Assets</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">Other Assets</th>
                    {/* Current Liabilities */}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">A/P</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Credit Cards</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Other Current</th>
                    {/* Long Term Liabilities */}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">Ford Vehicles</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">MidFirst Loans</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">SBA EIDL</th>
                    {/* Equity */}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Total Equity</th>
                    {/* Monthly Expenses */}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">Operating Exp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allMonths.filter(month => month >= startMonth && month <= endMonth).map((month) => (
                    <tr key={month} className="hover:bg-gray-50 group">
                      <td className="sticky left-0 z-10 px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap bg-white group-hover:bg-gray-50 border-r">
                        {month}
                      </td>
                      {/* Current Assets */}
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.checking)}
                          onChange={(e) => updateBalanceSheetData(month, 'checking', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.moneyMarket)}
                          onChange={(e) => updateBalanceSheetData(month, 'moneyMarket', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.stTreasuries)}
                          onChange={(e) => updateBalanceSheetData(month, 'stTreasuries', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.payroll)}
                          onChange={(e) => updateBalanceSheetData(month, 'payroll', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.accountsReceivable)}
                          onChange={(e) => updateBalanceSheetData(month, 'accountsReceivable', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.otherCurrentAssets)}
                          onChange={(e) => updateBalanceSheetData(month, 'otherCurrentAssets', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      {/* Fixed & Other Assets */}
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.fixedAssets)}
                          onChange={(e) => updateBalanceSheetData(month, 'fixedAssets', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.otherAssets)}
                          onChange={(e) => updateBalanceSheetData(month, 'otherAssets', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      {/* Current Liabilities */}
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.accountsPayable)}
                          onChange={(e) => updateBalanceSheetData(month, 'accountsPayable', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.creditCards)}
                          onChange={(e) => updateBalanceSheetData(month, 'creditCards', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.otherCurrentLiabilities)}
                          onChange={(e) => updateBalanceSheetData(month, 'otherCurrentLiabilities', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      {/* Long Term Liabilities */}
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.fordVehicles)}
                          onChange={(e) => updateBalanceSheetData(month, 'fordVehicles', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.midfirstLoans)}
                          onChange={(e) => updateBalanceSheetData(month, 'midfirstLoans', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.sbaEidlLoan)}
                          onChange={(e) => updateBalanceSheetData(month, 'sbaEidlLoan', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      {/* Equity */}
                      <td className="px-4 py-2 bg-gray-50">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(balanceSheetData[month]?.equity)}
                          onChange={(e) => updateBalanceSheetData(month, 'equity', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      {/* Monthly Operating Expenses */}
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$1,600,000"
                          value={getFormattedValue(balanceSheetData[month]?.monthlyOperatingExpenses)}
                          onChange={(e) => updateBalanceSheetData(month, 'monthlyOperatingExpenses', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-blue-50 border-t">
            <p className="text-sm text-blue-800">
              <strong>Tips:</strong> 
              <br />• Liquid Reserves (Checking + Money Market + ST Treasuries) are tracked against monthly operating expenses
              <br />• Target: Maintain at least 3 months of operating expenses in liquid reserves
              <br />• Long-term liabilities are broken down by specific loans (Ford, MidFirst, SBA EIDL)
              <br />• Monthly Operating Expenses default to $1.6M but can be adjusted per month
              <br />• Data is automatically saved as you type
            </p>
          </div>
        </div>
      )}
      
      {/* Balance Sheet Summary */}
      {balanceSheetData && balanceSheetMetrics && balanceSheetMetrics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-medium text-gray-900 mb-4">Balance Sheet Summary - Last 3 Months</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Month</th>
                  <th className="text-right py-2 font-medium">Total Assets</th>
                  <th className="text-right py-2 font-medium">Total Liabilities</th>
                  <th className="text-right py-2 font-medium">Total Equity</th>
                  <th className="text-right py-2 font-medium">Liquid Reserves</th>
                  <th className="text-right py-2 font-medium">Months Coverage</th>
                  <th className="text-right py-2 font-medium">LT Debt/Equity</th>
                  <th className="text-right py-2 font-medium">Current Ratio</th>
                </tr>
              </thead>
              <tbody>
                {balanceSheetMetrics.slice(-3).map((metric) => (
                  <tr key={metric.month} className="border-b">
                    <td className="py-2">{metric.month}</td>
                    <td className="text-right py-2">
                      {metric.totalAssets !== null && metric.totalAssets !== undefined ? 
                        formatCurrency(metric.totalAssets) : '-'}
                    </td>
                    <td className="text-right py-2">
                      {metric.totalLiabilities !== null && metric.totalLiabilities !== undefined ? 
                        formatCurrency(metric.totalLiabilities) : '-'}
                    </td>
                    <td className="text-right py-2">
                      {metric.equity !== null && metric.equity !== undefined ? 
                        formatCurrency(metric.equity) : '-'}
                    </td>
                    <td className="text-right py-2">
                      {metric.liquidReserves !== null && metric.liquidReserves !== undefined ? 
                        formatCurrency(metric.liquidReserves) : '-'}
                    </td>
                    <td className={`text-right py-2 ${
                      metric.monthsOfExpensesCoverage !== null && metric.monthsOfExpensesCoverage !== undefined ?
                        (metric.monthsOfExpensesCoverage >= 3 ? 'text-green-600' : 
                         metric.monthsOfExpensesCoverage >= 1 ? 'text-yellow-600' : 'text-red-600') : ''
                    }`}>
                      {metric.monthsOfExpensesCoverage !== null && metric.monthsOfExpensesCoverage !== undefined ? 
                        metric.monthsOfExpensesCoverage.toFixed(1) : '-'}
                    </td>
                    <td className="text-right py-2">
                      {metric.debtToEquity !== null && metric.debtToEquity !== undefined ? 
                        metric.debtToEquity.toFixed(2) : '-'}
                    </td>
                    <td className="text-right py-2">
                      {metric.currentRatio !== null && metric.currentRatio !== undefined ? 
                        metric.currentRatio.toFixed(2) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};