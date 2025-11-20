// src/components/FinancialDashboard/components/SummaryCards.js

import React from 'react';
import { DollarSign, TrendingUp, Target, Users } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatting';
import { regions, departments, allMonths } from '../constants';

export const SummaryCards = ({ metrics, selectedRegion, selectedDepartment, data, startMonth, endMonth }) => {
  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
  const totalNetIncome = metrics.reduce((sum, m) => sum + m.netIncome, 0);
  const avgGrossMargin = metrics.reduce((sum, m) => sum + m.grossMargin, 0) / 
    metrics.filter(m => m.grossMargin > 0).length || 0;
  const avgRevPerEmployee = metrics.reduce((sum, m) => sum + m.revenuePerEmployee, 0) / 
    metrics.filter(m => m.revenuePerEmployee > 0).length || 0;

  const calculateRegionRevenue = (region) => {
    return metrics.reduce((sum, metric) => {
      let monthRevenue = 0;
      allMonths.filter(m => m >= startMonth && m <= endMonth).forEach(month => {
        if (month === metric.month) {
          departments.forEach(dept => {
            if (data && data[region] && data[region][dept] && data[region][dept][month]) {
              monthRevenue += data[region][dept][month].revenue || 0;
            }
          });
        }
      });
      return sum + monthRevenue;
    }, 0);
  };

  const calculateDeptRevenue = (dept) => {
    return metrics.reduce((sum, metric) => {
      let monthRevenue = 0;
      allMonths.filter(m => m >= startMonth && m <= endMonth).forEach(month => {
        if (month === metric.month) {
          regions.forEach(region => {
            if (data && data[region] && data[region][dept] && data[region][dept][month]) {
              monthRevenue += data[region][dept][month].revenue || 0;
            }
          });
        }
      });
      return sum + monthRevenue;
    }, 0);
  };

  return (
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
                  <span className="font-medium">{formatCurrency(calculateRegionRevenue(region))}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide font-bold mb-0.5 mt-1">By Department:</div>
              {departments.map(dept => {
                const deptRevenue = calculateDeptRevenue(dept);
                if (deptRevenue > 0) {
                  return (
                    <div key={dept} className="flex justify-between ml-2 text-[10px]">
                      <span className="text-gray-600">{dept}:</span>
                      <span className="font-medium">{formatCurrency(deptRevenue)}</span>
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
            ({formatCurrency(totalRevenue)} - {formatCurrency(metrics.reduce((sum, m) => sum + m.cogs, 0))}) / {formatCurrency(totalRevenue)}
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
            {formatCurrency(totalRevenue)} / {
              (() => {
                let totalEmp = 0;
                metrics.forEach(m => {
                  const monthTotal = m.revenue > 0 ? m.revenue / (m.revenuePerEmployee || 1) : 0;
                  if (monthTotal > 0) totalEmp += monthTotal;
                });
                return Math.round(totalEmp);
              })()
            } employees
          </p>
        </div>
      </div>
    </div>
  );
};