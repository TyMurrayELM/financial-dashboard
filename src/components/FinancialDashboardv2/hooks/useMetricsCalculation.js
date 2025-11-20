// src/components/FinancialDashboard/hooks/useMetricsCalculation.js

import { useMemo } from 'react';
import { allMonths, departments, maintenanceDepartments, extraSalesDepartments } from '../constants';
import { calculateRollingAverage } from '../utils/calculations';

export const useMetricsCalculation = (
  data,
  balanceSheetData,
  startMonth,
  endMonth,
  selectedRegion,
  selectedDepartment,
  maintenanceRollingAverage,
  revenueRollingAverages,
  vehicleRollingAverages,
  indirectCostsRollingAverages,
  revenuePerEmployeeRollingAverages
) => {
  // Helper function to check if a month has any data
  const monthHasData = (monthData) => {
    // Check if any key financial metric has a non-zero value
    return monthData.revenue > 0 || 
           monthData.cogs > 0 || 
           monthData.netIncome !== 0 || // netIncome can be negative
           monthData.totalEmployees > 0;
  };

  // Calculate metrics with department breakdown
  const calculateMetrics = useMemo(() => {
    if (!data) return [];
    
    const filteredMonths = allMonths.filter(month => month >= startMonth && month <= endMonth);
    const metrics = [];
    
    filteredMonths.forEach(month => {
      let monthData = {
        month,
        revenue: 0,
        cogs: 0,
        grossMargin: 0,
        grossProfit: 0,
        netIncomePercent: 0, 
        maintDirectLaborPercent: 0,
        maintOnlyDirectLaborPercent: 0,  
        maintOnsiteDirectLaborPercent: 0, 
        vehicleMaintPerVehicle: 0,
        netIncome: 0,
        revenuePerEmployee: 0,
        revenuePerIndirect: 0,
        revenuePerDirect: 0,
        employeeRelationsPercent: 0,
        maintenanceVsPlan: 0,
        extraSalesPercent: 0,
        maintRevenue: 0,
        maintPlan: 0,
        maintForecast: 0,
        directLaborHeadcount: null, // Initialize to null instead of 0
        indirectHeadcount: 0,
        totalEmployees: 0,
        hasData: false, // Add flag to track if month has data
        // Department breakdown for stacked chart - initialize to null for proper chart breaking
        maintWORevenue: null,
        arborRevenue: null,
        enhancementsRevenue: null,
        irrigationRevenue: null,
        sprayPHCRevenue: null,
        // Department percentages of maintenance revenue
        maintWOPercent: 0,
        arborPercent: 0,
        enhancementsPercent: 0,
        irrigationPercent: 0,
        sprayPHCPercent: 0,
        // Department wages breakdown for tooltip
        departmentWages: {}
      };
      
      // Initialize aggregation variables
      let maintRevenue = 0;
      let maintOnSiteRevenue = 0;
      let extraSalesRevenue = 0;
      let totalEmployees = 0;
      let totalIndirect = 0;
      let totalDirect = 0;
      let totalMaintLabor = 0;
      let totalVehicleRepair = 0;
      let totalActiveVehicles = 0;
      let totalWages = 0;
      let totalBenefits = 0;
      let totalMeals = 0;
      let totalMaintPlan = 0;
      let totalMaintForecast = 0;
      let maintDirectEmployees = 0;
      let hasAnyData = false; // Track if any data exists for this month
      let hasFinancialData = false; // Track if there's actual financial data (not just counts)
      let hasMaintenanceData = false; // Track if we found any maintenance department data
      
      // New variables for separate tracking
      let maintOnlyRevenue = 0;
      let maintOnsiteRevenue = 0;
      let maintOnlyLaborCost = 0;
      let maintOnsiteLaborCost = 0;
      
      // Check if we're in Company Consolidated view
      const isCompanyConsolidated = selectedRegion === 'Company' && selectedDepartment === 'All';
      
      if (isCompanyConsolidated) {
        // Use Company Total data for main metrics
        const d = data['Company']?.['Company Total']?.[month] || {
          revenue: 0,
          cogs: 0,
          maintDirectLaborCost: 0,
          maintDirectLaborCostOnsites: 0,
          totalVehicleRepairMaint: 0,
          activeVehicles: 1,
          netIncome: 0,
          totalEmployees: 1,
          indirectEmployees: 0,
          directEmployees: 1,
          wages: 0,
          benefits: 0,
          employeeMealsAppreciation: 0,
          maintenancePlan2025: 0,
          maintenanceOnsitePlan2025: 0,
          maintenanceForecast2025: 0,
          maintenanceOnsiteForecast2025: 0
        };
        
        // Check if Company Total has data - improved logic
        // Only consider it has data if revenue or cogs are non-zero, or if net income is non-zero
        // Don't consider default employee counts as "having data"
        if (d.revenue > 0 || d.cogs > 0 || d.netIncome !== 0) {
          hasAnyData = true;
          hasFinancialData = true;
        }
        
        // Set the totals from Company Total
        monthData.revenue = d.revenue;
        monthData.cogs = d.cogs;
        monthData.netIncome = d.netIncome;
        totalEmployees = d.totalEmployees;
        totalIndirect = d.indirectEmployees;
        totalDirect = d.directEmployees;
        totalVehicleRepair = d.totalVehicleRepairMaint;
        totalActiveVehicles = d.activeVehicles;
        totalWages = d.wages;
        
        // Use the maintenance labor costs from Company Total if available
        if (d.maintDirectLaborCost > 0 || d.maintDirectLaborCostOnsites > 0) {
          totalMaintLabor = d.maintDirectLaborCost + d.maintDirectLaborCostOnsites;
          maintOnlyLaborCost = d.maintDirectLaborCost;
          maintOnsiteLaborCost = d.maintDirectLaborCostOnsites;
        }
        
        // For 2025, use the maintenance plan and forecast from Company Total
        if (month.startsWith('2025')) {
          totalMaintPlan = (d.maintenancePlan2025 || 0) + (d.maintenanceOnsitePlan2025 || 0);
          totalMaintForecast = (d.maintenanceForecast2025 || 0) + (d.maintenanceOnsiteForecast2025 || 0);
        }
        
        // Loop through Company departments to calculate maintenance-specific metrics
        departments.forEach(dept => {
          const deptData = data['Company']?.[dept]?.[month] || {
            revenue: 0,
            maintDirectLaborCost: 0,
            directEmployees: 0,
            maintenancePlan2025: 0,
            maintenanceForecast2025: 0
          };
          
          // Check if department has data
          if (deptData.revenue > 0 || deptData.maintDirectLaborCost > 0) {
            hasAnyData = true;
            if (deptData.revenue > 0) hasFinancialData = true;
          }
          
          if (maintenanceDepartments.includes(dept)) {
            maintRevenue += deptData.revenue;
            // Only aggregate labor costs if Company Total doesn't have them
            if (!(d.maintDirectLaborCost > 0 || d.maintDirectLaborCostOnsites > 0)) {
              totalMaintLabor += deptData.maintDirectLaborCost;
              // Track separately for individual department percentages
              if (dept === 'Maintenance') {
                maintOnlyLaborCost += deptData.maintDirectLaborCost;
              } else if (dept === 'Maintenance Onsite') {
                maintOnsiteLaborCost += deptData.maintDirectLaborCost;
              }
            }
            // Only count direct employees if this department has actual revenue or labor cost data
            if (deptData.revenue > 0 || deptData.maintDirectLaborCost > 0) {
              maintDirectEmployees += deptData.directEmployees;
              hasMaintenanceData = true; // We found maintenance department data
            }
            
            // Track separately for individual department revenues
            if (dept === 'Maintenance') {
              maintOnlyRevenue += deptData.revenue;
            } else if (dept === 'Maintenance Onsite') {
              maintOnsiteRevenue += deptData.revenue;
            }
            
            // Aggregate forecast from departments if Company Total doesn't have forecast
            if (month.startsWith('2025')) {
              // If Company Total doesn't have forecast values, aggregate from departments
              if (!(d.maintenanceForecast2025 > 0 || d.maintenanceOnsiteForecast2025 > 0)) {
                totalMaintForecast += deptData.maintenanceForecast2025 || 0;
              }
              // Always aggregate plan from departments if not in Company Total
              if (!(d.maintenancePlan2025 > 0 || d.maintenanceOnsitePlan2025 > 0)) {
                totalMaintPlan += deptData.maintenancePlan2025 || 0;
              }
            }
          } else if (extraSalesDepartments.includes(dept)) {
            extraSalesRevenue += deptData.revenue;
            // Track individual department revenues
            if (dept === 'Maintenance WO') monthData.maintWORevenue += deptData.revenue;
            else if (dept === 'Arbor') monthData.arborRevenue += deptData.revenue;
            else if (dept === 'Enhancements') monthData.enhancementsRevenue += deptData.revenue;
            else if (dept === 'Irrigation') monthData.irrigationRevenue += deptData.revenue;
            else if (dept === 'Spray/PHC') monthData.sprayPHCRevenue += deptData.revenue;
          }
        });
        
      } else {
        // Original logic for department aggregation
        // Determine which regions to process based on selectedRegion
        let regionsToProcess = [];
        if (selectedRegion === 'All') {
          regionsToProcess = ['Las Vegas', 'Phoenix'];
        } else if (selectedRegion === 'Company') {
          regionsToProcess = ['Company'];
        } else {
          regionsToProcess = [selectedRegion];
        }
        
        // Process data based on selected regions
        regionsToProcess.forEach(region => {
          const deptList = departments;
          
          deptList.forEach(dept => {
            if (selectedDepartment !== 'All' && selectedDepartment !== dept) return;
            
            const d = data[region]?.[dept]?.[month] || {
              revenue: 0,
              cogs: 0,
              maintDirectLaborCost: 0,
              maintDirectLaborCostOnsites: 0,
              totalVehicleRepairMaint: 0,
              activeVehicles: 1,
              netIncome: 0,
              totalEmployees: 1,
              indirectEmployees: 0,
              directEmployees: 1,
              wages: 0,
              benefits: 0,
              employeeMealsAppreciation: 0,
              maintenancePlan2025: 0,
              maintenanceForecast2025: 0
            };
            
            // Check if this department/region has data - improved logic
            // Only consider it has data if revenue or cogs are non-zero, or if net income is non-zero
            if (d.revenue > 0 || d.cogs > 0 || d.netIncome !== 0) {
              hasAnyData = true;
              if (d.revenue > 0) hasFinancialData = true;
            }
            
            monthData.revenue += d.revenue;
            monthData.cogs += d.cogs;
            monthData.netIncome += d.netIncome;
            
            totalEmployees += d.totalEmployees;
            totalIndirect += d.indirectEmployees;
            totalDirect += d.directEmployees;
            totalVehicleRepair += d.totalVehicleRepairMaint;
            totalActiveVehicles += d.activeVehicles;
            totalWages += d.wages;
            totalBenefits += d.benefits;
            totalMeals += d.employeeMealsAppreciation;
            
            // Track department wages
            if (!monthData.departmentWages[dept]) {
              monthData.departmentWages[dept] = 0;
            }
            monthData.departmentWages[dept] += d.wages;
            
            if (maintenanceDepartments.includes(dept)) {
              maintRevenue += d.revenue;
              totalMaintLabor += d.maintDirectLaborCost;
              // Only count direct employees if this department has actual revenue or labor cost data
              if (d.revenue > 0 || d.maintDirectLaborCost > 0) {
                maintDirectEmployees += d.directEmployees;
                hasMaintenanceData = true; // We found maintenance department data
              }
              
              // Track separately for individual department percentages
              if (dept === 'Maintenance') {
                maintOnlyRevenue += d.revenue;
                maintOnlyLaborCost += d.maintDirectLaborCost;
              } else if (dept === 'Maintenance Onsite') {
                maintOnsiteRevenue += d.revenue;
                maintOnsiteLaborCost += d.maintDirectLaborCost;
              }
              
              if (month.startsWith('2025')) {
                totalMaintPlan += d.maintenancePlan2025;
                totalMaintForecast += d.maintenanceForecast2025;
              }
            } else if (extraSalesDepartments.includes(dept)) {
              extraSalesRevenue += d.revenue;
              // Track individual department revenues
              if (dept === 'Maintenance WO') monthData.maintWORevenue += d.revenue;
              else if (dept === 'Arbor') monthData.arborRevenue += d.revenue;
              else if (dept === 'Enhancements') monthData.enhancementsRevenue += d.revenue;
              else if (dept === 'Irrigation') monthData.irrigationRevenue += d.revenue;
              else if (dept === 'Spray/PHC') monthData.sprayPHCRevenue += d.revenue;
            }
          });
        });
      }
      
      // Set the hasData flag
      monthData.hasData = hasAnyData;
      
      // Always set the maintenance plan value (it should show even if no actual data)
      monthData.maintPlan = totalMaintPlan > 0 ? totalMaintPlan : null;
      // Only set forecast if there's actually a value, otherwise null
      monthData.maintForecast = totalMaintForecast > 0 ? totalMaintForecast : null;
      
      // Set each metric individually based on whether its specific data exists
      // This allows each line to end independently on the chart
      
      // Revenue - set to null if 0
      monthData.revenue = monthData.revenue > 0 ? monthData.revenue : null;
      
      // COGS - set to null if 0
      monthData.cogs = monthData.cogs > 0 ? monthData.cogs : null;
      
      // Net Income - can be negative, so only null if exactly 0
      monthData.netIncome = monthData.netIncome !== 0 ? monthData.netIncome : null;
      
      // Gross profit and margin - only calculate if revenue exists
      if (monthData.revenue > 0 && monthData.cogs >= 0) {
        monthData.grossProfit = monthData.revenue - monthData.cogs;
        monthData.grossMargin = ((monthData.revenue - monthData.cogs) / monthData.revenue) * 100;
      } else {
        monthData.grossProfit = null;
        monthData.grossMargin = null;
      }
      
      // Net Income Percent - only if both revenue and netIncome exist
      if (monthData.revenue > 0 && monthData.netIncome !== 0) {
        monthData.netIncomePercent = (monthData.netIncome / monthData.revenue) * 100;
      } else {
        monthData.netIncomePercent = null;
      }
      
      // Employee Relations Percent - only if revenue and wages exist
      if (monthData.revenue > 0 && totalWages > 0) {
        monthData.employeeRelationsPercent = (totalWages / monthData.revenue) * 100;
      } else {
        monthData.employeeRelationsPercent = null;
      }
      
      // Maintenance metrics
      monthData.maintRevenue = maintRevenue > 0 ? maintRevenue : null;
      
      // Maintenance labor percentages
      if (maintRevenue > 0 && totalMaintLabor > 0) {
        monthData.maintDirectLaborPercent = (totalMaintLabor / maintRevenue) * 100;
      } else {
        monthData.maintDirectLaborPercent = null;
      }
      
      if (maintOnlyRevenue > 0 && maintOnlyLaborCost > 0) {
        monthData.maintOnlyDirectLaborPercent = (maintOnlyLaborCost / maintOnlyRevenue) * 100;
      } else {
        monthData.maintOnlyDirectLaborPercent = null;
      }
      
      if (maintOnsiteRevenue > 0 && maintOnsiteLaborCost > 0) {
        monthData.maintOnsiteDirectLaborPercent = (maintOnsiteLaborCost / maintOnsiteRevenue) * 100;
      } else {
        monthData.maintOnsiteDirectLaborPercent = null;
      }
      
      // Vehicle metrics - only show both lines when there's vehicle repair data
      // This is the key fix - active vehicles should only show when there's maintenance cost data
      if (hasFinancialData && totalActiveVehicles > 0 && totalVehicleRepair > 0) {
        monthData.vehicleMaintPerVehicle = totalVehicleRepair / totalActiveVehicles;
        monthData.activeVehicles = totalActiveVehicles;
      } else {
        // If no vehicle repair data, don't show either line
        monthData.vehicleMaintPerVehicle = null;
        monthData.activeVehicles = null;
      }
      
      // Revenue per employee metrics
      if (monthData.revenue > 0 && totalEmployees > 0) {
        monthData.revenuePerEmployee = monthData.revenue / totalEmployees;
      } else {
        monthData.revenuePerEmployee = null;
      }
      
      if (monthData.revenue > 0 && totalIndirect > 0) {
        monthData.revenuePerIndirect = monthData.revenue / totalIndirect;
      } else {
        monthData.revenuePerIndirect = null;
      }
      
      if (monthData.revenue > 0 && totalDirect > 0) {
        monthData.revenuePerDirect = monthData.revenue / totalDirect;
      } else {
        monthData.revenuePerDirect = null;
      }
      
      // Headcount metrics - only show if we actually have maintenance employees to show
      // IMPORTANT: If maintDirectEmployees is 0, always set to null to break the line
      if (hasMaintenanceData && maintDirectEmployees > 0) {
        monthData.directLaborHeadcount = maintDirectEmployees;
      } else {
        // Explicitly set to null to break the line in the chart
        monthData.directLaborHeadcount = null;
      }
      
      // Additional defensive check - if it's still 0, set to null
      if (monthData.directLaborHeadcount === 0) {
        monthData.directLaborHeadcount = null;
      }
      
      if (hasFinancialData && totalIndirect > 0) {
        monthData.indirectHeadcount = totalIndirect;
      } else {
        monthData.indirectHeadcount = null;
      }
      
      // Extra sales metrics
      if (maintRevenue > 0 && extraSalesRevenue > 0) {
        monthData.extraSalesPercent = (extraSalesRevenue / maintRevenue) * 100;
        
        // Calculate individual department percentages
        monthData.maintWOPercent = monthData.maintWORevenue > 0 ? (monthData.maintWORevenue / maintRevenue) * 100 : null;
        monthData.arborPercent = monthData.arborRevenue > 0 ? (monthData.arborRevenue / maintRevenue) * 100 : null;
        monthData.enhancementsPercent = monthData.enhancementsRevenue > 0 ? (monthData.enhancementsRevenue / maintRevenue) * 100 : null;
        monthData.irrigationPercent = monthData.irrigationRevenue > 0 ? (monthData.irrigationRevenue / maintRevenue) * 100 : null;
        monthData.sprayPHCPercent = monthData.sprayPHCRevenue > 0 ? (monthData.sprayPHCRevenue / maintRevenue) * 100 : null;
      } else {
        monthData.extraSalesPercent = null;
        monthData.maintWOPercent = null;
        monthData.arborPercent = null;
        monthData.enhancementsPercent = null;
        monthData.irrigationPercent = null;
        monthData.sprayPHCPercent = null;
      }
      
      // Set individual department revenues to null if they're 0 (for dollar view chart breaking)
      monthData.maintWORevenue = monthData.maintWORevenue > 0 ? monthData.maintWORevenue : null;
      monthData.arborRevenue = monthData.arborRevenue > 0 ? monthData.arborRevenue : null;
      monthData.enhancementsRevenue = monthData.enhancementsRevenue > 0 ? monthData.enhancementsRevenue : null;
      monthData.irrigationRevenue = monthData.irrigationRevenue > 0 ? monthData.irrigationRevenue : null;
      monthData.sprayPHCRevenue = monthData.sprayPHCRevenue > 0 ? monthData.sprayPHCRevenue : null;
      
      // Maintenance vs plan percentage
      if (month.startsWith('2025') && totalMaintPlan > 0 && maintRevenue > 0) {
        monthData.maintenanceVsPlan = ((maintRevenue - totalMaintPlan) / totalMaintPlan) * 100;
      } else {
        monthData.maintenanceVsPlan = null;
      }
      
      // Store other values for potential use
      monthData.totalEmployees = totalEmployees;
      monthData.totalWages = totalWages;
      monthData.totalVehicleRepairMaint = totalVehicleRepair;
      
      metrics.push(monthData);
    });
    
    return metrics;
  }, [data, startMonth, endMonth, selectedRegion, selectedDepartment]);

  // Calculate rolling averages for chart data
  const chartMetrics = useMemo(() => {
    let metricsWithRolling = [...calculateMetrics];
    
    // Maintenance DL percentages (3, 6, and 12 month options)
    if (maintenanceRollingAverage) {
      if (maintenanceRollingAverage['3m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintOnlyDirectLaborPercent', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintOnsiteDirectLaborPercent', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintDirectLaborPercent', 3);
      }
      if (maintenanceRollingAverage['6m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintOnlyDirectLaborPercent', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintOnsiteDirectLaborPercent', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintDirectLaborPercent', 6);
      }
      if (maintenanceRollingAverage['12m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintOnlyDirectLaborPercent', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintOnsiteDirectLaborPercent', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintDirectLaborPercent', 12);
      }
    }
    
    // Revenue chart metrics (3, 6, and 12 month options)
    if (revenueRollingAverages) {
      if (revenueRollingAverages['3m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenue', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'netIncomePercent', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'grossMargin', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'netIncome', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'grossProfit', 3);
      }
      if (revenueRollingAverages['6m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenue', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'netIncomePercent', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'grossMargin', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'netIncome', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'grossProfit', 6);
      }
      if (revenueRollingAverages['12m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenue', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'netIncomePercent', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'grossMargin', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'netIncome', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'grossProfit', 12);
      }
    }
    
    // Vehicle metrics (3, 6, and 12 month options)
    if (vehicleRollingAverages) {
      if (vehicleRollingAverages['3m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'vehicleMaintPerVehicle', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'activeVehicles', 3);
      }
      if (vehicleRollingAverages['6m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'vehicleMaintPerVehicle', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'activeVehicles', 6);
      }
      if (vehicleRollingAverages['12m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'vehicleMaintPerVehicle', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'activeVehicles', 12);
      }
    }
    
    // Indirect costs metrics (3, 6, and 12 month options)
    if (indirectCostsRollingAverages) {
      if (indirectCostsRollingAverages['3m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'employeeRelationsPercent', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'indirectHeadcount', 3);
      }
      if (indirectCostsRollingAverages['6m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'employeeRelationsPercent', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'indirectHeadcount', 6);
      }
      if (indirectCostsRollingAverages['12m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'employeeRelationsPercent', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'indirectHeadcount', 12);
      }
    }
    
    // Revenue per employee metrics (3, 6, and 12 month options)
    if (revenuePerEmployeeRollingAverages) {
      if (revenuePerEmployeeRollingAverages['3m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenuePerEmployee', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenuePerDirect', 3);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenuePerIndirect', 3);
      }
      if (revenuePerEmployeeRollingAverages['6m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenuePerEmployee', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenuePerDirect', 6);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenuePerIndirect', 6);
      }
      if (revenuePerEmployeeRollingAverages['12m']) {
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenuePerEmployee', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenuePerDirect', 12);
        metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'revenuePerIndirect', 12);
      }
    }
    
    return metricsWithRolling;
  }, [calculateMetrics, maintenanceRollingAverage, revenueRollingAverages, vehicleRollingAverages, indirectCostsRollingAverages, revenuePerEmployeeRollingAverages]);

  // Calculate balance sheet metrics
  const balanceSheetMetrics = useMemo(() => {
    if (!balanceSheetData) return [];
    
    const filteredMonths = allMonths.filter(month => month >= startMonth && month <= endMonth);
    const metrics = [];
    
    filteredMonths.forEach(month => {
      const data = balanceSheetData[month] || {
        checking: 0,
        moneyMarket: 0,
        stTreasuries: 0,
        payroll: 0,
        accountsReceivable: 0,
        otherCurrentAssets: 0,
        fixedAssets: 0,
        otherAssets: 0,
        accountsPayable: 0,
        creditCards: 0,
        otherCurrentLiabilities: 0,
        fordVehicles: 0,
        midfirstLoans: 0,
        sbaEidlLoan: 0,
        equity: 0,
        monthlyOperatingExpenses: 1600000
      };
      
      // Check if month has balance sheet data - be more strict about what counts as "having data"
      const hasBalanceSheetData = data.checking > 0 || 
                                  data.moneyMarket > 0 || 
                                  data.stTreasuries > 0 ||
                                  data.equity > 0 ||
                                  data.accountsReceivable > 0 ||
                                  data.fixedAssets > 0 ||
                                  data.fordVehicles > 0 ||
                                  data.midfirstLoans > 0 ||
                                  data.sbaEidlLoan > 0 ||
                                  data.accountsPayable > 0 ||
                                  data.creditCards > 0;
      
      // If no balance sheet data at all, set everything to null
      if (!hasBalanceSheetData) {
        metrics.push({
          month,
          hasData: false,
          // Set all numeric values to null to break the lines
          checking: null,
          moneyMarket: null,
          stTreasuries: null,
          liquidReserves: null,
          totalAssets: null,
          totalLiabilities: null,
          equity: null,
          totalLongTermLiabilities: null,
          totalCurrentAssets: null,
          totalCurrentLiabilities: null,
          fordVehicles: null,
          midfirstLoans: null,
          sbaEidlLoan: null,
          debtToEquity: null,
          currentRatio: null,
          reservesPercentOfAssets: null,
          monthsOfExpensesCoverage: null,
          monthlyOperatingExpenses: null,
          checkingPercent: null,
          moneyMarketPercent: null,
          stTreasuriesPercent: null
        });
      } else {
        // Calculate totals only if we have data
        const liquidReserves = data.checking + data.moneyMarket + data.stTreasuries;
        const totalCurrentAssets = liquidReserves + data.payroll + data.accountsReceivable + data.otherCurrentAssets;
        const totalAssets = totalCurrentAssets + data.fixedAssets + data.otherAssets;
        
        const totalCurrentLiabilities = data.accountsPayable + data.creditCards + data.otherCurrentLiabilities;
        const totalLongTermLiabilities = data.fordVehicles + data.midfirstLoans + data.sbaEidlLoan;
        const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
        
        // Calculate ratios - set to null if denominators are 0
        const debtToEquity = data.equity > 0 ? totalLongTermLiabilities / data.equity : null;
        const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : null;
        const reservesPercentOfAssets = totalAssets > 0 ? (liquidReserves / totalAssets) * 100 : null;
        const monthsOfExpensesCoverage = data.monthlyOperatingExpenses > 0 ? liquidReserves / data.monthlyOperatingExpenses : null;
        
        metrics.push({
          month,
          hasData: hasBalanceSheetData,
          // Reserves breakdown
          checking: data.checking || null,
          moneyMarket: data.moneyMarket || null,
          stTreasuries: data.stTreasuries || null,
          liquidReserves: liquidReserves || null,
          // Balance sheet totals - set to null if 0
          totalAssets: totalAssets > 0 ? totalAssets : null,
          totalLiabilities: totalLiabilities > 0 ? totalLiabilities : null,
          equity: data.equity > 0 ? data.equity : null,
          totalLongTermLiabilities: totalLongTermLiabilities > 0 ? totalLongTermLiabilities : null,
          totalCurrentAssets: totalCurrentAssets > 0 ? totalCurrentAssets : null,
          totalCurrentLiabilities: totalCurrentLiabilities > 0 ? totalCurrentLiabilities : null,
          // Individual debt components - set to null if 0
          fordVehicles: data.fordVehicles > 0 ? data.fordVehicles : null,
          midfirstLoans: data.midfirstLoans > 0 ? data.midfirstLoans : null,
          sbaEidlLoan: data.sbaEidlLoan > 0 ? data.sbaEidlLoan : null,
          // Ratios
          debtToEquity: debtToEquity,
          currentRatio: currentRatio,
          reservesPercentOfAssets: reservesPercentOfAssets,
          monthsOfExpensesCoverage: monthsOfExpensesCoverage,
          // Monthly operating expenses
          monthlyOperatingExpenses: data.monthlyOperatingExpenses > 0 ? data.monthlyOperatingExpenses : null,
          // Percentages for reserves chart
          checkingPercent: liquidReserves > 0 ? (data.checking / liquidReserves) * 100 : null,
          moneyMarketPercent: liquidReserves > 0 ? (data.moneyMarket / liquidReserves) * 100 : null,
          stTreasuriesPercent: liquidReserves > 0 ? (data.stTreasuries / liquidReserves) * 100 : null
        });
      }
    });
    
    return metrics;
  }, [balanceSheetData, startMonth, endMonth]);

  return {
    calculateMetrics,
    chartMetrics,
    balanceSheetMetrics
  };
};