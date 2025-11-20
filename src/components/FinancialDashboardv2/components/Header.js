// src/components/FinancialDashboardv2/components/Header.js

import React from 'react';
import { Calendar, Save, Cloud, CloudOff } from 'lucide-react';
import { regions, departments, allMonths } from '../constants';

export const Header = ({
  startMonth,
  setStartMonth,
  endMonth,
  setEndMonth,
  selectedRegion,
  setSelectedRegion,
  selectedDepartment,
  setSelectedDepartment,
  activeTab,
  setActiveTab,
  isConnected,
  isSaving,
  lastSaved,
  checkConnection,
  loadDataFromSupabase
}) => {
  return (
    <div className="bg-white shadow-sm border-b sticky top-0" style={{ zIndex: 9999 }}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Review Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Comprehensive financial metrics by region and department</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Cloud className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">Offline</span>
                  <button
                    onClick={() => {
                      checkConnection();
                      loadDataFromSupabase();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
                  >
                    Reconnect
                  </button>
                </>
              )}
            </div>
            {/* Save Status */}
            {isSaving && (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-sm text-blue-600">Saving...</span>
              </div>
            )}
            {lastSaved && !isSaving && (
              <span className="text-xs text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="px-6 pb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select 
            value={startMonth} 
            onChange={(e) => setStartMonth(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            {allMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <span className="text-gray-500">to</span>
          <select 
            value={endMonth} 
            onChange={(e) => setEndMonth(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            {allMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        
        <select 
          value={selectedRegion} 
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="All">All Regions</option>
          <option value="Company">Company (Consolidated)</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
        
        <select 
          value={selectedDepartment} 
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="All">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>
      
      {selectedRegion === 'Company' && selectedDepartment === 'All' && (
        <div className="px-6 pb-2">
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded inline-block">
            <strong>Note:</strong> Viewing company-wide consolidated data. Main metrics (Revenue, Net Income, Gross Margin, etc.) come from your "Company Total" P&L entry. 
            Department-specific charts (Maintenance DL %, Extra Sales %) show aggregated department data for detailed analysis.
          </div>
        </div>
      )}
      
      {selectedRegion === 'Company' && selectedDepartment !== 'All' && (
        <div className="px-6 pb-2">
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded inline-block">
            <strong>Note:</strong> Viewing company-wide data for {selectedDepartment} department only.
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="px-6 flex gap-4 border-t bg-white overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'dashboard' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('dataEntry')}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'dataEntry' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          P&L Data Entry
        </button>
        <button
          onClick={() => setActiveTab('balanceSheet')}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'balanceSheet' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'expenses' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Expense Categories
        </button>
        <button
          onClick={() => setActiveTab('sankey')}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'sankey' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Sankey Chart
        </button>
        <button
          onClick={() => setActiveTab('clientRetention')}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'clientRetention' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Client Retention
        </button>
      </div>
    </div>
  );
};