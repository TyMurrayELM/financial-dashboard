// src/components/FinancialDashboardv2/components/dataEntry/ExpenseDataEntry.js

import React, { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
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

  // Get filtered months based on date range
  const filteredMonths = allMonths.filter(month => month >= startMonth && month <= endMonth);

  // Calculate totals for the selected period
  const periodTotals = calculateExpenseTotals(startMonth, endMonth);
  const totalExpenses = Object.values(periodTotals).reduce((sum, val) => sum + val, 0);

  // Export to CSV function
  const exportToCSV = useCallback(() => {
    // Build CSV content
    const headers = ['Category', ...filteredMonths, 'Total'];
    const rows = [];

    // Add each expense category as a row
    Object.entries(expenseCategoryFields).forEach(([field, label]) => {
      const rowData = [label];
      let rowTotal = 0;
      
      filteredMonths.forEach(month => {
        const value = expenseData[month]?.[field] || 0;
        rowData.push(value.toFixed(2));
        rowTotal += value;
      });
      
      rowData.push(rowTotal.toFixed(2));
      rows.push(rowData);
    });

    // Add monthly totals row
    const monthlyTotalsRow = ['MONTHLY TOTAL'];
    let grandTotal = 0;
    filteredMonths.forEach(month => {
      const monthTotal = Object.keys(expenseCategoryFields).reduce(
        (sum, field) => sum + (expenseData[month]?.[field] || 0), 
        0
      );
      monthlyTotalsRow.push(monthTotal.toFixed(2));
      grandTotal += monthTotal;
    });
    monthlyTotalsRow.push(grandTotal.toFixed(2));
    rows.push(monthlyTotalsRow);

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape cells that contain commas or quotes
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expense_categories_${startMonth}_to_${endMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [expenseData, filteredMonths, startMonth, endMonth]);

  // Handle paste event for a row (category)
  const handlePaste = useCallback((e, field) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Excel/Sheets typically uses tabs between cells
    // If tabs exist, split by tabs
    // Otherwise, try to parse comma-separated currency values
    let values;
    
    if (pastedData.includes('\t')) {
      // Tab-separated (standard Excel copy)
      values = pastedData.split('\t').map(v => v.trim());
    } else {
      // Comma-separated - but need to handle currency values like "$164,365.49"
      // Match currency patterns: optional $, numbers with commas, optional decimal
      const currencyPattern = /\$?[\d,]+\.?\d*/g;
      values = pastedData.match(currencyPattern) || [];
    }
    
    // Get the starting column index from the focused cell
    const target = e.target;
    const cellIndex = target.closest('td')?.cellIndex;
    if (cellIndex === undefined || cellIndex < 1) return; // Skip if not in a data cell
    
    const startMonthIndex = cellIndex - 1; // Subtract 1 for the category label column
    
    // Apply values to consecutive months
    values.forEach((value, i) => {
      const monthIndex = startMonthIndex + i;
      if (monthIndex < filteredMonths.length) {
        const month = filteredMonths[monthIndex];
        const parsedValue = parseCurrencyInput(value);
        if (!isNaN(parsedValue)) {
          updateExpenseData(month, field, parsedValue);
        }
      }
    });
  }, [filteredMonths, updateExpenseData]);

  // Format month for display (e.g., "2025-01" -> "Jan 25")
  const formatMonthShort = (month) => {
    const [year, m] = month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(m) - 1]} ${year.slice(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Instructions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Expense Categories Data Entry</h3>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Export to CSV
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Enter detailed expense breakdown by category for each month. This data will be used to generate the Sankey flow chart 
          showing how revenue flows through various expense categories.
        </p>
        <div className="bg-green-50 p-3 rounded mb-3">
          <p className="text-sm text-green-800">
            <strong>💡 Tip:</strong> You can copy a row of values from Excel/Sheets and paste directly into any cell. 
            Values will automatically fill across the months to the right.
          </p>
        </div>
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

      {/* Data Entry Table - Transposed: Categories as rows, Months as columns */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900">Monthly Expense Categories</h4>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredMonths.length} months from {startMonth} to {endMonth}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="bg-white shadow-sm">
                  <th className="sticky left-0 z-20 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300 border-r min-w-[180px]">
                    Category
                  </th>
                  {filteredMonths.map((month) => (
                    <th key={month} className="px-2 py-3 text-center text-xs font-medium text-gray-700 whitespace-nowrap border-b-2 border-gray-300 min-w-[90px]">
                      {formatMonthShort(month)}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-gray-100 border-b-2 border-gray-300 min-w-[100px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(expenseCategoryFields).map(([field, label]) => {
                  const rowTotal = filteredMonths.reduce(
                    (sum, month) => sum + (expenseData[month]?.[field] || 0), 
                    0
                  );
                  
                  return (
                    <tr key={field} className="hover:bg-gray-50 group">
                      <td className="sticky left-0 z-10 px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap bg-white group-hover:bg-gray-50 border-r">
                        {label}
                      </td>
                      {filteredMonths.map((month) => (
                        <td key={month} className="px-1 py-2">
                          <input
                            type="text"
                            className="w-full border rounded px-2 py-1 text-sm text-right"
                            placeholder="$0"
                            value={getFormattedValue(expenseData[month]?.[field])}
                            onChange={(e) => updateExpenseData(month, field, parseCurrencyInput(e.target.value))}
                            onPaste={(e) => handlePaste(e, field)}
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2 bg-gray-50 text-sm font-semibold text-right">
                        {formatCurrency(rowTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Table Footer with Monthly Totals */}
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td className="sticky left-0 z-10 px-4 py-3 text-sm font-bold text-gray-900 bg-gray-100">
                    MONTHLY TOTAL
                  </td>
                  {filteredMonths.map((month) => {
                    const monthTotal = Object.keys(expenseCategoryFields).reduce(
                      (sum, field) => sum + (expenseData[month]?.[field] || 0), 
                      0
                    );
                    
                    return (
                      <td key={month} className="px-2 py-3 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(monthTotal)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 bg-gray-200 text-right">
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
            <br />• <strong>Copy/Paste:</strong> Select a row from Excel, click any cell in that category, paste (Ctrl+V) - values fill across months
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