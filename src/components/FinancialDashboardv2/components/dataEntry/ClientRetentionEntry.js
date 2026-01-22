// src/components/FinancialDashboardv2/components/dataEntry/ClientRetentionEntry.js

import React, { useState } from 'react';
import { formatCurrency, getFormattedValue, parseCurrencyInput } from '../../utils/formatting';
import { allMonths, clientRetentionBranches } from '../../constants';

export const ClientRetentionEntry = ({ 
  clientRetentionData, 
  updateClientRetentionData, 
  startMonth, 
  endMonth 
}) => {
  const [selectedBranch, setSelectedBranch] = useState('Company');
  
  // Calculate summary statistics
  const calculateSummaryStats = (branch) => {
    const filteredMonths = allMonths.filter(month => month >= startMonth && month <= endMonth);
    let totalRetentionPercent = 0;
    let totalRetentionDollars = 0;
    let totalLostClients = 0;
    let totalTotalClients = 0;
    let monthCount = 0;
    
    filteredMonths.forEach(month => {
      const data = clientRetentionData[branch]?.[month];
      if (data && (data.retentionPercent > 0 || data.retentionDollars > 0)) {
        totalRetentionPercent += data.retentionPercent;
        totalRetentionDollars += data.retentionDollars;
        totalLostClients += data.lostClients;
        totalTotalClients += data.totalClients;
        monthCount++;
      }
    });
    
    return {
      avgRetentionPercent: monthCount > 0 ? totalRetentionPercent / monthCount : 90,
      totalRetentionDollars,
      totalLostClients,
      totalTotalClients,
      avgLostClientsPerMonth: monthCount > 0 ? totalLostClients / monthCount : 0
    };
  };
  
  const stats = calculateSummaryStats(selectedBranch);
  
  return (
    <div className="space-y-6">
      {/* Header and Instructions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Client Retention Data Entry</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter property retention data by branch or at the company level. Track both retention percentage and dollar value of retained revenue.
          The target retention rate is 90% of properties.
        </p>
        
        {/* Branch Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch:</label>
          <select 
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-auto"
          >
            <option value="Company">Company (Consolidated)</option>
            {clientRetentionBranches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong>
            <br />• Enter retention as a percentage (0-100) - 90% means 90% of properties were retained
            <br />• Enter retention dollars as the revenue value retained from existing properties
            <br />• Lost properties = Total properties × (100 - Retention %) / 100
            <br />• List properties lost (one per line) - these will appear on chart hover
            <br />• Company level data is separate from branch data for consolidated reporting
          </p>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="font-medium text-gray-900 mb-4">
          Summary for {selectedBranch} ({startMonth} to {endMonth})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Avg Retention %</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.avgRetentionPercent.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.avgRetentionPercent >= 90 ? 
                <span className="text-green-600">✓ Meeting target</span> : 
                <span className="text-red-600">Below target (90%)</span>
              }
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Retained Revenue</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(stats.totalRetentionDollars)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Lost Properties</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.totalLostClients}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Avg: {stats.avgLostClientsPerMonth.toFixed(1)}/month
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Property Base</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.totalTotalClients}
            </p>
          </div>
        </div>
      </div>
      
      {/* Data Entry Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900">Monthly Client Retention Data: {selectedBranch}</h4>
          <p className="text-sm text-gray-600 mt-1">
            Showing months from {startMonth} to {endMonth}
          </p>
        </div>
        
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', top: 0, left: 0, zIndex: 30, backgroundColor: 'white' }} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap border-b-2 border-gray-300 border-r">
                  Month
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'white' }} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap border-b-2 border-gray-300">
                  Retention %
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'white' }} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap border-b-2 border-gray-300">
                  Retained Revenue
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'white' }} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap border-b-2 border-gray-300">
                  # Lost
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'white' }} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap border-b-2 border-gray-300">
                  Total Properties
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'white' }} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap border-b-2 border-gray-300">
                  Properties Lost (names)
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#f9fafb' }} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap border-b-2 border-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allMonths.filter(month => month >= startMonth && month <= endMonth).map((month) => {
                const data = clientRetentionData[selectedBranch]?.[month] || {
                  retentionPercent: 90,
                  retentionDollars: 0,
                  lostClients: 0,
                  totalClients: 0,
                  propertiesLostList: ''
                };
                
                return (
                  <tr key={month} className="hover:bg-gray-50 group">
                    <td style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: 'white' }} className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap border-r group-hover:bg-gray-50">
                      {month}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="w-20 border rounded px-2 py-1 text-sm"
                          placeholder="90"
                          value={data.retentionPercent || ''}
                          onChange={(e) => updateClientRetentionData(selectedBranch, month, 'retentionPercent', e.target.value)}
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="w-32 border rounded px-2 py-1 text-sm"
                        placeholder="$0"
                        value={getFormattedValue(data.retentionDollars)}
                        onChange={(e) => updateClientRetentionData(selectedBranch, month, 'retentionDollars', parseCurrencyInput(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="w-16 border rounded px-2 py-1 text-sm"
                        placeholder="0"
                        value={data.lostClients || ''}
                        onChange={(e) => updateClientRetentionData(selectedBranch, month, 'lostClients', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1 text-sm"
                        placeholder="0"
                        value={data.totalClients || ''}
                        onChange={(e) => updateClientRetentionData(selectedBranch, month, 'totalClients', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <textarea
                        className="w-48 border rounded px-2 py-1 text-sm resize-none"
                        placeholder="Enter property names (one per line)"
                        rows={2}
                        value={data.propertiesLostList || ''}
                        onChange={(e) => updateClientRetentionData(selectedBranch, month, 'propertiesLostList', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2 bg-gray-50">
                      {data.retentionPercent >= 90 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ On Target
                        </span>
                      ) : data.retentionPercent > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Below Target
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          No Data
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer with Totals */}
            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
              <tr>
                <td style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#f3f4f6' }} className="px-4 py-3 text-sm font-bold text-gray-900">
                  AVERAGE/TOTAL
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {stats.avgRetentionPercent.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {formatCurrency(stats.totalRetentionDollars)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {stats.totalLostClients}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {stats.totalTotalClients}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  —
                </td>
                <td className="px-4 py-3 bg-gray-200">
                  {stats.avgRetentionPercent >= 90 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Meeting Target
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Below Target
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-blue-50 border-t">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Data is automatically saved as you type. 
            The retention percentage target is 90%. Values below this will be highlighted in red.
            Properties lost names will appear when hovering over the chart.
          </p>
        </div>
      </div>
    </div>
  );
};