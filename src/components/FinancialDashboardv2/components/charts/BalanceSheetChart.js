// src/components/FinancialDashboard/components/charts/BalanceSheetChart.js

import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatting';

export const BalanceSheetChart = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} width={80} />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          formatter={(value, name) => {
            if (value === null || value === undefined) return 'No data';
            if (name === 'LT Debt/Equity Ratio') return value.toFixed(2);
            return formatCurrency(value);
          }}
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
                        {entry.name === 'LT Debt/Equity Ratio' 
                          ? entry.value?.toFixed(2) || 'N/A' 
                          : formatCurrency(entry.value)}
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
        <Area 
          yAxisId="left" 
          type="monotone" 
          dataKey="totalAssets" 
          stroke="#10b981" 
          fill="#10b981" 
          fillOpacity={0.3} 
          name="Total Assets" 
          connectNulls={false}
        />
        <Area 
          yAxisId="left" 
          type="monotone" 
          dataKey="totalLiabilities" 
          stroke="#ef4444" 
          fill="#ef4444" 
          fillOpacity={0.3} 
          name="Total Liabilities" 
          connectNulls={false}
        />
        <Area 
          yAxisId="left" 
          type="monotone" 
          dataKey="equity" 
          stroke="#3b82f6" 
          fill="#3b82f6" 
          fillOpacity={0.3} 
          name="Total Equity" 
          connectNulls={false}
        />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="debtToEquity" 
          stroke="#f59e0b" 
          strokeWidth={3} 
          name="LT Debt/Equity Ratio" 
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});