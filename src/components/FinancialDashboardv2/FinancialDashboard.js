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
  const [hoveredRetentionMonth, setHoveredRetentionMonth] = useState(null);

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
                <RevenueSummary data={chartMetrics} rawData={financialData.data} startMonth={startMonth} endMonth={endMonth} />
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
              
              {/* Maintenance to Plan Chart (Jan 2025 - Jan 2026) */}
              {calculateMetrics.some(m => (m.month >= '2025-01' && m.month <= '2026-01') && (m.maintRevenue > 0 || m.maintPlan > 0 || (m.maintForecast !== null && m.maintForecast > 0))) && (
                <ChartWrapper 
                  title="Maintenance Revenue vs Plan (Jan 2025 - Jan 2026)"
                  description={
                    (() => {
                      // Calculate totals for Jan 2025 - Jan 2026 (13 months)
                      const metricsRange = calculateMetrics.filter(m => m.month >= '2025-01' && m.month <= '2026-01');
                      
                      // Calculate total actual revenue (for months with data)
                      const totalActual = metricsRange.reduce((sum, m) => {
                        return sum + (m.maintRevenue !== null && m.maintRevenue !== undefined ? m.maintRevenue : 0);
                      }, 0);
                      
                      // Calculate total planned revenue
                      const totalPlan = metricsRange.reduce((sum, m) => {
                        return sum + (m.maintPlan || 0);
                      }, 0);
                      
                      // Count months with actual data
                      const monthsWithActual = metricsRange.filter(m => m.maintRevenue !== null && m.maintRevenue > 0).length;
                      
                      // Determine if period is complete (all 13 months have actual data)
                      const periodComplete = monthsWithActual === 13;
                      
                      // Calculate forecast for remaining months (only if period is incomplete)
                      let remainingForecast = 0;
                      let monthsWithForecast = 0;
                      if (!periodComplete) {
                        metricsRange.forEach(m => {
                          // Only use forecast for months that don't have actual data
                          if ((m.maintRevenue === null || m.maintRevenue === 0) && m.maintForecast !== null && m.maintForecast > 0) {
                            remainingForecast += m.maintForecast;
                            monthsWithForecast++;
                          }
                        });
                      }
                      
                      // Projected total = Actual YTD + Forecast for remaining months
                      const projectedTotal = totalActual + remainingForecast;
                      
                      // For variance: use actual if period complete, otherwise use projected
                      const comparisonValue = periodComplete ? totalActual : projectedTotal;
                      const variance = comparisonValue - totalPlan;
                      const variancePercent = totalPlan > 0 ? (variance / totalPlan * 100).toFixed(1) : 0;
                      
                      return (
                        <>
                          {selectedRegion === 'Company' && selectedDepartment === 'All' && (
                            <p className="text-xs text-amber-600 mb-2">
                              <strong>Note:</strong> This chart shows aggregated maintenance department revenues, not Company Total values
                            </p>
                          )}
                          <div className="bg-blue-50 p-3 rounded-lg mt-2">
                            <p className="text-sm font-semibold text-blue-900 mb-2">13-Month Summary (Jan 2025 - Jan 2026):</p>
                            <div className="space-y-1 text-xs text-blue-800">
                              {/* Always show actual revenue */}
                              <div className="flex justify-between">
                                <span>{periodComplete ? 'Total Actual Revenue:' : 'YTD Actual Revenue:'}</span>
                                <span className="font-medium">{formatCurrency(totalActual)}</span>
                              </div>
                              
                              {/* Show forecast for remaining months if period is incomplete and forecast exists */}
                              {!periodComplete && remainingForecast > 0 && (
                                <div className="flex justify-between">
                                  <span>Remaining Months Forecast:</span>
                                  <span className="font-medium">{formatCurrency(remainingForecast)}</span>
                                </div>
                              )}
                              
                              {/* Show projected total if period is incomplete and we have forecast data */}
                              {!periodComplete && remainingForecast > 0 && (
                                <div className="flex justify-between border-t pt-1 mt-1">
                                  <span>Projected Total:</span>
                                  <span className="font-medium">{formatCurrency(projectedTotal)}</span>
                                </div>
                              )}
                              
                              {/* Total Plan */}
                              <div className="flex justify-between border-t pt-1 mt-1">
                                <span>Total Plan (Original Budget):</span>
                                <span className="font-medium">{formatCurrency(totalPlan)}</span>
                              </div>
                              
                              {/* Variance - compare projected (or actual if complete) to plan */}
                              {totalPlan > 0 && (
                                <div className="flex justify-between font-semibold border-t pt-1">
                                  <span>{periodComplete ? 'Actual vs Plan:' : 'Projected vs Plan:'}</span>
                                  <span className={`${variance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {variance >= 0 ? '+' : ''}{formatCurrency(variance)} ({variancePercent}%)
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-2 italic">
                              Based on {monthsWithActual} month{monthsWithActual !== 1 ? 's' : ''} of actual data
                              {!periodComplete && monthsWithForecast > 0 && ` + ${monthsWithForecast} month${monthsWithForecast !== 1 ? 's' : ''} of forecast`}
                            </p>
                          </div>
                        </>
                      );
                    })()
                  }
                  onExpand={() => setExpandedChart({
                    title: "Maintenance Revenue vs Plan (Jan 2025 - Jan 2026)",
                    chartType: 'MaintenanceVsPlanChart',
                    chartProps: { data: calculateMetrics.filter(m => m.month >= '2025-01' && m.month <= '2026-01') },
                    renderChart
                  })}
                >
                  <MaintenanceVsPlanChart data={calculateMetrics.filter(m => m.month >= '2025-01' && m.month <= '2026-01')} />
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
                {/* Extra Sales Summary by Department */}
                {(() => {
                  // Calculate totals for the selected time frame
                  const totals = calculateMetrics.reduce((acc, m) => {
                    if (m.hasData) {
                      acc.maintRevenue += (m.maintRevenue || 0);
                      acc.maintWO += (m.maintWORevenue || 0);
                      acc.arbor += (m.arborRevenue || 0);
                      acc.enhancements += (m.enhancementsRevenue || 0);
                      acc.irrigation += (m.irrigationRevenue || 0);
                      acc.sprayPHC += (m.sprayPHCRevenue || 0);
                    }
                    return acc;
                  }, { maintRevenue: 0, maintWO: 0, arbor: 0, enhancements: 0, irrigation: 0, sprayPHC: 0 });
                  
                  const totalExtraSales = totals.maintWO + totals.arbor + totals.enhancements + totals.irrigation + totals.sprayPHC;
                  const overallPercent = totals.maintRevenue > 0 ? (totalExtraSales / totals.maintRevenue) * 100 : 0;
                  
                  // Collect monthly percentages for each department
                  const monthlyData = {
                    maintWO: [],
                    arbor: [],
                    enhancements: [],
                    irrigation: [],
                    sprayPHC: []
                  };
                  
                  calculateMetrics.forEach(m => {
                    if (m.hasData && m.maintRevenue > 0) {
                      if (m.maintWORevenue > 0) monthlyData.maintWO.push((m.maintWORevenue / m.maintRevenue) * 100);
                      if (m.arborRevenue > 0) monthlyData.arbor.push((m.arborRevenue / m.maintRevenue) * 100);
                      if (m.enhancementsRevenue > 0) monthlyData.enhancements.push((m.enhancementsRevenue / m.maintRevenue) * 100);
                      if (m.irrigationRevenue > 0) monthlyData.irrigation.push((m.irrigationRevenue / m.maintRevenue) * 100);
                      if (m.sprayPHCRevenue > 0) monthlyData.sprayPHC.push((m.sprayPHCRevenue / m.maintRevenue) * 100);
                    }
                  });
                  
                  // Helper to calculate stats
                  const getStats = (arr) => {
                    if (arr.length === 0) return { high: 0, low: 0, median: 0 };
                    const sorted = [...arr].sort((a, b) => a - b);
                    const high = sorted[sorted.length - 1];
                    const low = sorted[0];
                    const mid = Math.floor(sorted.length / 2);
                    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
                    return { high, low, median };
                  };
                  
                  // Calculate department data with stats
                  const deptData = [
                    { name: 'Maint WO', key: 'maintWO', value: totals.maintWO, color: '#ef4444', stats: getStats(monthlyData.maintWO) },
                    { name: 'Arbor', key: 'arbor', value: totals.arbor, color: '#10b981', stats: getStats(monthlyData.arbor) },
                    { name: 'Enhance', key: 'enhancements', value: totals.enhancements, color: '#8b5cf6', stats: getStats(monthlyData.enhancements) },
                    { name: 'Irrigation', key: 'irrigation', value: totals.irrigation, color: '#3b82f6', stats: getStats(monthlyData.irrigation) },
                    { name: 'Spray/PHC', key: 'sprayPHC', value: totals.sprayPHC, color: '#f97316', stats: getStats(monthlyData.sprayPHC) }
                  ].filter(d => d.value > 0);
                  
                  if (deptData.length === 0) return null;
                  
                  return (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-xs">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Period Summary ({startMonth} to {endMonth}):
                      </p>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1 font-medium text-gray-600"></th>
                            {deptData.map(dept => (
                              <th key={dept.name} className="text-center py-1 px-2" style={{ color: dept.color, fontWeight: 600 }}>
                                {dept.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-1 font-medium text-gray-600">Avg</td>
                            {deptData.map(dept => {
                              const pct = totals.maintRevenue > 0 ? (dept.value / totals.maintRevenue) * 100 : 0;
                              return (
                                <td key={dept.name} className="text-center py-1 px-2 font-bold" style={{ color: dept.color }}>
                                  {pct.toFixed(1)}%
                                </td>
                              );
                            })}
                          </tr>
                          <tr>
                            <td className="py-1 font-medium text-gray-600">High</td>
                            {deptData.map(dept => (
                              <td key={dept.name} className="text-center py-1 px-2 text-gray-700">
                                {dept.stats.high.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-1 font-medium text-gray-600">Median</td>
                            {deptData.map(dept => (
                              <td key={dept.name} className="text-center py-1 px-2 text-gray-700">
                                {dept.stats.median.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-1 font-medium text-gray-600">Low</td>
                            {deptData.map(dept => (
                              <td key={dept.name} className="text-center py-1 px-2 text-gray-700">
                                {dept.stats.low.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-700">Total Extra Sales:</span>
                        <span className={`font-bold ${overallPercent >= 120 ? 'text-green-600' : 'text-amber-600'}`}>
                          {overallPercent.toFixed(1)}%
                        </span>
                        <span className="text-gray-500 text-xs">
                          ({formatCurrency(totalExtraSales)} of {formatCurrency(totals.maintRevenue)} Maintenance)
                        </span>
                        {overallPercent >= 120 ? (
                          <span className="text-green-600 text-xs">✓ Target met</span>
                        ) : (
                          <span className="text-amber-600 text-xs">Below 120% target</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
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
                    
                    {/* Properties Lost Display - shows on hover */}
                    {hoveredRetentionMonth && (() => {
                      const metric = clientRetentionMetrics.find(m => m.month === hoveredRetentionMonth);
                      if (!metric || !metric.propertiesLostList || !metric.propertiesLostList.trim()) {
                        return null;
                      }
                      
                      const BRANCH_COLORS = {
                        'Company': '#6b7280',
                        'Las Vegas': '#fbbf24',
                        'Phx - SW': '#3b82f6',
                        'Phx - SE': '#ef4444',
                        'Phx - N': '#10b981'
                      };
                      
                      // Parse properties by branch - handle multi-line entries
                      const propertiesByBranch = {};
                      let currentBranch = null;
                      
                      metric.propertiesLostList.split('\n').forEach(line => {
                        const branchMatch = line.match(/^(Company|Las Vegas|Phx - SW|Phx - SE|Phx - N):\s*(.*)$/);
                        if (branchMatch) {
                          // Line starts with a branch name
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
                      
                      const branchEntries = Object.entries(propertiesByBranch);
                      if (branchEntries.length === 0) return null;
                      
                      return (
                        <div className="mt-3 p-2 bg-gray-50 rounded border">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Properties Lost - {hoveredRetentionMonth}:
                          </p>
                          <div className="text-xs space-y-1">
                            {branchEntries.map(([branch, properties], idx) => {
                              const color = BRANCH_COLORS[branch] || '#6b7280';
                              return (
                                <div key={idx}>
                                  <span style={{ color, fontWeight: 600 }}>{branch}: </span>
                                  <span style={{ color }}>{properties.join(', ')}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
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
                    selectedBranches: selectedRetentionBranches,
                    onHoverMonth: setHoveredRetentionMonth
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <ClientRetentionChart 
                  data={clientRetentionMetrics} 
                  showDollarValues={showRetentionDollars}
                  selectedBranches={selectedRetentionBranches}
                  onHoverMonth={setHoveredRetentionMonth}
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
              
              {/* Loan Covenant Compliance */}
              {balanceSheet.balanceSheetData && (
                <ChartWrapper 
                  title="Loan Covenant Compliance"
                  description="Status of financial covenants per loan agreement (all tested annually as of Dec 31)"
                >
                  {(() => {
                    // Get latest balance sheet data for liquidity check
                    const latestBalanceSheet = balanceSheetMetrics.length > 0 
                      ? balanceSheetMetrics[balanceSheetMetrics.length - 1] 
                      : null;
                    const liquidReserves = latestBalanceSheet?.liquidReserves || 0;
                    const liquidityMet = liquidReserves >= 750000;
                    
                    // Calculate annual net income for profitability (using rawData for full year)
                    const currentYear = new Date().getFullYear().toString();
                    let annualNetIncome = 0;
                    let monthsWithData = 0;
                    
                    if (financialData.data?.['Company']?.['Company Total']) {
                      const companyTotal = financialData.data['Company']['Company Total'];
                      Object.keys(companyTotal).forEach(month => {
                        if (month.startsWith(currentYear)) {
                          const ni = parseFloat(companyTotal[month]?.netIncome) || 0;
                          if (ni !== 0 || companyTotal[month]?.revenue > 0) {
                            annualNetIncome += ni;
                            monthsWithData++;
                          }
                        }
                      });
                    }
                    const profitabilityMet = annualNetIncome >= 1;
                    
                    // DSCR calculation would need additional data
                    const dscrAvailable = false;
                    const dscrValue = null;
                    const dscrTarget = 1.20;
                    
                    return (
                      <div className="space-y-2 text-sm">
                        {/* Liquidity Covenant */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">Liquidity</p>
                            <p className="text-xs text-gray-500">Min $750K combined · Tested annually (Dec 31)</p>
                            <p className="text-xs text-blue-600 mt-1">
                              Note: Covenant includes Borrowers' (company) + Guarantors' (personal) liquidity
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${liquidityMet ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(liquidReserves)}
                            </p>
                            <p className={`text-xs ${liquidityMet ? 'text-green-600' : 'text-red-600'}`}>
                              {liquidityMet ? '✓ Met' : '✗ Below'} (company only)
                            </p>
                          </div>
                        </div>
                        
                        {/* Profitability Covenant */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">Profitability</p>
                            <p className="text-xs text-gray-500">Min $1 annual NI · Fiscal year-end ({currentYear}: {monthsWithData}mo)</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${profitabilityMet ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(annualNetIncome)}
                            </p>
                            <p className={`text-xs ${profitabilityMet ? 'text-green-600' : 'text-red-600'}`}>
                              {profitabilityMet ? '✓ Met' : '✗ Below'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Debt Service Coverage Ratio */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">Debt Service Coverage</p>
                            <p className="text-xs text-gray-500">Min {dscrTarget.toFixed(2)}x · Annual (Adj. EBITDA / Fixed Charges)</p>
                          </div>
                          <div className="text-right">
                            {dscrAvailable ? (
                              <>
                                <p className={`font-bold ${dscrValue >= dscrTarget ? 'text-green-600' : 'text-red-600'}`}>
                                  {dscrValue.toFixed(2)}x
                                </p>
                                <p className={`text-xs ${dscrValue >= dscrTarget ? 'text-green-600' : 'text-red-600'}`}>
                                  {dscrValue >= dscrTarget ? '✓ Met' : '✗ Below'}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-bold text-gray-400">—</p>
                                <p className="text-xs text-gray-400">Needs EBITDA</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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