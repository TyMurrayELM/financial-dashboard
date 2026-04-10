// src/components/FinancialDashboard/components/charts/RevenuePerEmployeeChart.js

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatting';

export const RevenuePerEmployeeChart = React.memo(({ data, rollingAverages = {}, visibleLines = { all: true, direct: false, indirect: false } }) => {
  const showAnyRollingAverage = rollingAverages['3m'] || rollingAverages['6m'] || rollingAverages['12m'];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip 
          formatter={(value) => value !== null ? formatCurrency(value) : 'No data'}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const metric = data.find(m => m.month === label);
              if (!metric || !metric.hasData) {
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-medium text-sm mb-2">{label}</p>
                    <p className="text-xs text-gray-500">No data available</p>
                  </div>
                );
              }
              
              return (
                <div className="bg-white p-3 border rounded shadow-lg">
                  <p className="font-medium text-sm mb-2">{label}</p>
                  {payload.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <span style={{ color: entry.color }}>{entry.name}:</span>
                      <span className="ml-4 font-medium">
                        {entry.value !== null ? formatCurrency(entry.value) : 'No data'}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        
        {/* Original lines - only show when NO rolling averages are selected */}
        {!showAnyRollingAverage && (
          <>
            {visibleLines.all && (
              <Line 
                type="monotone" 
                dataKey="revenuePerEmployee" 
                stroke="#8b5cf6" 
                name="Revenue per Employee" 
                strokeWidth={2} 
                connectNulls={false}
              />
            )}
            {visibleLines.direct && (
              <Line 
                type="monotone" 
                dataKey="revenuePerDirect" 
                stroke="#10b981" 
                name="Revenue per Direct" 
                strokeWidth={2} 
                connectNulls={false}
              />
            )}
            {visibleLines.indirect && (
              <Line 
                type="monotone" 
                dataKey="revenuePerIndirect" 
                stroke="#f59e0b" 
                name="Revenue per Indirect" 
                strokeWidth={2} 
                connectNulls={false}
              />
            )}
          </>
        )}
        
        {/* 3-month rolling average lines */}
        {rollingAverages['3m'] && (
          <>
            {visibleLines.all && (
              <Line 
                type="monotone" 
                dataKey="revenuePerEmployeeRolling3" 
                stroke="#8b5cf6" 
                name="Revenue per Employee (3m avg)" 
                strokeWidth={2} 
                dot={false}
                connectNulls={false}
              />
            )}
            {visibleLines.direct && (
              <Line 
                type="monotone" 
                dataKey="revenuePerDirectRolling3" 
                stroke="#10b981" 
                name="Revenue per Direct (3m avg)" 
                strokeWidth={2} 
                dot={false}
                connectNulls={false}
              />
            )}
            {visibleLines.indirect && (
              <Line 
                type="monotone" 
                dataKey="revenuePerIndirectRolling3" 
                stroke="#f59e0b" 
                name="Revenue per Indirect (3m avg)" 
                strokeWidth={2} 
                dot={false}
                connectNulls={false}
              />
            )}
          </>
        )}
        
        {/* 6-month rolling average lines */}
        {rollingAverages['6m'] && (
          <>
            {visibleLines.all && (
              <Line 
                type="monotone" 
                dataKey="revenuePerEmployeeRolling" 
                stroke="#8b5cf6" 
                name="Revenue per Employee (6m avg)" 
                strokeWidth={2.5} 
                dot={false}
                connectNulls={false}
              />
            )}
            {visibleLines.direct && (
              <Line 
                type="monotone" 
                dataKey="revenuePerDirectRolling" 
                stroke="#10b981" 
                name="Revenue per Direct (6m avg)" 
                strokeWidth={2.5} 
                dot={false}
                connectNulls={false}
              />
            )}
            {visibleLines.indirect && (
              <Line 
                type="monotone" 
                dataKey="revenuePerIndirectRolling" 
                stroke="#f59e0b" 
                name="Revenue per Indirect (6m avg)" 
                strokeWidth={2.5} 
                dot={false}
                connectNulls={false}
              />
            )}
          </>
        )}
        
        {/* 12-month rolling average lines */}
        {rollingAverages['12m'] && (
          <>
            {visibleLines.all && (
              <Line 
                type="monotone" 
                dataKey="revenuePerEmployeeRolling12" 
                stroke="#8b5cf6" 
                name="Revenue per Employee (12m avg)" 
                strokeWidth={3} 
                dot={false}
                connectNulls={false}
              />
            )}
            {visibleLines.direct && (
              <Line 
                type="monotone" 
                dataKey="revenuePerDirectRolling12" 
                stroke="#10b981" 
                name="Revenue per Direct (12m avg)" 
                strokeWidth={3} 
                dot={false}
                connectNulls={false}
              />
            )}
            {visibleLines.indirect && (
              <Line 
                type="monotone" 
                dataKey="revenuePerIndirectRolling12" 
                stroke="#f59e0b" 
                name="Revenue per Indirect (12m avg)" 
                strokeWidth={3} 
                dot={false}
                connectNulls={false}
              />
            )}
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
});