// src/components/FinancialDashboard/components/ChartModal.js

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { ChartComment } from './ChartComment';

export const ChartModal = ({ chart, onClose }) => {
  // Create local state for the toggles that can update independently
  const [localRollingAverages, setLocalRollingAverages] = useState(chart.rollingAverageValues || {});
  const [localShowDollarValues, setLocalShowDollarValues] = useState(chart.showDollarValues || false);
  const [localEmployeeTypeValues, setLocalEmployeeTypeValues] = useState(chart.employeeTypeValues || { all: true, direct: false, indirect: false });
  const [localShowMaintenanceRevenue, setLocalShowMaintenanceRevenue] = useState(chart.showMaintenanceRevenue || false);
  
  // Update local state if props change
  useEffect(() => {
    setLocalRollingAverages(chart.rollingAverageValues || {});
    setLocalShowDollarValues(chart.showDollarValues || false);
    setLocalEmployeeTypeValues(chart.employeeTypeValues || { all: true, direct: false, indirect: false });
    setLocalShowMaintenanceRevenue(chart.showMaintenanceRevenue || false);
  }, [chart.rollingAverageValues, chart.showDollarValues, chart.employeeTypeValues, chart.showMaintenanceRevenue]);
  
  useEffect(() => {
    if (!chart) return;
    
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
    
    document.addEventListener('keydown', handleEscape);
    
    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
      document.head.removeChild(style);
    };
  }, [chart, onClose]);
  
  if (!chart) return null;
  
  // Handler for rolling average changes
  const handleRollingAverageChange = (key) => {
    const newValues = {
      ...localRollingAverages,
      [key]: !localRollingAverages[key]
    };
    setLocalRollingAverages(newValues);
    
    // Also update the parent state if setter is provided
    if (chart.setRollingAverageValues) {
      chart.setRollingAverageValues(newValues);
    }
  };
  
  // Handler for dollar value toggle
  const handleDollarValueChange = (checked) => {
    setLocalShowDollarValues(checked);
    
    // Also update the parent state if setter is provided
    if (chart.setShowDollarValues) {
      chart.setShowDollarValues(checked);
    }
  };
  
  // Handler for employee type changes
  const handleEmployeeTypeChange = (type) => {
    const newValues = {
      ...localEmployeeTypeValues,
      [type]: !localEmployeeTypeValues[type]
    };
    setLocalEmployeeTypeValues(newValues);
    
    // Also update the parent state if setter is provided
    if (chart.setEmployeeTypeValues) {
      chart.setEmployeeTypeValues(newValues);
    }
  };
  
  // Handler for maintenance revenue toggle
  const handleMaintenanceRevenueChange = (checked) => {
    setLocalShowMaintenanceRevenue(checked);
    
    // Also update the parent state if setter is provided
    if (chart.setShowMaintenanceRevenue) {
      chart.setShowMaintenanceRevenue(checked);
    }
  };
  
  // Create portal-like effect by rendering at root level
  return ReactDOM.createPortal(
    <>
      {/* Full screen overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      >
        {/* Pop-up window */}
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '85vw',
            maxWidth: '1100px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s ease-out',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 32px',
            borderBottom: '2px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>{chart.title}</h3>
            
            {/* Controls section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px'
            }}>
              {/* Multiple rolling average options */}
              {chart.showMultipleRollingAverages && chart.rollingAverageOptions && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  {chart.rollingAverageOptions.map(option => (
                    <label key={option.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#4b5563'
                    }}>
                      <input
                        type="checkbox"
                        checked={localRollingAverages[option.key] || false}
                        onChange={() => handleRollingAverageChange(option.key)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {/* Employee type selection */}
              {chart.showEmployeeTypeSelection && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginLeft: '8px',
                  paddingLeft: '16px',
                  borderLeft: '1px solid #e5e7eb'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: '#4b5563'
                  }}>
                    <input
                      type="checkbox"
                      checked={localEmployeeTypeValues.all || false}
                      onChange={() => handleEmployeeTypeChange('all')}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span>All</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: '#4b5563'
                  }}>
                    <input
                      type="checkbox"
                      checked={localEmployeeTypeValues.direct || false}
                      onChange={() => handleEmployeeTypeChange('direct')}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span>Direct</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: '#4b5563'
                  }}>
                    <input
                      type="checkbox"
                      checked={localEmployeeTypeValues.indirect || false}
                      onChange={() => handleEmployeeTypeChange('indirect')}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span>Indirect</span>
                  </label>
                </div>
              )}
              
              {/* Dollar value toggle (for Revenue chart) */}
              {chart.showDollarToggle && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#4b5563',
                  marginLeft: '8px',
                  paddingLeft: '16px',
                  borderLeft: '1px solid #e5e7eb'
                }}>
                  <input
                    type="checkbox"
                    checked={localShowDollarValues}
                    onChange={(e) => handleDollarValueChange(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <span>Show $ Values</span>
                </label>
              )}
              
              {/* Maintenance revenue toggle (for Extra Sales chart) */}
              {chart.showMaintenanceRevenueToggle && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#4b5563',
                  marginLeft: '8px',
                  paddingLeft: '16px',
                  borderLeft: '1px solid #e5e7eb'
                }}>
                  <input
                    type="checkbox"
                    checked={localShowMaintenanceRevenue}
                    onChange={(e) => handleMaintenanceRevenueChange(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <span>Show Maintenance Revenue</span>
                </label>
              )}
              
              <button
                onClick={onClose}
                style={{
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  background: '#e5e7eb',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  marginLeft: '16px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d1d5db';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                  e.target.style.transform = 'scale(1)';
                }}
                title="Close (Esc)"
              >
                <X className="w-6 h-6" style={{ color: '#4b5563' }} />
              </button>
            </div>
          </div>
          
          {/* Chart content */}
          <div style={{
            flex: 1,
            padding: '40px',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px'
          }}>
            <div style={{ height: '500px', width: '100%' }}>
              {/* Render chart dynamically with local state values */}
              {chart.renderChart && chart.chartType ? 
                chart.renderChart(chart.chartType, {
                  ...chart.chartProps,
                  ...(chart.showMultipleRollingAverages && { rollingAverages: localRollingAverages }),
                  ...(chart.showDollarToggle && { showDollarValues: localShowDollarValues }),
                  ...(chart.showEmployeeTypeSelection && { visibleLines: localEmployeeTypeValues }),
                  ...(chart.showMaintenanceRevenueToggle && { showMaintenanceRevenue: localShowMaintenanceRevenue })
                }) : 
                chart.content
              }
            </div>
            {chart.description && (
              <div style={{
                marginTop: '32px',
                padding: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#4b5563'
              }}>
                {chart.description}
              </div>
            )}
            {chart.showComments && chart.chartId && (
              <div style={{ marginTop: '20px' }}>
                <ChartComment chartId={chart.chartId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};