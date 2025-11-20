// src/components/FinancialDashboard/components/charts/ClientRetentionChart.js

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatting';

// Define colors for each branch
const BRANCH_COLORS = {
  'All': '#000000',        // Black
  'Company': '#6b7280',    // Gray for Company
  'Las Vegas': '#fbbf24',  // Gold
  'Phx - SW': '#3b82f6',   // Blue
  'Phx - SE': '#ef4444',   // Red
  'Phx - N': '#10b981'     // Green
};

export const ClientRetentionChart = ({ data, showDollarValues = false, selectedBranches = [] }) => {
  // Custom tooltip to show branch breakdown
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const metric = data.find(m => m.month === label);
      if (!metric) {
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
            {/* Show data for each line that's in the payload */}
            {payload.map((entry, index) => {
              const branchName = entry.name.replace(' Revenue', '').replace(' %', '');
              const value = entry.value;
              
              if (value === null || value === undefined) return null;
              
              return (
                <div key={index} className="flex justify-between text-xs">
                  <span style={{ color: entry.color }}>{branchName}:</span>
                  <span className="ml-4 font-medium">
                    {showDollarValues ? 
                      formatCurrency(value) : 
                      `${value.toFixed(1)}%`
                    }
                  </span>
                </div>
              );
            })}
            
            {/* Additional metrics for percentage view */}
            {!showDollarValues && metric.lostClients !== null && metric.lostClients !== undefined && (
              <div className="border-t mt-2 pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Lost Properties:</span>
                  <span className="ml-4">{metric.lostClients}</span>
                </div>
                {metric.totalClients > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total Properties:</span>
                    <span className="ml-4">{metric.totalClients}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Get unique list of branches to show
  const branchesToShow = selectedBranches.includes('All') ? ['All'] : selectedBranches;
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis 
          tickFormatter={(value) => showDollarValues ? formatCurrency(value) : `${value}%`}
          domain={showDollarValues ? ['auto', 'auto'] : [70, 100]}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Render a line for each selected branch */}
        {branchesToShow.map(branch => {
          let dataKey;
          let name;
          
          if (branch === 'All') {
            // For 'All', use the aggregated data
            dataKey = showDollarValues ? "retentionDollars" : "retentionPercent";
            name = showDollarValues ? "All Revenue" : "All %";
          } else {
            // For individual branches, use their specific data
            dataKey = showDollarValues ? `${branch}_dollars` : `${branch}_percent`;
            name = showDollarValues ? `${branch} Revenue` : `${branch} %`;
          }
          
          return (
            <Line 
              key={branch}
              type="monotone" 
              dataKey={dataKey}
              stroke={BRANCH_COLORS[branch] || '#6b7280'} 
              name={name}
              strokeWidth={branch === 'All' ? 3 : 2} // Make 'All' line slightly thicker
              connectNulls={false}
              dot={false}
            />
          );
        })}
        
        {/* Target line (90%) - only show in percentage view */}
        {!showDollarValues && (
          <Line 
            dataKey={() => 90} 
            stroke="#9ca3af" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            name="Target (90%)" 
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};