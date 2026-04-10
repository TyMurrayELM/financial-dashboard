// src/components/FinancialDashboard/components/charts/MaintenanceLaborChart.js

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatPercent } from '../../utils/formatting';

export const MaintenanceLaborChart = React.memo(({ data, rollingAverages = {} }) => {
  const showAnyRollingAverage = rollingAverages['3m'] || rollingAverages['6m'] || rollingAverages['12m'];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis 
          yAxisId="left" 
          tickFormatter={(value) => `${value}%`}
          label={{ 
            value: 'Maint DL %', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, fill: '#666' },
            offset: 10
          }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right"
          label={{ 
            value: 'Maint Headcount', 
            angle: 90, 
            position: 'insideRight',
            style: { textAnchor: 'middle', fontSize: 12, fill: '#666' },
            offset: 10
          }}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (value === null || value === undefined) return 'No data';
            if (name === 'Direct Labor Headcount') return Math.round(value);
            const formattedValue = formatPercent(value);
            // Add rolling average indicator to tooltip
            if (name.includes('(3m avg)')) return `${formattedValue} (3m avg)`;
            if (name.includes('(6m avg)')) return `${formattedValue} (6m avg)`;
            if (name.includes('(12m avg)')) return `${formattedValue} (12m avg)`;
            return formattedValue;
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
                        {entry.value === null || entry.value === undefined ? 'No data' :
                          entry.name === 'Direct Labor Headcount' ? Math.round(entry.value) :
                          formatPercent(entry.value)
                        }
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
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="maintOnlyDirectLaborPercent" 
              stroke="#3b82f6" 
              name="Maintenance DL %" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              connectNulls={false}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="maintOnsiteDirectLaborPercent" 
              stroke="#f97316" 
              name="Maintenance Onsite DL %" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              connectNulls={false}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="maintDirectLaborPercent" 
              stroke="#10b981" 
              name="All Maintenance DL %" 
              strokeWidth={3} 
              strokeDasharray="5 5" 
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
              dataKey="maintOnlyDirectLaborPercentRolling3" 
              stroke="#3b82f6" 
              name="Maintenance DL % (3m avg)" 
              strokeWidth={2} 
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="maintOnsiteDirectLaborPercentRolling3" 
              stroke="#f97316" 
              name="Maintenance Onsite DL % (3m avg)" 
              strokeWidth={2} 
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="maintDirectLaborPercentRolling3" 
              stroke="#10b981" 
              name="All Maintenance DL % (3m avg)" 
              strokeWidth={3} 
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
              dataKey="maintOnlyDirectLaborPercentRolling" 
              stroke="#3b82f6" 
              name="Maintenance DL % (6m avg)" 
              strokeWidth={2.5} 
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="maintOnsiteDirectLaborPercentRolling" 
              stroke="#f97316" 
              name="Maintenance Onsite DL % (6m avg)" 
              strokeWidth={2.5} 
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="maintDirectLaborPercentRolling" 
              stroke="#10b981" 
              name="All Maintenance DL % (6m avg)" 
              strokeWidth={4} 
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
              dataKey="maintOnlyDirectLaborPercentRolling12" 
              stroke="#3b82f6" 
              name="Maintenance DL % (12m avg)" 
              strokeWidth={3} 
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="maintOnsiteDirectLaborPercentRolling12" 
              stroke="#f97316" 
              name="Maintenance Onsite DL % (12m avg)" 
              strokeWidth={3} 
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="maintDirectLaborPercentRolling12" 
              stroke="#10b981" 
              name="All Maintenance DL % (12m avg)" 
              strokeWidth={4.5} 
              dot={false}
              connectNulls={false}
            />
          </>
        )}
        
        {/* Target line - always show */}
        <Line 
          yAxisId="left"
          dataKey={() => 40} 
          stroke="#ef4444" 
          strokeWidth={2} 
          strokeDasharray="5 5"
          name="Target (40%)" 
          dot={false}
        />
        
        {/* Headcount line - always show */}
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="directLaborHeadcount" 
          stroke="#6b7280" 
          name="Direct Labor Headcount" 
          strokeWidth={2} 
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});