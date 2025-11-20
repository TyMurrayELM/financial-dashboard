// src/components/FinancialDashboardv2/FinancialDashboard.js

import React, { useState } from 'react';
import { useFinancialData } from './hooks/useFinancialData';
import { useBalanceSheet } from './hooks/useBalanceSheet';
import { useExpenseData } from './hooks/useExpenseData';
import { useClientRetention } from './hooks/useClientRetention';
import { useMetricsCalculation } from './hooks/useMetricsCalculation';
import { formatCurrency } from './utils/formatting';
import { clientRetentionBranches } from './constants';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ChartModal } from './components/ChartModal';
import { ChartWrapper } from './components/ChartWrapper';
import { RevenueSummary } from './components/RevenueSummary';
import { RevenueChart } from './components/charts/RevenueChart';
import { MaintenanceLaborChart } from './components/charts/MaintenanceLaborChart';
import { VehicleCostsChart } from './components/charts/VehicleCostsChart';
import { RevenuePerEmployeeChart } from './components/charts/RevenuePerEmployeeChart';
import { IndirectCostsChart } from './components/charts/IndirectCostsChart';
import { MaintenanceVsPlanChart } from './components/charts/MaintenanceVsPlanChart';
import { ExtraSalesChart } from './components/charts/ExtraSalesChart';
import { ReservesChart } from './components/charts/ReservesChart';
import { BalanceSheetChart } from './components/charts/BalanceSheetChart';
import { LongTermDebtChart } from './components/charts/LongTermDebtChart';
import { SankeyChart } from './components/charts/SankeyChart';
import { ClientRetentionChart } from './components/charts/ClientRetentionChart';
import { PLDataEntry } from './components/dataEntry/PLDataEntry';
import { BalanceSheetEntry } from './components/dataEntry/BalanceSheetEntry';
import { ExpenseDataEntry } from './components/dataEntry/ExpenseDataEntry';
import { ClientRetentionEntry } from './components/dataEntry/ClientRetentionEntry';
import './FinancialDashboard.css';

const FinancialDashboard = () => {
  // State for filters and UI
  const [startMonth, setStartMonth] = useState('2025-01');
  const [endMonth, setEndMonth] = useState('2025-12');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedChart, setExpandedChart] = useState(null);
  const [maintenanceRollingAverage, setMaintenanceRollingAverage] = useState({
    '3m': false,
    '6m': false,
    '12m': false
  });
  const [revenueRollingAverages, setRevenueRollingAverages] = useState({
    '3m': false,
    '6m': false,
    '12m': false
  });
  const [vehicleRollingAverages, setVehicleRollingAverages] = useState({
    '3m': false,
    '6m': false,
    '12m': false
  });
  const [indirectCostsRollingAverages, setIndirectCostsRollingAverages] = useState({
    '3m': false,
    '6m': false,
    '12m': false
  });
  const [revenuePerEmployeeRollingAverages, setRevenuePerEmployeeRollingAverages] = useState({
    '3m': false,
    '6m': false,
    '12m': false
  });
  const [showDollarValues, setShowDollarValues] = useState(false);
  const [revenuePerEmployeeLines, setRevenuePerEmployeeLines] = useState({
    all: true,
    direct: false,
    indirect: false
  });
  const [showMaintenanceRevenue, setShowMaintenanceRevenue] = useState(false);
  const [showExtraSalesDollars, setShowExtraSalesDollars] = useState(false);
  
  // Client Retention specific state
  const [selectedRetentionBranches, setSelectedRetentionBranches] = useState(['All']);
  const [showRetentionDollars, setShowRetentionDollars] = useState(false);

  // Custom hooks for data management
  const financialData = useFinancialData();
  const balanceSheet = useBalanceSheet();
  const expenseData = useExpenseData();
  const clientRetention = useClientRetention();
  const { calculateMetrics, chartMetrics, balanceSheetMetrics } = useMetricsCalculation(
    financialData.data,
    balanceSheet.balanceSheetData,
    startMonth,
    endMonth,
    selectedRegion,
    selectedDepartment,
    maintenanceRollingAverage,
    revenueRollingAverages,
    vehicleRollingAverages,
    indirectCostsRollingAverages,
    revenuePerEmployeeRollingAverages
  );

  // Calculate client retention metrics
  const clientRetentionMetrics = clientRetention.calculateClientRetentionMetrics(
    startMonth,
    endMonth,
    selectedRetentionBranches
  );

  // Function to render chart based on type
  const renderChart = (chartType, props) => {
    switch (chartType) {
      case 'RevenueChart':
        return <RevenueChart {...props} />;
      case 'MaintenanceLaborChart':
        return <MaintenanceLaborChart {...props} />;
      case 'VehicleCostsChart':
        return <VehicleCostsChart {...props} />;
      case 'RevenuePerEmployeeChart':
        return <RevenuePerEmployeeChart {...props} />;
      case 'IndirectCostsChart':
        return <IndirectCostsChart {...props} />;
      case 'MaintenanceVsPlanChart':
        return <MaintenanceVsPlanChart {...props} />;
      case 'ExtraSalesChart':
        return <ExtraSalesChart {...props} />;
      case 'ReservesChart':
        return <ReservesChart {...props} />;
      case 'BalanceSheetChart':
        return <BalanceSheetChart {...props} />;
      case 'LongTermDebtChart':
        return <LongTermDebtChart {...props} />;
      case 'ClientRetentionChart':
        return <ClientRetentionChart {...props} />;
      default:
        return null;
    }
  };

  // Handle branch selection for client retention
  const handleBranchSelection = (branch) => {
    if (branch === 'All') {
      setSelectedRetentionBranches(['All']);
    } else {
      setSelectedRetentionBranches(prev => {
        // Remove 'All' if it's selected
        const filtered = prev.filter(b => b !== 'All');
        
        if (filtered.includes(branch)) {
          // Remove the branch
          const newSelection = filtered.filter(b => b !== branch);
          // If no branches selected, default to 'All'
          return newSelection.length === 0 ? ['All'] : newSelection;
        } else {
          // Add the branch
          return [...filtered, branch];
        }
      });
    }
  };

  if (financialData.isLoading || !financialData.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        startMonth={startMonth}
        setStartMonth={setStartMonth}
        endMonth={endMonth}
        setEndMonth={setEndMonth}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        {...financialData}
      />

      <div className="p-6">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <SummaryCards 
              metrics={calculateMetrics} 
              selectedRegion={selectedRegion}
              selectedDepartment={selectedDepartment}
              data={financialData.data}
              startMonth={startMonth}
              endMonth={endMonth}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue, Net Income & Gross Margin Chart */}
              <ChartWrapper 
                title="Revenue, Net Income & Gross Margin"
                showMultipleRollingAverages={true}
                rollingAverageOptions={[
                  { key: '3m', label: '3-Month Avg' },
                  { key: '6m', label: '6-Month Avg' },
                  { key: '12m', label: '12-Month Avg' }
                ]}
                rollingAverageValues={revenueRollingAverages}
                setRollingAverageValues={setRevenueRollingAverages}
                showDollarToggle={true}
                showDollarValues={showDollarValues}
                setShowDollarValues={setShowDollarValues}
                onExpand={(toggleProps) => setExpandedChart({
                  title: "Revenue, Net Income & Gross Margin",
                  chartType: 'RevenueChart',
                  chartProps: {
                    data: chartMetrics,
                    rollingAverages: revenueRollingAverages,
                    showDollarValues: showDollarValues
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <RevenueChart data={chartMetrics} rollingAverages={revenueRollingAverages} showDollarValues={showDollarValues} />
                <RevenueSummary data={chartMetrics} startMonth={startMonth} endMonth={endMonth} />
              </ChartWrapper>
              
              {/* Maintenance Labor % Chart */}
              <ChartWrapper 
                title="Maintenance Direct Labor %"
                showMultipleRollingAverages={true}
                rollingAverageOptions={[
                  { key: '3m', label: '3-Month Avg' },
                  { key: '6m', label: '6-Month Avg' },
                  { key: '12m', label: '12-Month Avg' }
                ]}
                rollingAverageValues={maintenanceRollingAverage}
                setRollingAverageValues={setMaintenanceRollingAverage}
                description={
                  <>
                    <p>Direct Labor as % of Revenue by Department (Target: 40%)</p>
                    <p className="text-xs mt-1">All Maintenance includes both Maintenance and Maintenance Onsite departments</p>
                    {selectedRegion === 'Company' && selectedDepartment === 'All' && (
                      <p className="text-xs mt-1 text-amber-600">
                        <strong>Note:</strong> This chart shows aggregated department data, not Company Total values
                      </p>
                    )}
                    {(maintenanceRollingAverage['3m'] || maintenanceRollingAverage['6m'] || maintenanceRollingAverage['12m']) && (
                      <p className="text-xs mt-1 text-blue-600">
                        <strong>Note:</strong> Showing rolling averages - lines are solid to indicate smoothed data
                      </p>
                    )}
                  </>
                }
                onExpand={(toggleProps) => setExpandedChart({
                  title: "Maintenance Direct Labor %",
                  description: "Direct Labor as % of Revenue by Department (Target: 40%)",
                  chartType: 'MaintenanceLaborChart',
                  chartProps: {
                    data: chartMetrics,
                    rollingAverages: maintenanceRollingAverage
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <MaintenanceLaborChart data={chartMetrics} rollingAverages={maintenanceRollingAverage} />
              </ChartWrapper>
              
              {/* Vehicle Costs Chart */}
              <ChartWrapper 
                title="Vehicle Maintenance per Vehicle"
                showMultipleRollingAverages={true}
                rollingAverageOptions={[
                  { key: '3m', label: '3-Month Avg' },
                  { key: '6m', label: '6-Month Avg' },
                  { key: '12m', label: '12-Month Avg' }
                ]}
                rollingAverageValues={vehicleRollingAverages}
                setRollingAverageValues={setVehicleRollingAverages}
                description={
                  selectedRegion === 'Company' && selectedDepartment === 'All' && (
                    <p className="text-xs text-amber-600">
                      <strong>Note:</strong> Vehicle costs and active vehicles come from Company Total when viewing Company Consolidated
                    </p>
                  )
                }
                onExpand={(toggleProps) => setExpandedChart({
                  title: "Vehicle Maintenance per Vehicle",
                  chartType: 'VehicleCostsChart',
                  chartProps: {
                    data: chartMetrics,
                    rollingAverages: vehicleRollingAverages
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <VehicleCostsChart data={chartMetrics} rollingAverages={vehicleRollingAverages} />
              </ChartWrapper>
              
              {/* Revenue per Employee Chart */}
              <ChartWrapper 
                title="Revenue per Employee"
                showMultipleRollingAverages={true}
                rollingAverageOptions={[
                  { key: '3m', label: '3-Month Avg' },
                  { key: '6m', label: '6-Month Avg' },
                  { key: '12m', label: '12-Month Avg' }
                ]}
                rollingAverageValues={revenuePerEmployeeRollingAverages}
                setRollingAverageValues={setRevenuePerEmployeeRollingAverages}
                showEmployeeTypeSelection={true}
                employeeTypeValues={revenuePerEmployeeLines}
                setEmployeeTypeValues={setRevenuePerEmployeeLines}
                onExpand={(toggleProps) => setExpandedChart({
                  title: "Revenue per Employee",
                  chartType: 'RevenuePerEmployeeChart',
                  chartProps: {
                    data: chartMetrics,
                    rollingAverages: revenuePerEmployeeRollingAverages,
                    visibleLines: revenuePerEmployeeLines
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <RevenuePerEmployeeChart 
                  data={chartMetrics} 
                  rollingAverages={revenuePerEmployeeRollingAverages}
                  visibleLines={revenuePerEmployeeLines}
                />
              </ChartWrapper>
              
              {/* Indirect Personnel Costs % of Revenue Chart */}
              <ChartWrapper 
                title="Indirect Personnel Costs % of Revenue"
                description="Indirect Personnel Costs as % of Revenue with total indirect employee headcount"
                showMultipleRollingAverages={true}
                rollingAverageOptions={[
                  { key: '3m', label: '3-Month Avg' },
                  { key: '6m', label: '6-Month Avg' },
                  { key: '12m', label: '12-Month Avg' }
                ]}
                rollingAverageValues={indirectCostsRollingAverages}
                setRollingAverageValues={setIndirectCostsRollingAverages}
                onExpand={(toggleProps) => setExpandedChart({
                  title: "Indirect Personnel Costs % of Revenue",
                  description: "Indirect Personnel Costs as % of Revenue with total indirect employee headcount",
                  chartType: 'IndirectCostsChart',
                  chartProps: {
                    data: chartMetrics,
                    selectedRegion: selectedRegion,
                    selectedDepartment: selectedDepartment,
                    rollingAverages: indirectCostsRollingAverages
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <IndirectCostsChart 
                  data={chartMetrics} 
                  selectedRegion={selectedRegion}
                  selectedDepartment={selectedDepartment}
                  rollingAverages={indirectCostsRollingAverages}
                />
              </ChartWrapper>
              
              {/* Maintenance to Plan Chart (2025 only) */}
              {calculateMetrics.some(m => m.month.startsWith('2025') && (m.maintRevenue > 0 || m.maintPlan > 0 || (m.maintForecast !== null && m.maintForecast > 0))) && (
                <ChartWrapper 
                  title="Maintenance Revenue vs Plan (2025)"
                  description={
                    (() => {
                      // Calculate annual totals for 2025
                      const metrics2025 = calculateMetrics.filter(m => m.month.startsWith('2025'));
                      
                      // Calculate total actual revenue (for completed months)
                      const totalActual = metrics2025.reduce((sum, m) => {
                        return sum + (m.maintRevenue !== null && m.maintRevenue !== undefined ? m.maintRevenue : 0);
                      }, 0);
                      
                      // Calculate total forecast revenue (for all months with forecast data)
                      const totalForecast = metrics2025.reduce((sum, m) => {
                        return sum + (m.maintForecast !== null && m.maintForecast !== undefined ? m.maintForecast : 0);
                      }, 0);
                      
                      // Calculate total planned revenue
                      const totalPlan = metrics2025.reduce((sum, m) => {
                        return sum + (m.maintPlan || 0);
                      }, 0);
                      
                      // Determine which months have actual data
                      const monthsWithActual = metrics2025.filter(m => m.maintRevenue !== null && m.maintRevenue > 0).length;
                      const monthsWithForecast = metrics2025.filter(m => m.maintForecast !== null && m.maintForecast > 0).length;
                      
                      // Calculate projected total (actual YTD + forecast for remaining months)
                      let projectedTotal = totalActual;
                      metrics2025.forEach(m => {
                        // If month doesn't have actual revenue yet, use forecast if available
                        if ((m.maintRevenue === null || m.maintRevenue === 0) && m.maintForecast !== null && m.maintForecast > 0) {
                          projectedTotal += m.maintForecast;
                        }
                      });
                      
                      // If we don't have a good projection, just use forecast total
                      if (projectedTotal === totalActual && totalForecast > 0) {
                        projectedTotal = totalForecast;
                      }
                      
                      const variance = projectedTotal - totalPlan;
                      const variancePercent = totalPlan > 0 ? (variance / totalPlan * 100).toFixed(1) : 0;
                      
                      return (
                        <>
                          {selectedRegion === 'Company' && selectedDepartment === 'All' && (
                            <p className="text-xs text-amber-600 mb-2">
                              <strong>Note:</strong> This chart shows aggregated maintenance department revenues, not Company Total values
                            </p>
                          )}
                          <div className="bg-blue-50 p-3 rounded-lg mt-2">
                            <p className="text-sm font-semibold text-blue-900 mb-2">2025 Annual Summary:</p>
                            <div className="space-y-1 text-xs text-blue-800">
                              {totalActual > 0 && (
                                <div className="flex justify-between">
                                  <span>YTD Actual Revenue:</span>
                                  <span className="font-medium">{formatCurrency(totalActual)}</span>
                                </div>
                              )}
                              {totalForecast > 0 && (
                                <div className="flex justify-between">
                                  <span>Full Year Forecast:</span>
                                  <span className="font-medium">{formatCurrency(totalForecast)}</span>
                                </div>
                              )}
                              {projectedTotal > 0 && projectedTotal !== totalActual && projectedTotal !== totalForecast && (
                                <div className="flex justify-between">
                                  <span>Projected Total (Actual YTD + Forecast):</span>
                                  <span className="font-medium">{formatCurrency(projectedTotal)}</span>
                                </div>
                              )}
                              <div className="flex justify-between border-t pt-1 mt-1">
                                <span>Annual Plan (Original Budget):</span>
                                <span className="font-medium">{formatCurrency(totalPlan)}</span>
                              </div>
                              {projectedTotal > 0 && totalPlan > 0 && (
                                <div className="flex justify-between font-semibold border-t pt-1">
                                  <span>Projected vs Plan:</span>
                                  <span className={`${variance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {variance >= 0 ? '+' : ''}{formatCurrency(variance)} ({variancePercent}%)
                                  </span>
                                </div>
                              )}
                            </div>
                            {monthsWithActual > 0 && (
                              <p className="text-xs text-gray-600 mt-2 italic">
                                Based on {monthsWithActual} month{monthsWithActual !== 1 ? 's' : ''} of actual data
                                {monthsWithForecast > 0 && ` and ${monthsWithForecast} month${monthsWithForecast !== 1 ? 's' : ''} of forecast data`}
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()
                  }
                  onExpand={() => setExpandedChart({
                    title: "Maintenance Revenue vs Plan (2025)",
                    chartType: 'MaintenanceVsPlanChart',
                    chartProps: { data: calculateMetrics.filter(m => m.month.startsWith('2025')) },
                    renderChart
                  })}
                >
                  <MaintenanceVsPlanChart data={calculateMetrics.filter(m => m.month.startsWith('2025'))} />
                </ChartWrapper>
              )}
              
              {/* Extra Sales Revenue & % of Maintenance Chart */}
              <ChartWrapper 
                title={showExtraSalesDollars ? "Extra Sales Revenue" : "Extra Sales % of Maintenance Revenue"}
                description={
                  <>
                    <p>{showExtraSalesDollars ? 
                      "Extra Sales revenue by department with 120% of Maintenance revenue target line" : 
                      "Target: Extra Sales should be 120% of All Maintenance Revenue (includes Maintenance & Maintenance Onsite)"}</p>
                    <p className="text-xs mt-1">Note: Overhead department is excluded from this calculation</p>
                    {selectedRegion === 'Company' && selectedDepartment === 'All' && (
                      <p className="text-xs mt-1 text-amber-600">
                        <strong>Note:</strong> This chart shows aggregated department data, not Company Total values
                      </p>
                    )}
                  </>
                }
                showMaintenanceRevenueToggle={true}
                showMaintenanceRevenue={showMaintenanceRevenue}
                setShowMaintenanceRevenue={setShowMaintenanceRevenue}
                showDollarToggle={true}
                showDollarValues={showExtraSalesDollars}
                setShowDollarValues={setShowExtraSalesDollars}
                chartId="extra_sales_chart"
                showComments={true}
                onExpand={(toggleProps) => setExpandedChart({
                  title: showExtraSalesDollars ? "Extra Sales Revenue" : "Extra Sales % of Maintenance Revenue",
                  description: showExtraSalesDollars ? 
                    "Extra Sales revenue by department with 120% of Maintenance revenue target line" : 
                    "Target: Extra Sales should be 120% of All Maintenance Revenue",
                  chartType: 'ExtraSalesChart',
                  chartProps: { 
                    data: calculateMetrics,
                    showMaintenanceRevenue: showMaintenanceRevenue,
                    showDollarValues: showExtraSalesDollars
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <ExtraSalesChart 
                  data={calculateMetrics} 
                  showMaintenanceRevenue={showMaintenanceRevenue}
                  showDollarValues={showExtraSalesDollars}
                />
              </ChartWrapper>
              
              {/* Client Retention Chart */}
              <ChartWrapper 
                title="Client Retention"
                description={
                  <>
                    <p>Property retention by branch (Target: 90% of properties retained)</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedRetentionBranches.includes('All')}
                          onChange={() => handleBranchSelection('All')}
                          className="w-3 h-3"
                        />
                        <span>All</span>
                      </label>
                      {clientRetentionBranches.map(branch => (
                        <label key={branch} className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedRetentionBranches.includes(branch)}
                            onChange={() => handleBranchSelection(branch)}
                            className="w-3 h-3"
                          />
                          <span>{branch}</span>
                        </label>
                      ))}
                    </div>
                  </>
                }
                showDollarToggle={true}
                showDollarValues={showRetentionDollars}
                setShowDollarValues={setShowRetentionDollars}
                onExpand={(toggleProps) => setExpandedChart({
                  title: "Client Retention",
                  description: "Property retention by branch (Target: 90% of properties retained)",
                  chartType: 'ClientRetentionChart',
                  chartProps: { 
                    data: clientRetentionMetrics,
                    showDollarValues: showRetentionDollars,
                    selectedBranches: selectedRetentionBranches
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <ClientRetentionChart 
                  data={clientRetentionMetrics} 
                  showDollarValues={showRetentionDollars}
                  selectedBranches={selectedRetentionBranches}
                />
              </ChartWrapper>
              
              {/* Reserves Composition Chart */}
              {balanceSheet.balanceSheetData && (
                <ChartWrapper 
                  title="Cash Reserves & Months of Coverage"
                  description="Liquid reserves (Checking, Money Market, ST Treasuries) and months of operating expenses coverage"
                  onExpand={() => setExpandedChart({
                    title: "Cash Reserves & Months of Coverage",
                    description: "Liquid reserves and months of operating expenses coverage",
                    chartType: 'ReservesChart',
                    chartProps: { data: balanceSheetMetrics },
                    renderChart
                  })}
                >
                  <ReservesChart data={balanceSheetMetrics} />
                </ChartWrapper>
              )}
              
              {/* Debt to Equity Ratio Chart */}
              {balanceSheet.balanceSheetData && (
                <ChartWrapper 
                  title="Balance Sheet Trends & Debt/Equity Ratio"
                  description="Assets, Liabilities, Equity trends with long-term debt to equity ratio"
                  onExpand={() => setExpandedChart({
                    title: "Balance Sheet Trends & Debt/Equity Ratio",
                    description: "Assets, Liabilities, Equity trends with long-term debt to equity ratio",
                    chartType: 'BalanceSheetChart',
                    chartProps: { data: balanceSheetMetrics },
                    renderChart
                  })}
                >
                  <BalanceSheetChart data={balanceSheetMetrics} />
                </ChartWrapper>
              )}
              
              {/* Long Term Debt Breakdown Chart */}
              {balanceSheet.balanceSheetData && (
                <ChartWrapper 
                  title="Long-Term Debt Breakdown"
                  description="Composition of long-term debt obligations (Ford Vehicles, MidFirst Loans, SBA EIDL)"
                  onExpand={() => setExpandedChart({
                    title: "Long-Term Debt Breakdown",
                    description: "Composition of long-term debt obligations with total long-term debt trend",
                    chartType: 'LongTermDebtChart',
                    chartProps: { data: balanceSheetMetrics },
                    renderChart
                  })}
                >
                  <LongTermDebtChart data={balanceSheetMetrics} />
                </ChartWrapper>
              )}
            </div>
          </div>
        ) : activeTab === 'balanceSheet' ? (
          <BalanceSheetEntry 
            {...balanceSheet}
            startMonth={startMonth}
            endMonth={endMonth}
            balanceSheetMetrics={balanceSheetMetrics}
          />
        ) : activeTab === 'expenses' ? (
          <ExpenseDataEntry 
            {...expenseData}
            startMonth={startMonth}
            endMonth={endMonth}
          />
        ) : activeTab === 'sankey' ? (
          <SankeyChart 
            revenueData={calculateMetrics}
            expenseData={expenseData.expenseData}
            startMonth={startMonth}
            endMonth={endMonth}
            selectedRegion={selectedRegion}
            selectedDepartment={selectedDepartment}
          />
        ) : activeTab === 'clientRetention' ? (
          <ClientRetentionEntry 
            {...clientRetention}
            startMonth={startMonth}
            endMonth={endMonth}
          />
        ) : (
          <PLDataEntry 
            {...financialData}
            startMonth={startMonth}
            endMonth={endMonth}
          />
        )}
      </div>

      {expandedChart && (
        <ChartModal 
          chart={expandedChart} 
          onClose={() => setExpandedChart(null)} 
        />
      )}
    </div>
  );
};

export default FinancialDashboard;