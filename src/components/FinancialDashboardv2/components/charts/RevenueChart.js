// src/components/FinancialDashboardv2/components/charts/RevenueChart.js

import React from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatting';

export const RevenueChart = ({ data, rollingAverages = {}, showDollarValues = false }) => {
  const showAnyRollingAverage = rollingAverages['3m'] || rollingAverages['6m'] || rollingAverages['12m'];
  
  // Determine which data keys to use based on the toggle
  const netIncomeKey = showDollarValues ? 'netIncome' : 'netIncomePercent';
  const grossMarginKey = showDollarValues ? 'grossProfit' : 'grossMargin';
  
  // Process data to create fill areas while keeping the line continuous
  const processedData = data.map(item => ({
    ...item,
    // For the fill effect, we create positive and negative areas
    // IMPORTANT: Preserve null values to break the fill at the same point as the line
    netIncomePercentPositiveFill: item.netIncomePercent === null || item.netIncomePercent === undefined ? null : 
                                   item.netIncomePercent > 0 ? item.netIncomePercent : 0,
    netIncomePercentNegativeFill: item.netIncomePercent === null || item.netIncomePercent === undefined ? null :
                                   item.netIncomePercent < 0 ? item.netIncomePercent : 0,
    netIncomePositiveFill: item.netIncome === null || item.netIncome === undefined ? null :
                           item.netIncome > 0 ? item.netIncome : 0,
    netIncomeNegativeFill: item.netIncome === null || item.netIncome === undefined ? null :
                           item.netIncome < 0 ? item.netIncome : 0,
    // Same for rolling averages
    netIncomePercentRolling3PositiveFill: item.netIncomePercentRolling3 === null || item.netIncomePercentRolling3 === undefined ? null :
                                           item.netIncomePercentRolling3 > 0 ? item.netIncomePercentRolling3 : 0,
    netIncomePercentRolling3NegativeFill: item.netIncomePercentRolling3 === null || item.netIncomePercentRolling3 === undefined ? null :
                                           item.netIncomePercentRolling3 < 0 ? item.netIncomePercentRolling3 : 0,
    netIncomePercentRollingPositiveFill: item.netIncomePercentRolling === null || item.netIncomePercentRolling === undefined ? null :
                                          item.netIncomePercentRolling > 0 ? item.netIncomePercentRolling : 0,
    netIncomePercentRollingNegativeFill: item.netIncomePercentRolling === null || item.netIncomePercentRolling === undefined ? null :
                                          item.netIncomePercentRolling < 0 ? item.netIncomePercentRolling : 0,
    netIncomePercentRolling12PositiveFill: item.netIncomePercentRolling12 === null || item.netIncomePercentRolling12 === undefined ? null :
                                            item.netIncomePercentRolling12 > 0 ? item.netIncomePercentRolling12 : 0,
    netIncomePercentRolling12NegativeFill: item.netIncomePercentRolling12 === null || item.netIncomePercentRolling12 === undefined ? null :
                                            item.netIncomePercentRolling12 < 0 ? item.netIncomePercentRolling12 : 0,
    netIncomeRolling3PositiveFill: item.netIncomeRolling3 === null || item.netIncomeRolling3 === undefined ? null :
                                    item.netIncomeRolling3 > 0 ? item.netIncomeRolling3 : 0,
    netIncomeRolling3NegativeFill: item.netIncomeRolling3 === null || item.netIncomeRolling3 === undefined ? null :
                                    item.netIncomeRolling3 < 0 ? item.netIncomeRolling3 : 0,
    netIncomeRollingPositiveFill: item.netIncomeRolling === null || item.netIncomeRolling === undefined ? null :
                                   item.netIncomeRolling > 0 ? item.netIncomeRolling : 0,
    netIncomeRollingNegativeFill: item.netIncomeRolling === null || item.netIncomeRolling === undefined ? null :
                                   item.netIncomeRolling < 0 ? item.netIncomeRolling : 0,
    netIncomeRolling12PositiveFill: item.netIncomeRolling12 === null || item.netIncomeRolling12 === undefined ? null :
                                     item.netIncomeRolling12 > 0 ? item.netIncomeRolling12 : 0,
    netIncomeRolling12NegativeFill: item.netIncomeRolling12 === null || item.netIncomeRolling12 === undefined ? null :
                                     item.netIncomeRolling12 < 0 ? item.netIncomeRolling12 : 0,
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={processedData} margin={{ left: 10, right: 10 }}>
        <defs>
          {/* Enhanced gradient for positive values - more vibrant green */}
          <linearGradient id="netIncomePositiveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
            <stop offset="50%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.15}/>
          </linearGradient>
          {/* Enhanced gradient for negative values - more vibrant red */}
          <linearGradient id="netIncomeNegativeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
            <stop offset="50%" stopColor="#ef4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.5}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        
        {/* Left Y-axis always shows currency */}
        <YAxis 
          yAxisId="left" 
          tickFormatter={(value) => formatCurrency(value)} 
          width={80} 
        />
        
        {/* Right Y-axis shows either currency or percentage */}
        {showDollarValues ? (
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tickFormatter={(value) => formatCurrency(value)} 
            width={80}
          />
        ) : (
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tickFormatter={(value) => `${value}%`} 
          />
        )}
        
        <Tooltip 
          formatter={(value, name) => {
            if (value === null || value === undefined) return 'No data';
            if (name.includes('Revenue')) return formatCurrency(value);
            if (showDollarValues) return formatCurrency(value);
            return formatPercent(value);
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
                        {entry.value === null || entry.value === undefined ? 
                          'No data' :
                          (entry.name.includes('Revenue') || 
                           (showDollarValues && (entry.name.includes('Gross') || entry.name.includes('Net Income'))))
                            ? formatCurrency(entry.value)
                            : formatPercent(entry.value)
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
        
        {/* Add reference line at 0 for Net Income % (only when showing percentages) */}
        {!showDollarValues && (
          <ReferenceLine 
            yAxisId="right" 
            y={0} 
            stroke="#000000" 
            strokeDasharray="3 3" 
            strokeWidth={1}
            strokeOpacity={0.7}
          />
        )}
        
        {/* Original lines - only show when NO rolling averages are selected */}
        {!showAnyRollingAverage && (
          <>
            {/* Fill areas for Net Income (behind the line) - HIDDEN FROM LEGEND */}
            {!showDollarValues && (
              <>
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="netIncomePercentPositiveFill"
                  fill="url(#netIncomePositiveGradient)"
                  stroke="none"
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="netIncomePercentNegativeFill"
                  fill="url(#netIncomeNegativeGradient)"
                  stroke="none"
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
              </>
            )}
            
            {/* Revenue line */}
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              name="Revenue" 
              strokeWidth={2} 
              connectNulls={false}
              dot={false}
            />
            
            {/* Net Income line - continuous */}
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey={netIncomeKey} 
              stroke="#8b5cf6" 
              name={showDollarValues ? "Net Income" : "Net Income %"} 
              strokeWidth={2}
              connectNulls={false}
              dot={false}
            />
            
            {/* Gross Margin/Profit line */}
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey={grossMarginKey} 
              stroke="#3b82f6" 
              name={showDollarValues ? "Gross Profit" : "Gross Margin %"} 
              strokeWidth={2}
              connectNulls={false}
              dot={false}
            />
          </>
        )}
        
        {/* 3-month rolling average lines */}
        {rollingAverages['3m'] && (
          <>
            {/* Fill areas for rolling average - HIDDEN FROM LEGEND */}
            {!showDollarValues && (
              <>
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="netIncomePercentRolling3PositiveFill"
                  fill="url(#netIncomePositiveGradient)"
                  stroke="none"
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="netIncomePercentRolling3NegativeFill"
                  fill="url(#netIncomeNegativeGradient)"
                  stroke="none"
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
              </>
            )}
            
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="revenueRolling3" 
              stroke="#10b981" 
              name="Revenue (3m avg)" 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey={showDollarValues ? "netIncomeRolling3" : "netIncomePercentRolling3"} 
              stroke="#8b5cf6" 
              name={showDollarValues ? "Net Income (3m avg)" : "Net Income % (3m avg)"} 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey={showDollarValues ? "grossProfitRolling3" : "grossMarginRolling3"} 
              stroke="#3b82f6" 
              name={showDollarValues ? "Gross Profit (3m avg)" : "Gross Margin % (3m avg)"} 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </>
        )}
        
        {/* 6-month rolling average lines */}
        {rollingAverages['6m'] && (
          <>
            {/* Fill areas for rolling average - HIDDEN FROM LEGEND */}
            {!showDollarValues && (
              <>
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="netIncomePercentRollingPositiveFill"
                  fill="url(#netIncomePositiveGradient)"
                  stroke="none"
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="netIncomePercentRollingNegativeFill"
                  fill="url(#netIncomeNegativeGradient)"
                  stroke="none"
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
              </>
            )}
            
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="revenueRolling" 
              stroke="#10b981" 
              name="Revenue (6m avg)" 
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey={showDollarValues ? "netIncomeRolling" : "netIncomePercentRolling"} 
              stroke="#8b5cf6" 
              name={showDollarValues ? "Net Income (6m avg)" : "Net Income % (6m avg)"} 
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey={showDollarValues ? "grossProfitRolling" : "grossMarginRolling"} 
              stroke="#3b82f6" 
              name={showDollarValues ? "Gross Profit (6m avg)" : "Gross Margin % (6m avg)"} 
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
          </>
        )}
        
        {/* 12-month rolling average lines */}
        {rollingAverages['12m'] && (
          <>
            {/* Fill areas for rolling average - HIDDEN FROM LEGEND */}
            {!showDollarValues && (
              <>
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="netIncomePercentRolling12PositiveFill"
                  fill="url(#netIncomePositiveGradient)"
                  stroke="none"
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="netIncomePercentRolling12NegativeFill"
                  fill="url(#netIncomeNegativeGradient)"
                  stroke="none"
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
              </>
            )}
            
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="revenueRolling12" 
              stroke="#10b981" 
              name="Revenue (12m avg)" 
              strokeWidth={3}
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey={showDollarValues ? "netIncomeRolling12" : "netIncomePercentRolling12"} 
              stroke="#8b5cf6" 
              name={showDollarValues ? "Net Income (12m avg)" : "Net Income % (12m avg)"} 
              strokeWidth={3}
              dot={false}
              connectNulls={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey={showDollarValues ? "grossProfitRolling12" : "grossMarginRolling12"} 
              stroke="#3b82f6" 
              name={showDollarValues ? "Gross Profit (12m avg)" : "Gross Margin % (12m avg)"} 
              strokeWidth={3}
              dot={false}
              connectNulls={false}
            />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};