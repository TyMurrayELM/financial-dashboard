// src/components/FinancialDashboardv2/components/RevenueSummary.js

import React from 'react';
import { formatCurrency, formatPercent } from '../utils/formatting';

export const RevenueSummary = ({ data, rawData, startMonth, endMonth }) => {
  // Calculate totals from the filtered data (for period summary)
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

  // Calculate yearly Net Income totals from RAW data (ignoring date filters)
  const yearlyTotals = React.useMemo(() => {
    // Use rawData which is the unfiltered financialData.data
    // Structure is: rawData[region][department][month]
    
    // First try to use rawData if available
    if (rawData && typeof rawData === 'object') {
      const companyData = rawData['Company']?.['Company Total'];
      
      if (companyData && typeof companyData === 'object') {
        const yearlyData = {};
        
        Object.keys(companyData).forEach(month => {
          if (!month || typeof month !== 'string' || !month.includes('-')) return;
          
          const year = month.substring(0, 4);
          const monthData = companyData[month];
          
          // Check if there's actual data (revenue > 0 or netIncome is not 0)
          if (monthData && (monthData.revenue > 0 || (monthData.netIncome !== undefined && monthData.netIncome !== 0))) {
            if (!yearlyData[year]) {
              yearlyData[year] = { year, revenue: 0, netIncome: 0, monthCount: 0 };
            }
            yearlyData[year].revenue += (parseFloat(monthData.revenue) || 0);
            yearlyData[year].netIncome += (parseFloat(monthData.netIncome) || 0);
            yearlyData[year].monthCount += 1;
          }
        });

        const years = ['2023', '2024', '2025', '2026'];
        const result = years.map(year => {
          const yd = yearlyData[year];
          if (!yd || yd.monthCount === 0) return { year, netIncome: null, niPercent: null, isYTD: false, monthCount: 0 };
          const niPercent = yd.revenue > 0 ? (yd.netIncome / yd.revenue) * 100 : null;
          return { year, netIncome: yd.netIncome, niPercent, isYTD: yd.monthCount < 12, monthCount: yd.monthCount };
        });
        
        // Only return if we found some data
        if (result.some(r => r.netIncome !== null)) {
          return result;
        }
      }
    }
    
    // Fallback to filtered data if rawData didn't work
    if (!data || data.length === 0) {
      const years = ['2023', '2024', '2025', '2026'];
      return years.map(year => ({ year, netIncome: null, niPercent: null, isYTD: false, monthCount: 0 }));
    }

    const validMonths = data.filter(month => month.hasData && month.month);
    const yearlyData = {};
    validMonths.forEach(month => {
      const year = month.month.substring(0, 4);
      if (!yearlyData[year]) {
        yearlyData[year] = { year, revenue: 0, netIncome: 0, monthCount: 0 };
      }
      yearlyData[year].revenue += (month.revenue || 0);
      yearlyData[year].netIncome += (month.netIncome || 0);
      yearlyData[year].monthCount += 1;
    });

    const years = ['2023', '2024', '2025', '2026'];
    return years.map(year => {
      const yd = yearlyData[year];
      if (!yd) return { year, netIncome: null, niPercent: null, isYTD: false, monthCount: 0 };
      const niPercent = yd.revenue > 0 ? (yd.netIncome / yd.revenue) * 100 : null;
      return { year, netIncome: yd.netIncome, niPercent, isYTD: yd.monthCount < 12, monthCount: yd.monthCount };
    });
  }, [rawData, data]);

  // Format month display
  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex gap-6">
        {/* Left side - Period Summary */}
        <div className="flex-1">
          <div className="mb-3">
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

        {/* Right side - Yearly Revenue and Net Income */}
        <div className="border-l border-blue-200 pl-6">
          <div className="flex gap-6">
            {/* Yearly Revenue */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Yearly Revenue
              </h4>
              <div className="space-y-1">
                {yearlyTotals.map(({ year, netIncome, niPercent, isYTD, monthCount }) => {
                  // Find the revenue for this year from the same data
                  const yearRevenue = rawData?.['Company']?.['Company Total'] 
                    ? Object.keys(rawData['Company']['Company Total'])
                        .filter(month => month.startsWith(year))
                        .reduce((sum, month) => {
                          const monthData = rawData['Company']['Company Total'][month];
                          return sum + (parseFloat(monthData?.revenue) || 0);
                        }, 0)
                    : null;
                  
                  const hasData = yearRevenue !== null && yearRevenue > 0;
                  
                  return (
                    <div key={year} className="flex items-baseline gap-2 text-sm">
                      <span className="font-medium text-gray-600 w-16">
                        {year}{isYTD && monthCount > 0 ? ' YTD' : ''}:
                      </span>
                      {hasData ? (
                        <span className="font-bold text-blue-600">
                          {formatCurrency(yearRevenue)}
                        </span>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Yearly Net Income */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Yearly Net Income
              </h4>
              <div className="space-y-1">
                {yearlyTotals.map(({ year, netIncome, niPercent, isYTD, monthCount }) => (
                  <div key={year} className="flex items-baseline gap-2 text-sm">
                    <span className="font-medium text-gray-600 w-16">
                      {year}{isYTD && monthCount > 0 ? ' YTD' : ''}:
                    </span>
                    {netIncome !== null ? (
                      <>
                        <span className={`font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(netIncome)}
                        </span>
                        <span className={`text-xs ${niPercent !== null && niPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({niPercent !== null ? formatPercent(niPercent) : 'N/A'})
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">No data</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};