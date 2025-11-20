// src/components/FinancialDashboard/components/charts/LongTermDebtChart.js

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatting';

export const LongTermDebtChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} width={80} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrency(value)} width={80} />
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
              
              const totalDebt = metric.totalLongTermLiabilities || 0;
              const fordPercent = totalDebt > 0 ? ((metric.fordVehicles || 0) / totalDebt * 100).toFixed(1) : '0.0';
              const midfirstPercent = totalDebt > 0 ? ((metric.midfirstLoans || 0) / totalDebt * 100).toFixed(1) : '0.0';
              const sbaPercent = totalDebt > 0 ? ((metric.sbaEidlLoan || 0) / totalDebt * 100).toFixed(1) : '0.0';
              
              // Find previous month for trend analysis
              const currentIndex = data.findIndex(m => m.month === label);
              const prevMetric = currentIndex > 0 ? data[currentIndex - 1] : null;
              const totalDebtChange = prevMetric && prevMetric.hasData ? totalDebt - (prevMetric.totalLongTermLiabilities || 0) : 0;
              
              return (
                <div className="bg-white p-3 border rounded shadow-lg">
                  <p className="font-medium text-sm mb-2">{label}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: '#3b82f6' }}>Ford Vehicles:</span>
                      <span className="ml-4 font-medium">{formatCurrency(metric.fordVehicles || 0)} ({fordPercent}%)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: '#f97316' }}>MidFirst Loans:</span>
                      <span className="ml-4 font-medium">{formatCurrency(metric.midfirstLoans || 0)} ({midfirstPercent}%)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: '#6b7280' }}>SBA EIDL Loan:</span>
                      <span className="ml-4 font-medium">{formatCurrency(metric.sbaEidlLoan || 0)} ({sbaPercent}%)</span>
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between text-xs font-medium">
                      <span>Total Long-Term Debt:</span>
                      <span className="text-red-600">{formatCurrency(totalDebt)}</span>
                    </div>
                    {prevMetric && prevMetric.hasData && totalDebtChange !== 0 && (
                      <div className="flex justify-between text-xs">
                        <span>Month-over-Month Change:</span>
                        <span className={totalDebtChange < 0 ? 'text-green-600' : 'text-red-600'}>
                          {totalDebtChange < 0 ? '↓' : '↑'} {formatCurrency(Math.abs(totalDebtChange))}
                        </span>
                      </div>
                    )}
                    {metric.equity > 0 && (
                      <>
                        <div className="flex justify-between text-xs text-gray-600 mt-2 pt-2 border-t">
                          <span>Total Equity:</span>
                          <span>{formatCurrency(metric.equity || 0)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>LT Debt/Equity Ratio:</span>
                          <span className={metric.debtToEquity > 1 ? 'text-red-600' : 'text-green-600'}>
                            {metric.debtToEquity.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        
        {/* Stacked bars for debt components */}
        <Bar yAxisId="left" dataKey="fordVehicles" stackId="1" fill="#3b82f6" name="Ford Vehicles" />
        <Bar yAxisId="left" dataKey="midfirstLoans" stackId="1" fill="#f97316" name="MidFirst Loans" />
        <Bar yAxisId="left" dataKey="sbaEidlLoan" stackId="1" fill="#6b7280" name="SBA EIDL Loan" />
        
        {/* Line for total long-term debt */}
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="totalLongTermLiabilities" 
          stroke="#ef4444" 
          strokeWidth={3} 
          name="Total LT Debt" 
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};