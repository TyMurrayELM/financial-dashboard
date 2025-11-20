// src/components/FinancialDashboard/components/charts/ReservesChart.js

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatting';

export const ReservesChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} width={80} />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          formatter={(value, name) => {
            if (value === null || value === undefined) return 'No data';
            if (name === 'Months of Coverage') return value.toFixed(1) + ' months';
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
                    <div className="flex justify-between text-xs">
                      <span>Checking:</span>
                      <span className="ml-4 font-medium">{formatCurrency(metric.checking)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Money Market:</span>
                      <span className="ml-4 font-medium">{formatCurrency(metric.moneyMarket)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>ST Treasuries:</span>
                      <span className="ml-4 font-medium">{formatCurrency(metric.stTreasuries)}</span>
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between text-xs font-medium">
                      <span>Total Liquid Reserves:</span>
                      <span className="text-green-600">{formatCurrency(metric.liquidReserves)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Monthly Expenses:</span>
                      <span>{formatCurrency(metric.monthlyOperatingExpenses)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span>Months of Coverage:</span>
                      <span className={metric.monthsOfExpensesCoverage >= 3 ? 'text-green-600' : metric.monthsOfExpensesCoverage >= 1 ? 'text-yellow-600' : 'text-red-600'}>
                        {metric.monthsOfExpensesCoverage.toFixed(1)} months
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="checking" stackId="1" fill="#ea580c" name="Checking" />
        <Bar yAxisId="left" dataKey="moneyMarket" stackId="1" fill="#fb923c" name="Money Market" />
        <Bar yAxisId="left" dataKey="stTreasuries" stackId="1" fill="#10b981" name="ST Treasuries" />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="monthsOfExpensesCoverage" 
          stroke="#000000" 
          strokeWidth={3} 
          name="Months of Coverage" 
          connectNulls={false}
        />
        <Line 
          yAxisId="right"
          dataKey={() => 1} 
          stroke="#10b981" 
          strokeWidth={2} 
          strokeDasharray="5 5" 
          name="Target (1 month)" 
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};