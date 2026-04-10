// src/components/FinancialDashboardv2/components/charts/ClientRetentionChart.js

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
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

export const ClientRetentionChart = React.memo(({ data, showDollarValues = false, selectedBranches = [], onHoverMonth }) => {
  // Custom tooltip to show branch breakdown and properties lost
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const metric = data.find(m => m.month === label);
      
      // Call onHoverMonth when tooltip is active
      if (onHoverMonth) {
        onHoverMonth(label);
      }
      
      if (!metric) {
        return (
          <div className="bg-white p-3 border rounded shadow-lg">
            <p className="font-medium text-sm mb-2">{label}</p>
            <p className="text-xs text-gray-500">No data available</p>
          </div>
        );
      }
      
      // Parse properties lost list to extract branch and properties
      const parsePropertiesLostByBranch = (propertiesLostList) => {
        if (!propertiesLostList || propertiesLostList.trim() === '') return [];
        
        const propertiesByBranch = {};
        let currentBranch = null;
        const lines = propertiesLostList.split('\n');
        
        lines.forEach(line => {
          // Check if line starts with a branch name followed by colon
          const branchMatch = line.match(/^(Company|Las Vegas|Phx - SW|Phx - SE|Phx - N):\s*(.*)$/);
          if (branchMatch) {
            currentBranch = branchMatch[1];
            const properties = branchMatch[2].trim();
            if (properties) {
              if (!propertiesByBranch[currentBranch]) {
                propertiesByBranch[currentBranch] = [];
              }
              propertiesByBranch[currentBranch].push(properties);
            }
          } else if (line.trim()) {
            // Line without branch prefix - add to current branch or 'Other'
            const branch = currentBranch || 'Other';
            if (!propertiesByBranch[branch]) {
              propertiesByBranch[branch] = [];
            }
            propertiesByBranch[branch].push(line.trim());
          }
        });
        
        // Convert to array format for rendering
        return Object.entries(propertiesByBranch).map(([branch, properties]) => ({
          branch,
          properties
        }));
      };
      
      const propertiesByBranch = parsePropertiesLostByBranch(metric.propertiesLostList);
      
      return (
        <div className="bg-white p-3 border rounded shadow-lg max-w-md">
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
            
            {/* Properties Lost List - colored by branch */}
            {propertiesByBranch.length > 0 && (
              <div className="border-t mt-2 pt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Properties Lost:</p>
                <div className="text-xs max-h-32 overflow-y-auto space-y-1">
                  {propertiesByBranch.map((item, idx) => {
                    const branchColor = BRANCH_COLORS[item.branch] || '#6b7280';
                    return (
                      <div key={idx}>
                        <span style={{ color: branchColor, fontWeight: 600 }}>{item.branch}: </span>
                        <span style={{ color: branchColor }}>
                          {item.properties.join(', ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Clear hovered month when tooltip is not active
      if (onHoverMonth) {
        onHoverMonth(null);
      }
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
        
        {/* 90% Target Line for percentage view */}
        {!showDollarValues && (
          <ReferenceLine 
            y={90} 
            stroke="#ef4444" 
            strokeDasharray="5 5" 
            label={{ value: '90% Target', position: 'right', fontSize: 10, fill: '#ef4444' }}
          />
        )}
        
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
              strokeWidth={branch === 'All' ? 2 : 1.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
});