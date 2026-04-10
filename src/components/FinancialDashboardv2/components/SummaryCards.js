// src/components/FinancialDashboardv2/components/SummaryCards.js

import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Target, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatting';
import { regions, departments, allMonths } from '../constants';

export const SummaryCards = React.memo(({ metrics, selectedRegion, selectedDepartment, data, startMonth, endMonth }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { totalRevenue, totalNetIncome, totalCogs, avgGrossMargin, avgRevPerEmployee, totalEmployees } = useMemo(() => {
    const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalNetIncome = metrics.reduce((sum, m) => sum + m.netIncome, 0);
    const totalCogs = metrics.reduce((sum, m) => sum + m.cogs, 0);
    const grossMarginEntries = metrics.filter(m => m.grossMargin > 0);
    const avgGrossMargin = grossMarginEntries.length > 0
      ? metrics.reduce((sum, m) => sum + m.grossMargin, 0) / grossMarginEntries.length
      : 0;
    const revPerEmpEntries = metrics.filter(m => m.revenuePerEmployee > 0);
    const avgRevPerEmployee = revPerEmpEntries.length > 0
      ? metrics.reduce((sum, m) => sum + m.revenuePerEmployee, 0) / revPerEmpEntries.length
      : 0;
    let totalEmployees = 0;
    metrics.forEach(m => {
      const monthTotal = m.revenue > 0 ? m.revenue / (m.revenuePerEmployee || 1) : 0;
      if (monthTotal > 0) totalEmployees += monthTotal;
    });
    return { totalRevenue, totalNetIncome, totalCogs, avgGrossMargin, avgRevPerEmployee, totalEmployees: Math.round(totalEmployees) };
  }, [metrics]);

  const filteredMonths = useMemo(() => allMonths.filter(m => m >= startMonth && m <= endMonth), [startMonth, endMonth]);

  const regionRevenues = useMemo(() => {
    const result = {};
    regions.forEach(region => {
      let total = 0;
      filteredMonths.forEach(month => {
        departments.forEach(dept => {
          if (data?.[region]?.[dept]?.[month]) {
            total += data[region][dept][month].revenue || 0;
          }
        });
      });
      result[region] = total;
    });
    return result;
  }, [data, filteredMonths]);

  const deptRevenues = useMemo(() => {
    const result = {};
    departments.forEach(dept => {
      let total = 0;
      filteredMonths.forEach(month => {
        regions.forEach(region => {
          if (data?.[region]?.[dept]?.[month]) {
            total += data[region][dept][month].revenue || 0;
          }
        });
      });
      result[dept] = total;
    });
    return result;
  }, [data, filteredMonths]);

  return (
    <div>
      {/* Collapse toggle */}
      <div 
        className="flex items-center gap-2 mb-2 px-3 py-2 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">Summary Metrics</span>
      </div>
      
      {/* Cards */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500 flex-shrink-0" />
            </div>
            {selectedRegion === 'All' && selectedDepartment === 'All' && (
              <div className="mt-2 pt-2 border-t text-[11px] text-gray-600 space-y-1 max-h-36 overflow-y-auto">
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-bold mb-0.5">By Region:</div>
                  {regions.map(region => (
                    <div key={region} className="flex justify-between ml-2 text-[10px]">
                      <span className="text-gray-600">{region}:</span>
                      <span className="font-medium">{formatCurrency(regionRevenues[region])}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-bold mb-0.5 mt-1">By Department:</div>
                  {departments.map(dept => {
                    if (deptRevenues[dept] > 0) {
                      return (
                        <div key={dept} className="flex justify-between ml-2 text-[10px]">
                          <span className="text-gray-600">{dept}:</span>
                          <span className="font-medium">{formatCurrency(deptRevenues[dept])}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Avg Gross Margin</p>
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercent(avgGrossMargin)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Revenue - COGS) / Revenue
              </p>
              <p className="text-[10px] text-gray-600 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                ({formatCurrency(totalRevenue)} - {formatCurrency(totalCogs)}) / {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Net Income</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalNetIncome)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  NI %: {formatPercent(
                    totalRevenue > 0 ? (totalNetIncome / totalRevenue) * 100 : 0
                  )}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500 flex-shrink-0" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Avg Rev/Employee</p>
                <Users className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(avgRevPerEmployee)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Revenue / Total Employees
              </p>
              <p className="text-[10px] text-gray-600 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(totalRevenue)} / {totalEmployees} employees
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});