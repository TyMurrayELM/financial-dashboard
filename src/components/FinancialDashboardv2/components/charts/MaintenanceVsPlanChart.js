// src/components/FinancialDashboard/components/charts/MaintenanceVsPlanChart.js

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatting';

export const MaintenanceVsPlanChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} />
        <Tooltip 
          formatter={(value) => value !== null ? formatCurrency(value) : 'No data'}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const metric = data.find(m => m.month === label);
              if (!metric) {
                return null;
              }
              
              return (
                <div className="bg-white p-3 border rounded shadow-lg">
                  <p className="font-medium text-sm mb-2">{label}</p>
                  {payload.map((entry, index) => {
                    if (entry.dataKey === 'maintRevenue' && entry.value === null) {
                      return (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span style={{ color: entry.color }}>{entry.name}:</span>
                          <span className="ml-4 text-gray-500">No data yet</span>
                        </div>
                      );
                    }
                    if (entry.dataKey === 'maintForecast' && (entry.value === null || entry.value === undefined)) {
                      // Don't show forecast line in tooltip if no value
                      return null;
                    }
                    return (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="ml-4 font-medium">{formatCurrency(entry.value)}</span>
                      </div>
                    );
                  }).filter(Boolean)}
                  {metric.maintRevenue !== null && metric.maintPlan > 0 && (
                    <div className="border-t mt-2 pt-2 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span>Variance from Plan:</span>
                        <span className={`ml-4 font-medium ${metric.maintRevenue >= metric.maintPlan ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.maintRevenue >= metric.maintPlan ? '+' : ''}{formatCurrency(metric.maintRevenue - metric.maintPlan)}
                          {' '}({((metric.maintRevenue - metric.maintPlan) / metric.maintPlan * 100).toFixed(1)}%)
                        </span>
                      </div>
                      {metric.maintForecast !== null && metric.maintForecast > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span>Variance from Forecast:</span>
                          <span className={`ml-4 font-medium ${metric.maintRevenue >= metric.maintForecast ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.maintRevenue >= metric.maintForecast ? '+' : ''}{formatCurrency(metric.maintRevenue - metric.maintForecast)}
                            {' '}({((metric.maintRevenue - metric.maintForecast) / metric.maintForecast * 100).toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="maintRevenue" 
          stroke="#10b981" 
          name="Actual Maintenance Revenue" 
          strokeWidth={2} 
          connectNulls={false}
        />
        <Line 
          type="monotone" 
          dataKey="maintPlan" 
          stroke="#6b7280" 
          strokeDasharray="5 5" 
          name="Original Forecast" 
          strokeWidth={2} 
          connectNulls={false}
        />
        <Line 
          type="monotone" 
          dataKey="maintForecast" 
          stroke="#f59e0b" 
          strokeDasharray="3 3" 
          name="Current Forecast" 
          strokeWidth={2} 
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};