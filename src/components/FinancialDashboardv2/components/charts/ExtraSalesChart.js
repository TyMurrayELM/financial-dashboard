// src/components/FinancialDashboard/components/charts/ExtraSalesChart.js

import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatPercent, formatCurrency } from '../../utils/formatting';

export const ExtraSalesChart = ({ data, showMaintenanceRevenue = false, showDollarValues = false }) => {
  // Custom formatter for abbreviated currency values
  const formatMillions = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 100000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else {
      return `${(value / 1000).toFixed(0)}K`;
    }
  };
  
  // Calculate the target line value for dollar view
  const getTargetValue = (metric) => {
    if (showDollarValues && metric && metric.maintRevenue) {
      return metric.maintRevenue * 1.2; // 120% of maintenance revenue in dollars
    }
    return 120; // 120% in percentage view
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis 
          yAxisId="left" 
          domain={showDollarValues ? [0, 'auto'] : [0, 'auto']} 
          tickFormatter={(value) => showDollarValues ? formatMillions(value) : `${value}%`}
          label={{ 
            value: showDollarValues ? 'Extra Sales Revenue' : 'Extras % of Maint', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, fill: '#666' },
            offset: 10
          }}
        />
        {showMaintenanceRevenue && (
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tickFormatter={formatMillions} 
            width={75}
            domain={[400000, 'auto']}
            label={{ 
              value: 'Monthly Maint Revenue', 
              angle: 90, 
              position: 'insideRight',
              style: { textAnchor: 'middle', fontSize: 12, fill: '#666' },
              offset: 10
            }}
          />
        )}
        <Tooltip 
          formatter={(value, name) => {
            if (value === null || value === undefined) return 'No data';
            if (name === 'Maintenance Revenue') return formatCurrency(value);
            if (showDollarValues) {
              if (name === 'Target (120% of Maint)') return formatCurrency(value);
              return formatCurrency(value);
            }
            return formatPercent(value);
          }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const metric = data.find(m => m.month === label);
              
              // Check if we have data for this month
              if (!metric || !metric.hasData) {
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-medium text-sm mb-2">{label}</p>
                    <p className="text-xs text-gray-500">No data available</p>
                  </div>
                );
              }
              
              const maintenanceData = payload.find(p => p.name === 'Maintenance Revenue');
              
              if (showDollarValues) {
                // Dollar values tooltip
                const totalExtraSales = (metric.maintWORevenue || 0) + 
                                       (metric.arborRevenue || 0) + 
                                       (metric.enhancementsRevenue || 0) + 
                                       (metric.irrigationRevenue || 0) + 
                                       (metric.sprayPHCRevenue || 0);
                const targetAmount = metric.maintRevenue * 1.2;
                
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-medium text-sm mb-2">{label}</p>
                    {metric.maintWORevenue > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: '#ef4444' }}>Maintenance WO:</span>
                        <span className="ml-4">{formatCurrency(metric.maintWORevenue)}</span>
                      </div>
                    )}
                    {metric.arborRevenue > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: '#10b981' }}>Arbor:</span>
                        <span className="ml-4">{formatCurrency(metric.arborRevenue)}</span>
                      </div>
                    )}
                    {metric.enhancementsRevenue > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: '#8b5cf6' }}>Enhancements:</span>
                        <span className="ml-4">{formatCurrency(metric.enhancementsRevenue)}</span>
                      </div>
                    )}
                    {metric.irrigationRevenue > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: '#3b82f6' }}>Irrigation:</span>
                        <span className="ml-4">{formatCurrency(metric.irrigationRevenue)}</span>
                      </div>
                    )}
                    {metric.sprayPHCRevenue > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: '#f97316' }}>Spray/PHC:</span>
                        <span className="ml-4">{formatCurrency(metric.sprayPHCRevenue)}</span>
                      </div>
                    )}
                    <div className="border-t mt-2 pt-2 flex justify-between items-center text-xs font-medium">
                      <span>Total Extra Sales:</span>
                      <span className={totalExtraSales >= targetAmount ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(totalExtraSales)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                      <span>Target (120% of Maint):</span>
                      <span>{formatCurrency(targetAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                      <span>Maintenance Revenue:</span>
                      <span>{formatCurrency(metric.maintRevenue)}</span>
                    </div>
                    {maintenanceData && (
                      <div className="border-t mt-2 pt-2 flex justify-between items-center text-xs">
                        <span style={{ color: maintenanceData.color }}>Maintenance Revenue Line:</span>
                        <span className="ml-4 font-medium">{formatCurrency(maintenanceData.value)}</span>
                      </div>
                    )}
                  </div>
                );
              } else {
                // Percentage tooltip (original)
                const deptData = payload.filter(p => p.dataKey !== 'targetLine' && p.name !== 'Target (120%)' && p.name !== 'Maintenance Revenue');
                const totalExtraSalesPercent = metric ? metric.extraSalesPercent : 0;
                
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-medium text-sm mb-2">{label}</p>
                    {deptData.map((entry, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="ml-4">{formatPercent(entry.value)}</span>
                      </div>
                    ))}
                    <div className="border-t mt-2 pt-2 flex justify-between items-center text-xs font-medium">
                      <span>Total Extra Sales %:</span>
                      <span className={totalExtraSalesPercent >= 120 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercent(totalExtraSalesPercent)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                      <span>Target:</span>
                      <span>120%</span>
                    </div>
                    {maintenanceData && (
                      <div className="border-t mt-2 pt-2 flex justify-between items-center text-xs">
                        <span style={{ color: maintenanceData.color }}>Maintenance Revenue:</span>
                        <span className="ml-4 font-medium">{formatCurrency(maintenanceData.value)}</span>
                      </div>
                    )}
                  </div>
                );
              }
            }
            return null;
          }}
        />
        <Legend />
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey={showDollarValues ? "maintWORevenue" : "maintWOPercent"}
          stackId="1" 
          stroke="#ef4444" 
          fill="#ef4444" 
          name="Maintenance WO" 
          connectNulls={false}
        />
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey={showDollarValues ? "arborRevenue" : "arborPercent"}
          stackId="1" 
          stroke="#10b981" 
          fill="#10b981" 
          name="Arbor" 
          connectNulls={false}
        />
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey={showDollarValues ? "enhancementsRevenue" : "enhancementsPercent"}
          stackId="1" 
          stroke="#8b5cf6" 
          fill="#8b5cf6" 
          name="Enhancements" 
          connectNulls={false}
        />
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey={showDollarValues ? "irrigationRevenue" : "irrigationPercent"}
          stackId="1" 
          stroke="#3b82f6" 
          fill="#3b82f6" 
          name="Irrigation" 
          connectNulls={false}
        />
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey={showDollarValues ? "sprayPHCRevenue" : "sprayPHCPercent"}
          stackId="1" 
          stroke="#f97316" 
          fill="#f97316" 
          name="Spray/PHC" 
          connectNulls={false}
        />
        <Line 
          yAxisId="left"
          dataKey={(item) => showDollarValues ? getTargetValue(item) : 120}
          stroke="#ef4444" 
          strokeWidth={2} 
          strokeDasharray="5 5" 
          name={showDollarValues ? "Target (120% of Maint)" : "Target (120%)"}
          dot={false}
        />
        {showMaintenanceRevenue && (
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="maintRevenue" 
            stroke="#000000" 
            strokeWidth={3} 
            name="Maintenance Revenue" 
            dot={false}
            connectNulls={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};