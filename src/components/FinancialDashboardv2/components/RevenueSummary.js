// src/components/FinancialDashboardv2/components/RevenueSummary.js

import React from 'react';
import { formatCurrency, formatPercent } from '../utils/formatting';

export const RevenueSummary = ({ data, startMonth, endMonth }) => {
  // Calculate totals from the data
  const totals = React.useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRevenue: 0,
        totalNetIncome: 0,
        netIncomePercent: null,
        totalGrossMargin: 0,
        grossMarginPercent: null
      };
    }

    // Filter data to only include months with actual data (hasData: true)
    const validMonths = data.filter(month => month.hasData);

    if (validMonths.length === 0) {
      return {
        totalRevenue: 0,
        totalNetIncome: 0,
        netIncomePercent: null,
        totalGrossMargin: 0,
        grossMarginPercent: null
      };
    }

    const totalRevenue = validMonths.reduce((sum, month) => sum + (month.revenue || 0), 0);
    const totalNetIncome = validMonths.reduce((sum, month) => sum + (month.netIncome || 0), 0);
    const totalCOGS = validMonths.reduce((sum, month) => sum + (month.cogs || 0), 0);
    
    // Calculate total gross margin (Revenue - COGS)
    const totalGrossMargin = totalRevenue - totalCOGS;
    
    // Calculate gross margin percentage
    const grossMarginPercent = totalRevenue > 0 ? (totalGrossMargin / totalRevenue) * 100 : null;

    // Calculate net income as percentage of total revenue
    const netIncomePercent = totalRevenue > 0 ? (totalNetIncome / totalRevenue) * 100 : null;

    return {
      totalRevenue,
      totalNetIncome,
      netIncomePercent,
      totalGrossMargin,
      grossMarginPercent
    };
  }, [data]);

  // Format month display
  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Period Summary: {formatMonthDisplay(startMonth)} - {formatMonthDisplay(endMonth)}
        </h4>
      </div>
      
      <div className="space-y-2">
        {/* Total Revenue */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-700">Total Revenue:</span>
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(totals.totalRevenue)}
          </span>
        </div>

        {/* Total Net Income with % */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-700">Total Net Income:</span>
          <span className={`text-lg font-bold ${totals.totalNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totals.totalNetIncome)}
          </span>
          <span className={`text-sm font-semibold ${totals.netIncomePercent !== null && totals.netIncomePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({totals.netIncomePercent !== null ? formatPercent(totals.netIncomePercent) : 'N/A'})
          </span>
        </div>

        {/* Total Gross Margin with % */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-700">Total Gross Margin:</span>
          <span className="text-lg font-bold text-purple-600">
            {formatCurrency(totals.totalGrossMargin)}
          </span>
          <span className="text-sm font-semibold text-purple-600">
            ({totals.grossMarginPercent !== null ? formatPercent(totals.grossMarginPercent) : 'N/A'})
          </span>
        </div>
      </div>
    </div>
  );
};