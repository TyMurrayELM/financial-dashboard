// src/components/FinancialDashboard/components/ChartWrapper.js

import React from 'react';
import { Maximize2 } from 'lucide-react';
import { ChartComment } from './ChartComment';

export const ChartWrapper = ({ 
  title, 
  description, 
  children, 
  showMultipleRollingAverages = false,
  rollingAverageOptions = [],
  rollingAverageValues = {},
  setRollingAverageValues,
  showDollarToggle = false,
  showDollarValues,
  setShowDollarValues,
  showEmployeeTypeSelection = false,
  employeeTypeValues = {},
  setEmployeeTypeValues,
  showMaintenanceRevenueToggle = false,
  showMaintenanceRevenue,
  setShowMaintenanceRevenue,
  onExpand,
  chartId = null,
  showComments = false
}) => {
  const handleRollingAverageChange = (key) => {
    setRollingAverageValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEmployeeTypeChange = (type) => {
    setEmployeeTypeValues(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleExpand = () => {
    if (onExpand) {
      // Pass all toggle-related props through to the modal
      onExpand({
        showMultipleRollingAverages,
        rollingAverageOptions,
        rollingAverageValues,
        setRollingAverageValues,
        showDollarToggle,
        showDollarValues,
        setShowDollarValues,
        showEmployeeTypeSelection,
        employeeTypeValues,
        setEmployeeTypeValues,
        showMaintenanceRevenueToggle,
        showMaintenanceRevenue,
        setShowMaintenanceRevenue,
        chartId,
        showComments
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-4">
          {/* Multiple rolling average options */}
          {showMultipleRollingAverages && (
            <div className="flex items-center gap-3">
              {rollingAverageOptions.map(option => (
                <label key={option.key} className="flex items-center gap-1.5 text-sm cursor-pointer hover:text-gray-800">
                  <input
                    type="checkbox"
                    checked={rollingAverageValues[option.key] || false}
                    onChange={() => handleRollingAverageChange(option.key)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-600 text-xs">{option.label}</span>
                </label>
              ))}
            </div>
          )}
          
          {/* Employee type selection (for Revenue per Employee chart) */}
          {showEmployeeTypeSelection && (
            <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-300">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer hover:text-gray-800">
                <input
                  type="checkbox"
                  checked={employeeTypeValues.all || false}
                  onChange={() => handleEmployeeTypeChange('all')}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600 text-xs">All</span>
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer hover:text-gray-800">
                <input
                  type="checkbox"
                  checked={employeeTypeValues.direct || false}
                  onChange={() => handleEmployeeTypeChange('direct')}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600 text-xs">Direct</span>
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer hover:text-gray-800">
                <input
                  type="checkbox"
                  checked={employeeTypeValues.indirect || false}
                  onChange={() => handleEmployeeTypeChange('indirect')}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600 text-xs">Indirect</span>
              </label>
            </div>
          )}
          
          {/* Dollar value toggle (for Revenue chart) */}
          {showDollarToggle && (
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-800 ml-2 pl-2 border-l border-gray-300">
              <input
                type="checkbox"
                checked={showDollarValues}
                onChange={(e) => setShowDollarValues(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-gray-600">Show $ Values</span>
            </label>
          )}
          
          {/* Maintenance revenue toggle (for Extra Sales chart) */}
          {showMaintenanceRevenueToggle && (
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-800 ml-2 pl-2 border-l border-gray-300">
              <input
                type="checkbox"
                checked={showMaintenanceRevenue}
                onChange={(e) => setShowMaintenanceRevenue(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-gray-600">Show Maintenance Revenue</span>
            </label>
          )}
          
          <button
            onClick={handleExpand}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Expand chart"
          >
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      {children}
      {description && (
        <div className="mt-4 text-sm text-gray-600">
          {typeof description === 'string' ? description : description}
        </div>
      )}
      {showComments && chartId && (
        <ChartComment chartId={chartId} />
      )}
    </div>
  );
};