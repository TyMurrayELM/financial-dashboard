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

  const handleRetentionBranchToggle = (branch) => {
    setSelectedRetentionBranches(prev => {
      if (branch === 'All') {
        return prev.includes('All') ? [] : ['All'];
      }
      
      const newSelection = prev.includes(branch)
        ? prev.filter(b => b !== branch && b !== 'All')
        : [...prev.filter(b => b !== 'All'), branch];
      
      return newSelection.length === 0 ? ['All'] : newSelection;
    });
  };

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
        isSaving={financialData.isSaving || balanceSheet.isSaving || expenseData.isSaving || clientRetention.isSaving}
        lastSaved={financialData.lastSaved || balanceSheet.lastSaved || expenseData.lastSaved || clientRetention.lastSaved}
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
              
              {/* Extra Sales Revenue & % of Maintenance Chart - MOVED HERE */}
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
                  chartType: 'ExtraSalesChart',
                  chartProps: {
                    data: chartMetrics,
                    showDollarValues: showExtraSalesDollars,
                    showMaintenanceRevenue: showMaintenanceRevenue
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <ExtraSalesChart 
                  data={chartMetrics} 
                  showDollarValues={showExtraSalesDollars}
                  showMaintenanceRevenue={showMaintenanceRevenue}
                />
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
                description={
                  <>
                    <p>Select which revenue per employee metrics to display:</p>
                    <div className="mt-2 space-y-1">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={revenuePerEmployeeLines.all}
                          onChange={(e) => setRevenuePerEmployeeLines(prev => ({ ...prev, all: e.target.checked }))}
                          className="w-3 h-3"
                        />
                        <span>All Employees</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={revenuePerEmployeeLines.direct}
                          onChange={(e) => setRevenuePerEmployeeLines(prev => ({ ...prev, direct: e.target.checked }))}
                          className="w-3 h-3"
                        />
                        <span>Direct Labor Only</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={revenuePerEmployeeLines.indirect}
                          onChange={(e) => setRevenuePerEmployeeLines(prev => ({ ...prev, indirect: e.target.checked }))}
                          className="w-3 h-3"
                        />
                        <span>Indirect Labor Only</span>
                      </label>
                    </div>
                  </>
                }
                onExpand={(toggleProps) => setExpandedChart({
                  title: "Revenue per Employee",
                  chartType: 'RevenuePerEmployeeChart',
                  chartProps: {
                    data: chartMetrics,
                    rollingAverages: revenuePerEmployeeRollingAverages,
                    selectedLines: revenuePerEmployeeLines
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <RevenuePerEmployeeChart 
                  data={chartMetrics} 
                  rollingAverages={revenuePerEmployeeRollingAverages}
                  selectedLines={revenuePerEmployeeLines}
                />
              </ChartWrapper>
              
              {/* Indirect Personnel Costs % of Revenue Chart */}
              <ChartWrapper 
                title="Indirect Personnel Costs % of Revenue"
                showMultipleRollingAverages={true}
                rollingAverageOptions={[
                  { key: '3m', label: '3-Month Avg' },
                  { key: '6m', label: '6-Month Avg' },
                  { key: '12m', label: '12-Month Avg' }
                ]}
                rollingAverageValues={indirectCostsRollingAverages}
                setRollingAverageValues={setIndirectCostsRollingAverages}
                description="Indirect Personnel Costs as % of Revenue with total indirect employee headcount"
                onExpand={(toggleProps) => setExpandedChart({
                  title: "Indirect Personnel Costs % of Revenue",
                  description: "Indirect Personnel Costs as % of Revenue with total indirect employee headcount",
                  chartType: 'IndirectCostsChart',
                  chartProps: {
                    data: chartMetrics,
                    rollingAverages: indirectCostsRollingAverages
                  },
                  renderChart,
                  ...toggleProps
                })}
              >
                <IndirectCostsChart data={chartMetrics} rollingAverages={indirectCostsRollingAverages} />
              </ChartWrapper>
              
              {/* Maintenance to Plan Chart (2025 only) */}
              {calculateMetrics.some(m => m.month.startsWith('2025') && (m.maintRevenue > 0 || m.maintPlan > 0)) && (
                <ChartWrapper 
                  title="Maintenance Revenue vs Plan (2025)"
                  description={
                    selectedRegion === 'Company' && selectedDepartment === 'All' && (
                      <p className="text-xs text-amber-600">
                        <strong>Note:</strong> This chart shows aggregated maintenance department revenues, not Company Total values
                      </p>
                    )
                  }
                  customContent={
                    (() => {
                      // Calculate variance from plan
                      const months2025 = calculateMetrics.filter(m => m.month.startsWith('2025'));
                      let totalActual = 0;
                      let totalPlan = 0;
                      let monthsWithActual = 0;
                      let monthsWithForecast = 0;
                      
                      months2025.forEach(m => {
                        if (m.maintRevenue > 0) {
                          totalActual += m.maintRevenue;
                          monthsWithActual++;
                        }
                        if (m.maintPlan > 0) {
                          totalPlan += m.maintPlan;
                        }
                        if (m.maintenanceForecast2025 > 0) {
                          monthsWithForecast++;
                        }
                      });
                      
                      const variance = totalActual - totalPlan;
                      const variancePercent = totalPlan > 0 ? ((variance / totalPlan) * 100).toFixed(1) : '0.0';
                      
                      return (
                        <>
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">2025 Performance Summary</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-600">Total Actual</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(totalActual)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Total Plan</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(totalPlan)}</p>
                              </div>
                              {totalPlan > 0 && (
                                <div>
                                  <p className="text-xs text-gray-600">Variance from Plan</p>
                                  <span className={`font-semibold ${variance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
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
              
              {/* Client Retention Chart */}
              <ChartWrapper 
                title="Property Retention"
                description={
                  <>
                    <p>Property retention by branch (Target: 90% of properties retained)</p>
                    <div className="mt-2 space-y-1">
                      {['All', 'Company', ...clientRetentionBranches.filter(b => b !== 'Company')].map(branch => (
                        <label key={branch} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedRetentionBranches.includes(branch)}
                            onChange={() => handleRetentionBranchToggle(branch)}
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
        ) : activeTab === 'dataEntry' ? (
          <PLDataEntry 
            {...financialData}
            startMonth={startMonth}
            endMonth={endMonth}
          />
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
        ) : null}
      </div>

      {/* Chart Modal */}
      {expandedChart && (
        <ChartModal
          isOpen={!!expandedChart}
          onClose={() => setExpandedChart(null)}
          title={expandedChart.title}
          description={expandedChart.description}
          chartId={expandedChart.chartId}
          showComments={expandedChart.showComments}
          showDollarToggle={expandedChart.showDollarToggle}
          showDollarValues={expandedChart.showDollarValues}
          setShowDollarValues={expandedChart.setShowDollarValues}
          showMaintenanceRevenueToggle={expandedChart.showMaintenanceRevenueToggle}
          showMaintenanceRevenue={expandedChart.showMaintenanceRevenue}
          setShowMaintenanceRevenue={expandedChart.setShowMaintenanceRevenue}
          showMultipleRollingAverages={expandedChart.showMultipleRollingAverages}
          rollingAverageOptions={expandedChart.rollingAverageOptions}
          rollingAverageValues={expandedChart.rollingAverageValues}
          setRollingAverageValues={expandedChart.setRollingAverageValues}
          customContent={expandedChart.customContent}
        >
          {renderChart(expandedChart.chartType, expandedChart.chartProps)}
        </ChartModal>
      )}
    </div>
  );
};

export default FinancialDashboard;