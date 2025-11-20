// src/components/FinancialDashboard/components/charts/VehicleCostsChart.js

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatting';

export const VehicleCostsChart = ({ data, rollingAverages = {} }) => {
  const showAnyRollingAverage = rollingAverages['3m'] || rollingAverages['6m'] || rollingAverages['12m'];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          formatter={(value, name) => {
            if (value === null || value === undefined) return 'No data';
            if (name.includes('Active Vehicles')) return Math.round(value);
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
                  <div className="space-y-1">
                    {payload.map((entry, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="ml-4 font-medium">
                          {entry.value === null || entry.value === undefined ? 'No data' :
                            entry.name.includes('Active Vehicles') ? 
                            Math.round(entry.value) : 
                            formatCurrency(entry.value)
                          }
                        </span>
                      </div>
                    ))}
                    {metric.totalVehicleRepairMaint !== undefined && (
                      <div className="border-t mt-2 pt-2 flex justify-between text-xs text-gray-600">
                        <span>Total Vehicle Costs:</span>
                        <span className="ml-4">{formatCurrency(metric.totalVehicleRepairMaint || 0)}</span>
                      </div>
                    )}
                  </div>
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
              dataKey="vehicleMaintPerVehicle" 
              stroke="#ef4444" 
              name="Vehicle Maint/Repair per Vehicle" 
              strokeWidth={2}
              connectNulls={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="activeVehicles" 
              stroke="#6b7280" 
              strokeWidth={2}
              name="Active Vehicles" 
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
              dataKey="vehicleMaintPerVehicleRolling3" 
              stroke="#ef4444" 
              name="Vehicle Maint/Repair per Vehicle (3m avg)" 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="activeVehiclesRolling3" 
              stroke="#6b7280" 
              strokeWidth={2}
              name="Active Vehicles (3m avg)" 
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
              dataKey="vehicleMaintPerVehicleRolling" 
              stroke="#ef4444" 
              name="Vehicle Maint/Repair per Vehicle (6m avg)" 
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="activeVehiclesRolling" 
              stroke="#6b7280" 
              strokeWidth={2.5}
              name="Active Vehicles (6m avg)" 
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
              dataKey="vehicleMaintPerVehicleRolling12" 
              stroke="#ef4444" 
              name="Vehicle Maint/Repair per Vehicle (12m avg)" 
              strokeWidth={3}
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="activeVehiclesRolling12" 
              stroke="#6b7280" 
              strokeWidth={3}
              name="Active Vehicles (12m avg)" 
              dot={false}
              connectNulls={false}
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};