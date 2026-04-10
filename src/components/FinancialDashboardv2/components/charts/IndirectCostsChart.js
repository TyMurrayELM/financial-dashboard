// src/components/FinancialDashboard/components/charts/IndirectCostsChart.js

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatting';

// Custom tooltip for Indirect Personnel Costs chart
const IndirectCostsTooltip = ({ active, payload, label, data, selectedRegion, selectedDepartment }) => {
  if (active && payload && payload.length) {
    const metric = data.find(m => m.month === label);
    if (!metric || !metric.hasData) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg" style={{ minWidth: '280px' }}>
          <p className="font-medium text-sm mb-3">{label}</p>
          <p className="text-xs text-gray-500">No data available</p>
        </div>
      );
    }
    
    const percentData = payload.find(p => p.dataKey === 'employeeRelationsPercent' || p.dataKey.includes('employeeRelationsPercent'));
    const headcountData = payload.find(p => p.dataKey === 'indirectHeadcount' || p.dataKey.includes('indirectHeadcount'));
    
    // Check if in Company Consolidated view
    const isCompanyConsolidated = selectedRegion === 'Company' && selectedDepartment === 'All';
    
    return (
      <div className="bg-white p-4 border rounded shadow-lg" style={{ minWidth: '280px' }}>
        <p className="font-medium text-sm mb-3">{label}</p>
        
        <div className="space-y-2 border-b pb-2 mb-2">
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: percentData?.color }}>
              {percentData?.name || 'Indirect Personnel %'}:
            </span>
            <span className="font-medium ml-4">{formatPercent(percentData?.value || 0)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: headcountData?.color }}>
              {headcountData?.name || 'Indirect Headcount'}:
            </span>
            <span className="font-medium ml-4">{Math.round(headcountData?.value || 0)}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-700">
          {isCompanyConsolidated ? (
            <>
              <div className="flex justify-between font-medium">
                <span>Total Company Wages:</span>
                <span>{formatCurrency(metric.totalWages || 0)}</span>
              </div>
              <div className="mt-1 text-gray-600">
                <span>Total Revenue:</span>
                <span className="ml-2">{formatCurrency(metric.revenue || 0)}</span>
              </div>
            </>
          ) : (
            <>
              <p className="font-medium mb-1">Department Wages Breakdown:</p>
              <div className="space-y-1 ml-2">
                {Object.entries(metric.departmentWages || {})
                  .filter(([dept, wages]) => wages > 0)
                  .sort(([,a], [,b]) => b - a)
                  .map(([dept, wages]) => (
                    <div key={dept} className="flex justify-between">
                      <span className="text-gray-600">{dept}:</span>
                      <span className="ml-4">{formatCurrency(wages)}</span>
                    </div>
                  ))}
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between font-medium">
                <span>Total Wages:</span>
                <span>{formatCurrency(metric.totalWages || 0)}</span>
              </div>
              <div className="mt-1 text-gray-600">
                <span>Total Revenue:</span>
                <span className="ml-2">{formatCurrency(metric.revenue || 0)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const IndirectCostsChart = React.memo(({ data, selectedRegion, selectedDepartment, rollingAverages = {} }) => {
  const showAnyRollingAverage = rollingAverages['3m'] || rollingAverages['6m'] || rollingAverages['12m'];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" tickFormatter={(value) => `${value}%`} />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip content={
          <IndirectCostsTooltip 
            data={data} 
            selectedRegion={selectedRegion} 
            selectedDepartment={selectedDepartment} 
          />
        } />
        <Legend />
        
        {/* Original lines - only show when NO rolling averages are selected */}
        {!showAnyRollingAverage && (
          <>
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="employeeRelationsPercent" 
              stroke="#06b6d4" 
              name="Indirect Personnel Costs %" 
              strokeWidth={2} 
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="indirectHeadcount" 
              stroke="#6b7280" 
              name="Indirect Headcount" 
              strokeWidth={2} 
              connectNulls={false}
            />
          </>
        )}
        
        {/* 3-month rolling average lines */}
        {rollingAverages['3m'] && (
          <>
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="employeeRelationsPercentRolling3" 
              stroke="#06b6d4" 
              name="Indirect Personnel Costs % (3m avg)" 
              strokeWidth={2} 
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="indirectHeadcountRolling3" 
              stroke="#6b7280" 
              name="Indirect Headcount (3m avg)" 
              strokeWidth={2} 
              dot={false}
              connectNulls={false}
            />
          </>
        )}
        
        {/* 6-month rolling average lines */}
        {rollingAverages['6m'] && (
          <>
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="employeeRelationsPercentRolling" 
              stroke="#06b6d4" 
              name="Indirect Personnel Costs % (6m avg)" 
              strokeWidth={2.5} 
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="indirectHeadcountRolling" 
              stroke="#6b7280" 
              name="Indirect Headcount (6m avg)" 
              strokeWidth={2.5} 
              dot={false}
              connectNulls={false}
            />
          </>
        )}
        
        {/* 12-month rolling average lines */}
        {rollingAverages['12m'] && (
          <>
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="employeeRelationsPercentRolling12" 
              stroke="#06b6d4" 
              name="Indirect Personnel Costs % (12m avg)" 
              strokeWidth={3} 
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="indirectHeadcountRolling12" 
              stroke="#6b7280" 
              name="Indirect Headcount (12m avg)" 
              strokeWidth={3} 
              dot={false}
              connectNulls={false}
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
});