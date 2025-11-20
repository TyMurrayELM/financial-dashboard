import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, TrendingUp, Users, Truck, Target, ChevronRight, ChevronDown, Save, Cloud, CloudOff, Maximize2, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import './FinancialDashboard.css';

const FinancialDashboard = () => {
  const regions = ['Las Vegas', 'Phoenix'];
  const departments = ['Maintenance', 'Maintenance Onsite', 'Maintenance WO', 'Irrigation', 'Enhancements', 'Arbor', 'Spray/PHC', 'Overhead'];
  
  // Define which departments are maintenance vs extra sales
  const maintenanceDepartments = ['Maintenance', 'Maintenance Onsite'];
  const extraSalesDepartments = ['Maintenance WO', 'Irrigation', 'Enhancements', 'Arbor', 'Spray/PHC'];
  // Note: 'Overhead' is neither maintenance nor extra sales - it's a cost center
  
  // State for connection status
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // State for expanded chart
  const [expandedChart, setExpandedChart] = useState(null);
  
  // Generate months from 2023 to 2025
  const generateMonths = () => {
    const months = [];
    for (let year = 2023; year <= 2025; year++) {
      for (let month = 1; month <= 12; month++) {
        months.push(`${year}-${month.toString().padStart(2, '0')}`);
      }
    }
    return months;
  };
  
  const allMonths = generateMonths();
  
  const [startMonth, setStartMonth] = useState('2025-01');
  const [endMonth, setEndMonth] = useState('2025-12');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dataEntryRegion, setDataEntryRegion] = useState('');
  const [dataEntryDept, setDataEntryDept] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [showRollingAverage, setShowRollingAverage] = useState(false);
  
  // Initialize balance sheet data structure
  const initializeBalanceSheetData = () => {
    const balanceData = {};
    allMonths.forEach(month => {
      balanceData[month] = {
        // Current Assets
        checking: 0,
        moneyMarket: 0,
        stTreasuries: 0,
        payroll: 0,
        accountsReceivable: 0,
        otherCurrentAssets: 0,
        // Fixed & Other Assets
        fixedAssets: 0,
        otherAssets: 0,
        // Current Liabilities
        accountsPayable: 0,
        creditCards: 0,
        otherCurrentLiabilities: 0,
        // Long Term Liabilities
        fordVehicles: 0,
        midfirstLoans: 0,
        sbaEidlLoan: 0,
        // Equity
        equity: 0,
        // Monthly Operating Expenses (for reserves calculation)
        monthlyOperatingExpenses: 1600000 // Default to $1.6M as mentioned
      };
    });
    return balanceData;
  };
  
  const [balanceSheetData, setBalanceSheetData] = useState(() => initializeBalanceSheetData());
  
  // Initialize data structure
  const initializeEmptyData = () => {
    const initialData = {};
    // Initialize regular regions and departments
    regions.forEach(region => {
      initialData[region] = {};
      departments.forEach(dept => {
        initialData[region][dept] = {};
        allMonths.forEach(month => {
          initialData[region][dept][month] = {
            revenue: 0,
            cogs: 0,
            maintDirectLaborCost: 0,
            totalVehicleRepairMaint: 0,
            activeVehicles: 1,
            netIncome: 0,
            totalEmployees: 1,
            indirectEmployees: 0,
            directEmployees: 1,
            wages: 0,
            benefits: 0,
            employeeMealsAppreciation: 0,
            maintenancePlan2025: 0
          };
        });
      });
    });
    
    // Initialize Company level with all departments
    initialData['Company'] = {};
    departments.forEach(dept => {
      initialData['Company'][dept] = {};
      allMonths.forEach(month => {
        initialData['Company'][dept][month] = {
          revenue: 0,
          cogs: 0,
          maintDirectLaborCost: 0,
          totalVehicleRepairMaint: 0,
          activeVehicles: 1,
          netIncome: 0,
          totalEmployees: 1,
          indirectEmployees: 0,
          directEmployees: 1,
          wages: 0,
          benefits: 0,
          employeeMealsAppreciation: 0,
          maintenancePlan2025: 0
        };
      });
    });
    
    // Add Company Total for high-level P&L entry
    initialData['Company']['Company Total'] = {};
    allMonths.forEach(month => {
      initialData['Company']['Company Total'][month] = {
        revenue: 0,
        cogs: 0,
        maintDirectLaborCost: 0,
        totalVehicleRepairMaint: 0,
        activeVehicles: 1,
        netIncome: 0,
        totalEmployees: 1,
        indirectEmployees: 0,
        directEmployees: 1,
        wages: 0,
        benefits: 0,
        employeeMealsAppreciation: 0,
        maintenancePlan2025: 0
      };
    });
    
    return initialData;
  };
  
  // Use a function to get initial data to ensure it's always properly initialized
  const getInitialData = () => {
    const data = initializeEmptyData();
    // Ensure all structures exist
    ['Company', ...regions].forEach(region => {
      if (!data[region]) data[region] = {};
      departments.forEach(dept => {
        if (!data[region][dept]) data[region][dept] = {};
        allMonths.forEach(month => {
          if (!data[region][dept][month]) {
            data[region][dept][month] = {
              revenue: 0,
              cogs: 0,
              maintDirectLaborCost: 0,
              totalVehicleRepairMaint: 0,
              activeVehicles: 1,
              netIncome: 0,
              totalEmployees: 1,
              indirectEmployees: 0,
              directEmployees: 1,
              wages: 0,
              benefits: 0,
              employeeMealsAppreciation: 0,
              maintenancePlan2025: 0
            };
          }
        });
      });
    });
    
    // Ensure Company Total exists
    if (!data['Company']['Company Total']) {
      data['Company']['Company Total'] = {};
      allMonths.forEach(month => {
        data['Company']['Company Total'][month] = {
          revenue: 0,
          cogs: 0,
          maintDirectLaborCost: 0,
          totalVehicleRepairMaint: 0,
          activeVehicles: 1,
          netIncome: 0,
          totalEmployees: 1,
          indirectEmployees: 0,
          directEmployees: 1,
          wages: 0,
          benefits: 0,
          employeeMealsAppreciation: 0,
          maintenancePlan2025: 0
        };
      });
    }
    
    return data;
  };
  
  const [data, setData] = useState(null); // Start with null to indicate loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data from Supabase on component mount
  useEffect(() => {
    loadDataFromSupabase();
    loadBalanceSheetFromSupabase();
    checkConnection();
  }, []);
  
  // Check Supabase connection
  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('financial_data').select('count', { count: 'exact', head: true });
      setIsConnected(!error);
    } catch (error) {
      setIsConnected(false);
    }
  };
  
  // Load data from Supabase
  const loadDataFromSupabase = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('financial_data')
        .select('*');
      
      if (error) throw error;
      
      // Start with a fully initialized data structure
      const newData = getInitialData();
      
      // Populate data from database (only override what exists in DB)
      if (dbData && dbData.length > 0) {
        dbData.forEach(row => {
          // Check if the structure exists before trying to update it
          if (newData[row.region] && 
              newData[row.region][row.department] && 
              newData[row.region][row.department][row.month]) {
            newData[row.region][row.department][row.month] = {
              revenue: parseFloat(row.revenue) || 0,
              cogs: parseFloat(row.cogs) || 0,
              maintDirectLaborCost: parseFloat(row.maint_direct_labor_cost) || 0,
              totalVehicleRepairMaint: parseFloat(row.total_vehicle_repair_maint) || 0,
              activeVehicles: parseInt(row.active_vehicles) || 1,
              netIncome: parseFloat(row.net_income) || 0,
              totalEmployees: parseInt(row.total_employees) || 1,
              indirectEmployees: parseInt(row.indirect_employees) || 0,
              directEmployees: parseInt(row.direct_employees) || 1,
              wages: parseFloat(row.wages) || 0,
              benefits: 0, // Default to 0 since column removed
              employeeMealsAppreciation: 0, // Default to 0 since column removed
              maintenancePlan2025: parseFloat(row.maintenance_plan_2025) || 0
            };
          }
        });
      }
      
      setData(newData);
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsConnected(false);
      // Even if loading fails, use the initialized empty data
      setData(getInitialData());
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load balance sheet data from Supabase
  const loadBalanceSheetFromSupabase = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('balance_sheet_data')
        .select('*');
      
      if (error && error.code !== 'PGRST116') throw error; // Ignore table not found error
      
      // Start with initialized data
      const newBalanceData = initializeBalanceSheetData();
      
      // Populate from database if data exists
      if (dbData && dbData.length > 0) {
        dbData.forEach(row => {
          if (newBalanceData[row.month]) {
            newBalanceData[row.month] = {
              // Current Assets
              checking: parseFloat(row.checking) || 0,
              moneyMarket: parseFloat(row.money_market) || 0,
              stTreasuries: parseFloat(row.st_treasuries) || 0,
              payroll: parseFloat(row.payroll) || 0,
              accountsReceivable: parseFloat(row.accounts_receivable) || 0,
              otherCurrentAssets: parseFloat(row.other_current_assets) || 0,
              // Fixed & Other Assets
              fixedAssets: parseFloat(row.fixed_assets) || 0,
              otherAssets: parseFloat(row.other_assets) || 0,
              // Current Liabilities
              accountsPayable: parseFloat(row.accounts_payable) || 0,
              creditCards: parseFloat(row.credit_cards) || 0,
              otherCurrentLiabilities: parseFloat(row.other_current_liabilities) || 0,
              // Long Term Liabilities
              fordVehicles: parseFloat(row.ford_vehicles) || 0,
              midfirstLoans: parseFloat(row.midfirst_loans) || 0,
              sbaEidlLoan: parseFloat(row.sba_eidl_loan) || 0,
              // Equity
              equity: parseFloat(row.equity) || 0,
              // Monthly Operating Expenses
              monthlyOperatingExpenses: parseFloat(row.monthly_operating_expenses) || 1600000
            };
          }
        });
      }
      
      setBalanceSheetData(newBalanceData);
    } catch (error) {
      console.error('Error loading balance sheet data:', error);
      setBalanceSheetData(initializeBalanceSheetData());
    }
  };
  
  // Save balance sheet data to Supabase
  const saveBalanceSheetToSupabase = useCallback(async (month, data) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('balance_sheet_data')
        .upsert({
          month,
          // Current Assets
          checking: data.checking,
          money_market: data.moneyMarket,
          st_treasuries: data.stTreasuries,
          payroll: data.payroll,
          accounts_receivable: data.accountsReceivable,
          other_current_assets: data.otherCurrentAssets,
          // Fixed & Other Assets
          fixed_assets: data.fixedAssets,
          other_assets: data.otherAssets,
          // Current Liabilities
          accounts_payable: data.accountsPayable,
          credit_cards: data.creditCards,
          other_current_liabilities: data.otherCurrentLiabilities,
          // Long Term Liabilities
          ford_vehicles: data.fordVehicles,
          midfirst_loans: data.midfirstLoans,
          sba_eidl_loan: data.sbaEidlLoan,
          // Equity
          equity: data.equity,
          // Monthly Operating Expenses
          monthly_operating_expenses: data.monthlyOperatingExpenses,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'month'
        });
      
      if (error) {
        console.error('Balance sheet save error:', error);
        throw error;
      }
      
      setIsConnected(true);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving balance sheet data:', error);
      alert(`Failed to save balance sheet data: ${error.message || 'Unknown error'}`);
      setIsConnected(false);
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Debounce timer for balance sheet
  const [balanceSheetSaveTimer, setBalanceSheetSaveTimer] = useState(null);
  
  // Update balance sheet data
  const updateBalanceSheetData = (month, field, value) => {
    setBalanceSheetData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)); // Deep copy
      if (!newData[month]) {
        newData[month] = {
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
      }
      
      newData[month][field] = parseFloat(value) || 0;
      
      // Clear existing timer
      if (balanceSheetSaveTimer) clearTimeout(balanceSheetSaveTimer);
      
      // Set new timer to save after 1 second of inactivity
      const timer = setTimeout(() => {
        saveBalanceSheetToSupabase(month, newData[month]);
      }, 1000);
      
      setBalanceSheetSaveTimer(timer);
      
      return newData;
    });
  };
  
  // Save data to Supabase (debounced)
  const saveToSupabase = useCallback(async (region, dept, month, fieldData) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('financial_data')
        .upsert({
          region,
          department: dept,
          month,
          revenue: fieldData.revenue,
          cogs: fieldData.cogs,
          maint_direct_labor_cost: fieldData.maintDirectLaborCost,
          total_vehicle_repair_maint: fieldData.totalVehicleRepairMaint,
          active_vehicles: fieldData.activeVehicles,
          net_income: fieldData.netIncome,
          total_employees: fieldData.totalEmployees,
          indirect_employees: fieldData.indirectEmployees,
          direct_employees: fieldData.directEmployees,
          wages: fieldData.wages,
          maintenance_plan_2025: fieldData.maintenancePlan2025,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'region,department,month'
        });
      
      if (error) {
        console.error('Supabase save error:', error);
        throw error;
      }
      
      setIsConnected(true);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving data:', error);
      alert(`Failed to save data: ${error.message || 'Unknown error'}`);
      setIsConnected(false);
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Debounce timer
  const [saveTimer, setSaveTimer] = useState(null);
  
  // Handle data update with automatic saving
  const updateData = (region, dept, month, field, value) => {
    // Update local state immediately
    setData(prev => {
      const newData = { ...prev };
      
      // Ensure the structure exists
      if (!newData[region]) newData[region] = {};
      if (!newData[region][dept]) newData[region][dept] = {};
      if (!newData[region][dept][month]) {
        newData[region][dept][month] = {
          revenue: 0,
          cogs: 0,
          maintDirectLaborCost: 0,
          totalVehicleRepairMaint: 0,
          activeVehicles: 1,
          netIncome: 0,
          totalEmployees: 1,
          indirectEmployees: 0,
          directEmployees: 1,
          wages: 0,
          benefits: 0,
          employeeMealsAppreciation: 0,
          maintenancePlan2025: 0
        };
      }
      
      // Update the specific field
      newData[region][dept][month][field] = parseFloat(value) || 0;
      
      // Clear existing timer
      if (saveTimer) clearTimeout(saveTimer);
      
      // Set new timer to save after 1 second of inactivity
      const timer = setTimeout(() => {
        saveToSupabase(region, dept, month, newData[region][dept][month]);
      }, 1000);
      
      setSaveTimer(timer);
      
      return newData;
    });
  };
  
  // Toggle department expansion
  const toggleDepartment = (dept) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [dept]: !prev[dept]
    }));
  };
  
  // Calculate 6-month rolling average
  const calculateRollingAverage = (data, key, windowSize = 6) => {
    return data.map((item, index) => {
      const start = Math.max(0, index - windowSize + 1);
      const values = data.slice(start, index + 1).map(d => d[key] || 0);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return {
        ...item,
        [`${key}Rolling`]: avg
      };
    });
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
        directLaborHeadcount: 0, 
        indirectHeadcount: 0, 
        // Department breakdown for stacked chart
        maintWORevenue: 0,
        arborRevenue: 0,
        enhancementsRevenue: 0,
        irrigationRevenue: 0,
        sprayPHCRevenue: 0,
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
      let maintDirectEmployees = 0;
      
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
          totalVehicleRepairMaint: 0,
          activeVehicles: 1,
          netIncome: 0,
          totalEmployees: 1,
          indirectEmployees: 0,
          directEmployees: 1,
          wages: 0,
          benefits: 0,
          employeeMealsAppreciation: 0,
          maintenancePlan2025: 0
        };
        
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
        
        // For 2025, use the maintenance plan from Company Total
        if (month.startsWith('2025')) {
          totalMaintPlan = d.maintenancePlan2025;
        }
        
        // For Maintenance DL % chart, we still need to aggregate department data
        // Loop through Company departments to calculate maintenance-specific metrics
        departments.forEach(dept => {
          const deptData = data['Company']?.[dept]?.[month] || {
            revenue: 0,
            maintDirectLaborCost: 0,
            directEmployees: 0,
            maintenancePlan2025: 0
          };
          
          if (maintenanceDepartments.includes(dept)) {
            maintRevenue += deptData.revenue;
            totalMaintLabor += deptData.maintDirectLaborCost;
            maintDirectEmployees += deptData.directEmployees;
            
            // Track separately for individual department percentages
            if (dept === 'Maintenance') {
              maintOnlyRevenue += deptData.revenue;
              maintOnlyLaborCost += deptData.maintDirectLaborCost;
            } else if (dept === 'Maintenance Onsite') {
              maintOnsiteRevenue += deptData.revenue;
              maintOnsiteLaborCost += deptData.maintDirectLaborCost;
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
          regionsToProcess = regions; // Only process Las Vegas and Phoenix, not Company
        } else if (selectedRegion === 'Company') {
          regionsToProcess = ['Company']; // Only process Company data
        } else {
          regionsToProcess = [selectedRegion]; // Process specific region
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
              totalVehicleRepairMaint: 0,
              activeVehicles: 1,
              netIncome: 0,
              totalEmployees: 1,
              indirectEmployees: 0,
              directEmployees: 1,
              wages: 0,
              benefits: 0,
              employeeMealsAppreciation: 0,
              maintenancePlan2025: 0
            };
            
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
              maintDirectEmployees += d.directEmployees; 
              
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
            // Note: Overhead department contributes to totals but not to maintenance or extra sales
          });
        });
      }
      
      // Store maintenance revenue and plan for chart
      monthData.maintRevenue = maintRevenue;
      monthData.maintPlan = totalMaintPlan;
      monthData.directLaborHeadcount = maintDirectEmployees; 
      monthData.indirectHeadcount = totalIndirect; 
      monthData.totalWages = totalWages; 
      
      // Calculate derived metrics
      if (monthData.revenue > 0) {
        monthData.grossMargin = ((monthData.revenue - monthData.cogs) / monthData.revenue) * 100;
        monthData.netIncomePercent = (monthData.netIncome / monthData.revenue) * 100;
        monthData.employeeRelationsPercent = (totalWages / monthData.revenue) * 100; 
      }
      
      // Calculate all three maintenance labor percentages
      if (maintRevenue > 0) {
        monthData.maintDirectLaborPercent = (totalMaintLabor / maintRevenue) * 100;
      }
      
      if (maintOnlyRevenue > 0) {
        monthData.maintOnlyDirectLaborPercent = (maintOnlyLaborCost / maintOnlyRevenue) * 100;
      }
      
      if (maintOnsiteRevenue > 0) {
        monthData.maintOnsiteDirectLaborPercent = (maintOnsiteLaborCost / maintOnsiteRevenue) * 100;
      }
      
      if (totalActiveVehicles > 0) {
        monthData.vehicleMaintPerVehicle = totalVehicleRepair / totalActiveVehicles;
      }
      
      if (totalEmployees > 0) {
        monthData.revenuePerEmployee = monthData.revenue / totalEmployees;
      }
      
      if (totalIndirect > 0) {
        monthData.revenuePerIndirect = monthData.revenue / totalIndirect;
      }
      
      if (totalDirect > 0) {
        monthData.revenuePerDirect = monthData.revenue / totalDirect;
      }
      
      // Calculate extra sales percentage of maintenance revenue
      const totalMaintRevenue = maintRevenue;
      if (totalMaintRevenue > 0) {
        monthData.extraSalesPercent = (extraSalesRevenue / totalMaintRevenue) * 100;
        
        // Calculate individual department percentages of maintenance revenue
        monthData.maintWOPercent = (monthData.maintWORevenue / totalMaintRevenue) * 100;
        monthData.arborPercent = (monthData.arborRevenue / totalMaintRevenue) * 100;
        monthData.enhancementsPercent = (monthData.enhancementsRevenue / totalMaintRevenue) * 100;
        monthData.irrigationPercent = (monthData.irrigationRevenue / totalMaintRevenue) * 100;
        monthData.sprayPHCPercent = (monthData.sprayPHCRevenue / totalMaintRevenue) * 100;
      }
      
      // Calculate maintenance vs plan percentage
      if (month.startsWith('2025') && totalMaintPlan > 0) {
        monthData.maintenanceVsPlan = ((maintRevenue - totalMaintPlan) / totalMaintPlan) * 100;
      }
      
      metrics.push(monthData);
    });
    
    return metrics;
  }, [data, startMonth, endMonth, selectedRegion, selectedDepartment, maintenanceDepartments]);

  // Calculate rolling averages for chart data
  const chartMetrics = useMemo(() => {
    if (!showRollingAverage) return calculateMetrics;
    
    // Calculate rolling averages for maintenance DL percentages
    let metricsWithRolling = [...calculateMetrics];
    metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintOnlyDirectLaborPercent');
    metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintOnsiteDirectLaborPercent');
    metricsWithRolling = calculateRollingAverage(metricsWithRolling, 'maintDirectLaborPercent');
    
    return metricsWithRolling;
  }, [calculateMetrics, showRollingAverage]);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };
  
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
      
      // Calculate totals
      const liquidReserves = data.checking + data.moneyMarket + data.stTreasuries;
      const totalCurrentAssets = liquidReserves + data.payroll + data.accountsReceivable + data.otherCurrentAssets;
      const totalAssets = totalCurrentAssets + data.fixedAssets + data.otherAssets;
      
      const totalCurrentLiabilities = data.accountsPayable + data.creditCards + data.otherCurrentLiabilities;
      const totalLongTermLiabilities = data.fordVehicles + data.midfirstLoans + data.sbaEidlLoan;
      const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
      
      // Calculate ratios
      const debtToEquity = data.equity > 0 ? totalLongTermLiabilities / data.equity : 0;
      const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0;
      const reservesPercentOfAssets = totalAssets > 0 ? (liquidReserves / totalAssets) * 100 : 0;
      const monthsOfExpensesCoverage = data.monthlyOperatingExpenses > 0 ? liquidReserves / data.monthlyOperatingExpenses : 0;
      
      metrics.push({
        month,
        // Reserves breakdown
        checking: data.checking,
        moneyMarket: data.moneyMarket,
        stTreasuries: data.stTreasuries,
        liquidReserves,
        // Balance sheet totals
        totalAssets,
        totalLiabilities,
        equity: data.equity,
        totalLongTermLiabilities,
        totalCurrentAssets,
        totalCurrentLiabilities,
        // Ratios
        debtToEquity,
        currentRatio,
        reservesPercentOfAssets,
        monthsOfExpensesCoverage,
        // Monthly operating expenses
        monthlyOperatingExpenses: data.monthlyOperatingExpenses,
        // Percentages for reserves chart
        checkingPercent: liquidReserves > 0 ? (data.checking / liquidReserves) * 100 : 0,
        moneyMarketPercent: liquidReserves > 0 ? (data.moneyMarket / liquidReserves) * 100 : 0,
        stTreasuriesPercent: liquidReserves > 0 ? (data.stTreasuries / liquidReserves) * 100 : 0
      });
    });
    
    return metrics;
  }, [balanceSheetData, startMonth, endMonth]);
  
  // Format input value for display
  const formatInputCurrency = (value) => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Parse currency input back to number
  const parseCurrencyInput = (value) => {
    return value.replace(/[^0-9.-]/g, '');
  };
  
  // Get formatted value or empty string for display
  const getFormattedValue = (value) => {
    return value ? formatInputCurrency(value) : '';
  };
// Chart Modal Component
  const ChartModal = ({ chart, onClose }) => {
    React.useEffect(() => {
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
                  transition: 'all 0.2s'
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
                {chart.content}
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
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  };

  // Custom tooltip for Indirect Personnel Costs chart
  const IndirectCostsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const metric = calculateMetrics.find(m => m.month === label);
      if (!metric) return null;
      
      const percentData = payload.find(p => p.dataKey === 'employeeRelationsPercent');
      const headcountData = payload.find(p => p.dataKey === 'indirectHeadcount');
      
      // Check if in Company Consolidated view
      const isCompanyConsolidated = selectedRegion === 'Company' && selectedDepartment === 'All';
      
      return (
        <div className="bg-white p-4 border rounded shadow-lg" style={{ minWidth: '280px' }}>
          <p className="font-medium text-sm mb-3">{label}</p>
          
          <div className="space-y-2 border-b pb-2 mb-2">
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: percentData?.color }}>Indirect Personnel %:</span>
              <span className="font-medium ml-4">{formatPercent(percentData?.value || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: headcountData?.color }}>Indirect Headcount:</span>
              <span className="font-medium ml-4">{Math.round(headcountData?.value || 0)}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-700">
            {isCompanyConsolidated ? (
              <>
                <div className="flex justify-between font-medium">
                  <span>Total Company Wages:</span>
                  <span>{formatCurrency(metric.totalWages || 0)}</span>
                </div>
                <div className="mt-1 text-gray-600">
                  <span>Total Revenue:</span>
                  <span className="ml-2">{formatCurrency(metric.revenue || 0)}</span>
                </div>
              </>
            ) : (
              <>
                <p className="font-medium mb-1">Department Wages Breakdown:</p>
                <div className="space-y-1 ml-2">
                  {Object.entries(metric.departmentWages || {})
                    .filter(([dept, wages]) => wages > 0)
                    .sort(([,a], [,b]) => b - a)
                    .map(([dept, wages]) => (
                      <div key={dept} className="flex justify-between">
                        <span className="text-gray-600">{dept}:</span>
                        <span className="ml-4">{formatCurrency(wages)}</span>
                      </div>
                    ))}
                </div>
                <div className="mt-2 pt-2 border-t flex justify-between font-medium">
                  <span>Total Wages:</span>
                  <span>{formatCurrency(metric.totalWages || 0)}</span>
                </div>
                <div className="mt-1 text-gray-600">
                  <span>Total Revenue:</span>
                  <span className="ml-2">{formatCurrency(metric.revenue || 0)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Chart wrapper with expand button
  const ChartWrapper = ({ title, description, children, showRollingToggle = false }) => {
    const handleExpand = () => {
      setExpandedChart({
        title,
        description,
        content: children
      });
    };
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-4">
            {showRollingToggle && (
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-gray-800">
                <input
                  type="checkbox"
                  checked={showRollingAverage}
                  onChange={(e) => setShowRollingAverage(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600">6-Month Rolling Average</span>
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
            {description}
          </div>
        )}
      </div>
    );
  };

  // Show loading state while data is being fetched
  if (isLoading || !data) {
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
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
        <div className="px-6 flex gap-4 border-t bg-white">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('dataEntry')}
            className={`py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'dataEntry' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            P&L Data Entry
          </button>
          <button
            onClick={() => setActiveTab('balanceSheet')}
            className={`py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'balanceSheet' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Balance Sheet
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(calculateMetrics.reduce((sum, m) => sum + m.revenue, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500 flex-shrink-0" />
                </div>
                {selectedRegion === 'All' && selectedDepartment === 'All' && (
                  <div className="mt-2 pt-2 border-t text-[11px] text-gray-600 space-y-1 max-h-36 overflow-y-auto">
                    <div>
                    <div className="text-[10px] uppercase tracking-wide font-bold mb-0.5">By Region:</div>
                      {regions.map(region => {
                        const regionRevenue = calculateMetrics.reduce((sum, metric) => {
                          let monthRevenue = 0;
                          allMonths.filter(m => m >= startMonth && m <= endMonth).forEach(month => {
                            if (month === metric.month) {
                              departments.forEach(dept => {
                                if (data && data[region] && data[region][dept] && data[region][dept][month]) {
                                  monthRevenue += data[region][dept][month].revenue || 0;
                                }
                              });
                            }
                          });
                          return sum + monthRevenue;
                        }, 0);
                        return (
                          <div key={region} className="flex justify-between ml-2 text-[10px]">
                            <span className="text-gray-600">{region}:</span>
                            <span className="font-medium">{formatCurrency(regionRevenue)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div>
                    <div className="text-[10px] uppercase tracking-wide font-bold mb-0.5 mt-1">By Department:</div>
                      {departments.map(dept => {
                        const deptRevenue = calculateMetrics.reduce((sum, metric) => {
                          let monthRevenue = 0;
                          allMonths.filter(m => m >= startMonth && m <= endMonth).forEach(month => {
                            if (month === metric.month) {
                              regions.forEach(region => {
                                if (data && data[region] && data[region][dept] && data[region][dept][month]) {
                                  monthRevenue += data[region][dept][month].revenue || 0;
                                }
                              });
                            }
                          });
                          return sum + monthRevenue;
                        }, 0);
                        if (deptRevenue > 0) {
                          return (
                            <div key={dept} className="flex justify-between ml-2 text-[10px]">
                              <span className="text-gray-600">{dept}:</span>
                              <span className="font-medium">{formatCurrency(deptRevenue)}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Avg Gross Margin</p>
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercent(
                      calculateMetrics.reduce((sum, m) => sum + m.grossMargin, 0) / 
                      calculateMetrics.filter(m => m.grossMargin > 0).length || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Revenue - COGS) / Revenue
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    ({formatCurrency(calculateMetrics.reduce((sum, m) => sum + m.revenue, 0))} - {formatCurrency(calculateMetrics.reduce((sum, m) => sum + m.cogs, 0))}) / {formatCurrency(calculateMetrics.reduce((sum, m) => sum + m.revenue, 0))}
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Total Net Income</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(calculateMetrics.reduce((sum, m) => sum + m.netIncome, 0))}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      NI %: {formatPercent(
                        calculateMetrics.reduce((sum, m) => sum + m.revenue, 0) > 0
                          ? (calculateMetrics.reduce((sum, m) => sum + m.netIncome, 0) / 
                             calculateMetrics.reduce((sum, m) => sum + m.revenue, 0)) * 100
                          : 0
                      )}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500 flex-shrink-0" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Avg Rev/Employee</p>
                    <Users className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      calculateMetrics.reduce((sum, m) => sum + m.revenuePerEmployee, 0) / 
                      calculateMetrics.filter(m => m.revenuePerEmployee > 0).length || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Revenue / Total Employees
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatCurrency(calculateMetrics.reduce((sum, m) => sum + m.revenue, 0))} / {
                      (() => {
                        let totalEmp = 0;
                        calculateMetrics.forEach(m => {
                          const monthTotal = m.revenue > 0 ? m.revenue / (m.revenuePerEmployee || 1) : 0;
                          if (monthTotal > 0) totalEmp += monthTotal;
                        });
                        return Math.round(totalEmp);
                      })()
                    } employees
                  </p>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue, Net Income & Gross Margin Chart */}
              <ChartWrapper 
                title="Revenue, Net Income & Gross Margin"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculateMetrics} margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} width={80} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'Revenue') return formatCurrency(value);
                      return formatPercent(value);
                    }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="netIncomePercent" stroke="#8b5cf6" name="Net Income %" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="grossMargin" stroke="#3b82f6" name="Gross Margin %" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrapper>
              
              {/* Maintenance Labor % Chart */}
              <ChartWrapper 
                title="Maintenance Direct Labor %"
                showRollingToggle={true}
                description={
                  <>
                    <p>Direct Labor as % of Revenue by Department (Target: 40%)</p>
                    <p className="text-xs mt-1">All Maintenance includes both Maintenance and Maintenance Onsite departments</p>
                    {selectedRegion === 'Company' && selectedDepartment === 'All' && (
                      <p className="text-xs mt-1 text-amber-600">
                        <strong>Note:</strong> This chart shows aggregated department data, not Company Total values
                      </p>
                    )}
                    {showRollingAverage && (
                      <p className="text-xs mt-1 text-blue-600">
                        <strong>Note:</strong> Showing 6-month rolling averages - lines are solid to indicate smoothed data
                      </p>
                    )}
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `${value}%`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'Direct Labor Headcount') return Math.round(value);
                      const formattedValue = formatPercent(value);
                      return showRollingAverage && name !== 'Target (40%)' ? `${formattedValue} (6m avg)` : formattedValue;
                    }} />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type={showRollingAverage ? "monotone" : "monotone"} 
                      dataKey={showRollingAverage ? "maintOnlyDirectLaborPercentRolling" : "maintOnlyDirectLaborPercent"} 
                      stroke="#3b82f6" 
                      name="Maintenance DL %" 
                      strokeWidth={showRollingAverage ? 3 : 2} 
                      strokeDasharray={showRollingAverage ? "0" : "5 5"} 
                    />
                    <Line 
                      yAxisId="left" 
                      type={showRollingAverage ? "monotone" : "monotone"} 
                      dataKey={showRollingAverage ? "maintOnsiteDirectLaborPercentRolling" : "maintOnsiteDirectLaborPercent"} 
                      stroke="#f97316" 
                      name="Maintenance Onsite DL %" 
                      strokeWidth={showRollingAverage ? 3 : 2} 
                      strokeDasharray={showRollingAverage ? "0" : "5 5"} 
                    />
                    <Line 
                      yAxisId="left" 
                      type={showRollingAverage ? "monotone" : "monotone"} 
                      dataKey={showRollingAverage ? "maintDirectLaborPercentRolling" : "maintDirectLaborPercent"} 
                      stroke="#10b981" 
                      name="All Maintenance DL %" 
                      strokeWidth={showRollingAverage ? 4 : 3} 
                      strokeDasharray={showRollingAverage ? "0" : "5 5"} 
                    />
                    <Line 
                      yAxisId="left"
                      dataKey={() => 40} 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      name="Target (40%)" 
                      dot={false}
                    />
                    <Line yAxisId="right" type="monotone" dataKey="directLaborHeadcount" stroke="#6b7280" name="Direct Labor Headcount" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrapper>
              
              {/* Vehicle Costs Chart */}
              <ChartWrapper 
                title="Vehicle Maintenance per Vehicle"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculateMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="vehicleMaintPerVehicle" stroke="#ef4444" name="Vehicle Maint/Repair per Vehicle" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrapper>
              
              {/* Revenue per Employee Chart */}
              <ChartWrapper 
                title="Revenue per Employee"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculateMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenuePerEmployee" stroke="#8b5cf6" name="Revenue per Employee" />
                    <Line type="monotone" dataKey="revenuePerDirect" stroke="#10b981" name="Revenue per Direct" />
                    <Line type="monotone" dataKey="revenuePerIndirect" stroke="#f59e0b" name="Revenue per Indirect" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrapper>
              
              {/* Indirect Personnel Costs % of Revenue Chart */}
              <ChartWrapper 
                title="Indirect Personnel Costs % of Revenue"
                description="Indirect Personnel Costs as % of Revenue with total indirect employee headcount"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculateMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `${value}%`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<IndirectCostsTooltip />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="employeeRelationsPercent" stroke="#06b6d4" name="Indirect Personnel Costs %" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="indirectHeadcount" stroke="#6b7280" name="Indirect Headcount" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrapper>
              
              {/* Maintenance to Plan Chart (2025 only) */}
              {calculateMetrics.some(m => m.month.startsWith('2025') && (m.maintRevenue > 0 || m.maintPlan > 0)) && (
                <ChartWrapper 
                  title="Maintenance Revenue vs Plan (2025)"
                  description={
                    selectedRegion === 'Company' && selectedDepartment === 'All' ? (
                      <p className="text-xs text-amber-600">
                        <strong>Note:</strong> This chart shows aggregated maintenance department revenues, not Company Total values
                      </p>
                    ) : null
                  }
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={calculateMetrics.filter(m => m.month.startsWith('2025'))} margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="maintRevenue" stroke="#10b981" name="Actual Maintenance Revenue" strokeWidth={2} />
                      <Line type="monotone" dataKey="maintPlan" stroke="#6b7280" strokeDasharray="5 5" name="Planned Revenue" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              )}
              
              {/* Extra Sales Revenue & % of Maintenance Chart */}
              <ChartWrapper 
                title="Extra Sales % of Maintenance Revenue"
                description={
                  <>
                    <p>Target: Extra Sales should be 120% of All Maintenance Revenue (includes Maintenance & Maintenance Onsite)</p>
                    <p className="text-xs mt-1">Note: Overhead department is excluded from this calculation</p>
                    {selectedRegion === 'Company' && selectedDepartment === 'All' && (
                      <p className="text-xs mt-1 text-amber-600">
                        <strong>Note:</strong> This chart shows aggregated department data, not Company Total values
                      </p>
                    )}
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={calculateMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 'auto']} tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      formatter={(value) => formatPercent(value)}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const deptData = payload.filter(p => p.dataKey !== 'targetLine' && p.name !== 'Target (120%)');
                          const metric = calculateMetrics.find(m => m.month === label);
                          const totalExtraSalesPercent = metric ? metric.extraSalesPercent : 0;
                          
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-medium text-sm mb-2">{label}</p>
                              {deptData.map((entry, index) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <span style={{ color: entry.color }}>{entry.name}:</span>
                                  <span className="ml-4">{formatPercent(entry.value)}</span>
                                </div>
                              ))}
                              <div className="border-t mt-2 pt-2 flex justify-between items-center text-xs font-medium">
                                <span>Total Extra Sales %:</span>
                                <span className={totalExtraSalesPercent >= 120 ? 'text-green-600' : 'text-red-600'}>
                                  {formatPercent(totalExtraSalesPercent)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                                <span>Target:</span>
                                <span>120%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="maintWOPercent" stackId="1" stroke="#ef4444" fill="#ef4444" name="Maintenance WO" />
                    <Area type="monotone" dataKey="arborPercent" stackId="1" stroke="#10b981" fill="#10b981" name="Arbor" />
                    <Area type="monotone" dataKey="enhancementsPercent" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Enhancements" />
                    <Area type="monotone" dataKey="irrigationPercent" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Irrigation" />
                    <Area type="monotone" dataKey="sprayPHCPercent" stackId="1" stroke="#f97316" fill="#f97316" name="Spray/PHC" />
                    <Line 
                      dataKey={() => 120} 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      name="Target (120%)" 
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartWrapper>
              
              {/* Reserves Composition Chart */}
              {balanceSheetData && (
                <ChartWrapper 
                  title="Cash Reserves & Months of Coverage"
                  description="Liquid reserves (Checking, Money Market, ST Treasuries) and months of operating expenses coverage"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={balanceSheetMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} width={80} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'Months of Coverage') return value.toFixed(1) + ' months';
                          return formatCurrency(value);
                        }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const metric = balanceSheetMetrics.find(m => m.month === label);
                            if (!metric) return null;
                            
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
                      <Bar yAxisId="left" dataKey="checking" stackId="1" fill="#3b82f6" name="Checking" />
                      <Bar yAxisId="left" dataKey="moneyMarket" stackId="1" fill="#10b981" name="Money Market" />
                      <Bar yAxisId="left" dataKey="stTreasuries" stackId="1" fill="#f59e0b" name="ST Treasuries" />
                      <Line yAxisId="right" type="monotone" dataKey="monthsOfExpensesCoverage" stroke="#8b5cf6" strokeWidth={3} name="Months of Coverage" />
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
                </ChartWrapper>
              )}
              
              {/* Debt to Equity Ratio Chart */}
              {balanceSheetData && (
                <ChartWrapper 
                  title="Balance Sheet Trends & Debt/Equity Ratio"
                  description="Assets, Liabilities, Equity trends with long-term debt to equity ratio"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={balanceSheetMetrics} margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} width={80} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'LT Debt/Equity Ratio') return value.toFixed(2);
                          return formatCurrency(value);
                        }}
                      />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="totalAssets" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Total Assets" />
                      <Area yAxisId="left" type="monotone" dataKey="totalLiabilities" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Total Liabilities" />
                      <Area yAxisId="left" type="monotone" dataKey="equity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total Equity" />
                      <Line yAxisId="right" type="monotone" dataKey="debtToEquity" stroke="#f59e0b" strokeWidth={3} name="LT Debt/Equity Ratio" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              )}
            </div>
          </div>
        ) : activeTab === 'balanceSheet' ? (
          <div className="space-y-6">
            {/* Balance Sheet Data Entry */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Balance Sheet Data Entry</h3>
              <p className="text-sm text-gray-600 mb-6">
                Enter consolidated balance sheet data for each month. All values are company-wide.
              </p>
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Note:</strong> Monthly Operating Expenses defaults to $1.6M per month but can be adjusted. 
                The "Months of Coverage" metric shows how many months your liquid reserves (Checking + Money Market + ST Treasuries) can cover operating expenses.
              </div>
            </div>
{/* Balance Sheet Entry Table */}
            {balanceSheetData && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h4 className="font-medium text-gray-900">Monthly Balance Sheet Data</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing months from {startMonth} to {endMonth} - All values are company-wide
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <div className="overflow-y-auto max-h-[600px]">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="bg-white shadow-sm">
                        <th className="sticky left-0 z-20 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300 border-r">Month</th>
                        <th colSpan="6" className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-gray-100 border-b-2 border-gray-300">
                          Current Assets
                        </th>
                        <th colSpan="2" className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-white border-b-2 border-gray-300">
                          Fixed & Other Assets
                        </th>
                        <th colSpan="3" className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-gray-100 border-b-2 border-gray-300">
                          Current Liabilities
                        </th>
                        <th colSpan="3" className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-white border-b-2 border-gray-300">
                          Long Term Liabilities
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-gray-100 border-b-2 border-gray-300">
                          Equity
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase bg-white border-b-2 border-gray-300">
                          Monthly Exp
                        </th>
                      </tr>
                      <tr className="bg-white">
                        <th className="sticky left-0 z-20 px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-white border-b border-gray-300 border-r"></th>
                        {/* Current Assets */}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Checking</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Money Market</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">ST Treasuries</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Payroll</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">A/R</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Other Current</th>
                        {/* Fixed & Other Assets */}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">Fixed Assets</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">Other Assets</th>
                        {/* Current Liabilities */}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">A/P</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Credit Cards</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Other Current</th>
                        {/* Long Term Liabilities */}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">Ford Vehicles</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">MidFirst Loans</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">SBA EIDL</th>
                        {/* Equity */}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 border-b border-gray-300">Total Equity</th>
                        {/* Monthly Expenses */}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap border-b border-gray-300">Operating Exp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allMonths.filter(month => month >= startMonth && month <= endMonth).map((month) => (
                        <tr key={month} className="hover:bg-gray-50 group">
                          <td className="sticky left-0 z-10 px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap bg-white group-hover:bg-gray-50 border-r">
                            {month}
                          </td>
                          {/* Current Assets */}
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.checking)}
                              onChange={(e) => updateBalanceSheetData(month, 'checking', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.moneyMarket)}
                              onChange={(e) => updateBalanceSheetData(month, 'moneyMarket', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.stTreasuries)}
                              onChange={(e) => updateBalanceSheetData(month, 'stTreasuries', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.payroll)}
                              onChange={(e) => updateBalanceSheetData(month, 'payroll', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.accountsReceivable)}
                              onChange={(e) => updateBalanceSheetData(month, 'accountsReceivable', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.otherCurrentAssets)}
                              onChange={(e) => updateBalanceSheetData(month, 'otherCurrentAssets', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          {/* Fixed & Other Assets */}
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.fixedAssets)}
                              onChange={(e) => updateBalanceSheetData(month, 'fixedAssets', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.otherAssets)}
                              onChange={(e) => updateBalanceSheetData(month, 'otherAssets', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          {/* Current Liabilities */}
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.accountsPayable)}
                              onChange={(e) => updateBalanceSheetData(month, 'accountsPayable', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.creditCards)}
                              onChange={(e) => updateBalanceSheetData(month, 'creditCards', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.otherCurrentLiabilities)}
                              onChange={(e) => updateBalanceSheetData(month, 'otherCurrentLiabilities', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          {/* Long Term Liabilities */}
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.fordVehicles)}
                              onChange={(e) => updateBalanceSheetData(month, 'fordVehicles', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.midfirstLoans)}
                              onChange={(e) => updateBalanceSheetData(month, 'midfirstLoans', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.sbaEidlLoan)}
                              onChange={(e) => updateBalanceSheetData(month, 'sbaEidlLoan', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          {/* Equity */}
                          <td className="px-4 py-2 bg-gray-50">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(balanceSheetData[month]?.equity)}
                              onChange={(e) => updateBalanceSheetData(month, 'equity', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          {/* Monthly Operating Expenses */}
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$1,600,000"
                              value={getFormattedValue(balanceSheetData[month]?.monthlyOperatingExpenses)}
                              onChange={(e) => updateBalanceSheetData(month, 'monthlyOperatingExpenses', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-blue-50 border-t">
                  <p className="text-sm text-blue-800">
                    <strong>Tips:</strong> 
                    <br />• Liquid Reserves (Checking + Money Market + ST Treasuries) are tracked against monthly operating expenses
                    <br />• Target: Maintain at least 3 months of operating expenses in liquid reserves
                    <br />• Long-term liabilities are broken down by specific loans (Ford, MidFirst, SBA EIDL)
                    <br />• Monthly Operating Expenses default to $1.6M but can be adjusted per month
                    <br />• Data is automatically saved as you type
                  </p>
                </div>
              </div>
            )}
            
            {/* Balance Sheet Summary */}
            {balanceSheetData && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="font-medium text-gray-900 mb-4">Balance Sheet Summary - Last 3 Months</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Month</th>
                        <th className="text-right py-2 font-medium">Total Assets</th>
                        <th className="text-right py-2 font-medium">Total Liabilities</th>
                        <th className="text-right py-2 font-medium">Total Equity</th>
                        <th className="text-right py-2 font-medium">Liquid Reserves</th>
                        <th className="text-right py-2 font-medium">Months Coverage</th>
                        <th className="text-right py-2 font-medium">LT Debt/Equity</th>
                        <th className="text-right py-2 font-medium">Current Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetMetrics.slice(-3).map((metric) => (
                        <tr key={metric.month} className="border-b">
                          <td className="py-2">{metric.month}</td>
                          <td className="text-right py-2">{formatCurrency(metric.totalAssets)}</td>
                          <td className="text-right py-2">{formatCurrency(metric.totalLiabilities)}</td>
                          <td className="text-right py-2">{formatCurrency(metric.equity)}</td>
                          <td className="text-right py-2">{formatCurrency(metric.liquidReserves)}</td>
                          <td className={`text-right py-2 ${
                            metric.monthsOfExpensesCoverage >= 3 ? 'text-green-600' : 
                            metric.monthsOfExpensesCoverage >= 1 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {metric.monthsOfExpensesCoverage.toFixed(1)}
                          </td>
                          <td className="text-right py-2">{metric.debtToEquity.toFixed(2)}</td>
                          <td className="text-right py-2">{metric.currentRatio.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Data Entry Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">P&L Data Entry</h3>
              <p className="text-sm text-gray-600 mb-6">Select a region and department to enter Profit & Loss data. Choose "Company" as the region to enter company-wide consolidated P&L data by department (separate from individual region data).</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select 
                  value={dataEntryRegion}
                  onChange={(e) => {
                    setDataEntryRegion(e.target.value);
                    setDataEntryDept('');
                  }}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Select Region</option>
                  <option value="Company">Company (Consolidated)</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                
                {dataEntryRegion !== 'Company' && (
                  <select 
                    value={dataEntryDept}
                    onChange={(e) => setDataEntryDept(e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {dataEntryRegion === 'Company' && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Company Data Entry:</strong> Enter data for each department below. All departments are shown for easy data entry.
                    The "Company Total" section can be used to record high-level company totals for reference.
                  </p>
                </div>
              )}
            </div>

            {/* Company-wide Data Entry - Show all departments */}
            {dataEntryRegion === 'Company' && (
              <div className="space-y-4">
                {/* Company Total - High Level P&L Entry */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div 
                    className="px-6 py-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
                    onClick={() => toggleDepartment('Company Total')}
                  >
                    <div className="flex items-center gap-2">
                      {expandedDepartments['Company Total'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      <h4 className="font-medium text-gray-900">Company Total (High-Level P&L)</h4>
                    </div>
                    <span className="text-sm text-gray-600">
                      Used for Company Consolidated view
                    </span>
                  </div>
                  
                  {expandedDepartments['Company Total'] && (
                    <div className="px-6 pb-4">
                      <div className="mb-4 p-3 bg-green-50 rounded">
                        <p className="text-sm text-green-800">
                          <strong>Note:</strong> This section is for recording high-level company P&L data. 
                          When viewing "Company (Consolidated)" with "All Departments" in the dashboard, 
                          charts will use this data instead of aggregating department data.
                        </p>
                      </div>
                      <div className="overflow-x-auto overflow-y-auto max-h-[400px] border rounded-lg">
                        <table className="min-w-max w-full">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr className="bg-white shadow-sm">
                              <th className="sticky left-0 z-20 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300 border-r">Month</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Revenue</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">COGS</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Net Income</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Total Employees</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Direct</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Indirect</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Vehicles</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Vehicle Costs</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Indirect Personnel Costs</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {allMonths.filter(month => month >= startMonth && month <= endMonth).map((month) => (
                              <tr key={month} className="hover:bg-gray-50 group">
                                <td className="sticky left-0 z-10 px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap bg-white group-hover:bg-gray-50 border-r">
                                  {month}
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    className="w-24 border rounded px-2 py-1 text-sm"
                                    placeholder="$0"
                                    value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.revenue)}
                                    onChange={(e) => updateData('Company', 'Company Total', month, 'revenue', parseCurrencyInput(e.target.value))}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    className="w-24 border rounded px-2 py-1 text-sm"
                                    placeholder="$0"
                                    value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.cogs)}
                                    onChange={(e) => updateData('Company', 'Company Total', month, 'cogs', parseCurrencyInput(e.target.value))}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    className="w-24 border rounded px-2 py-1 text-sm"
                                    placeholder="$0"
                                    value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.netIncome)}
                                    onChange={(e) => updateData('Company', 'Company Total', month, 'netIncome', parseCurrencyInput(e.target.value))}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    className="w-16 border rounded px-2 py-1 text-sm"
                                    placeholder="1"
                                    value={data['Company']?.['Company Total']?.[month]?.totalEmployees || ''}
                                    onChange={(e) => updateData('Company', 'Company Total', month, 'totalEmployees', e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    className="w-16 border rounded px-2 py-1 text-sm"
                                    placeholder="1"
                                    value={data['Company']?.['Company Total']?.[month]?.directEmployees || ''}
                                    onChange={(e) => updateData('Company', 'Company Total', month, 'directEmployees', e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    className="w-16 border rounded px-2 py-1 text-sm"
                                    placeholder="0"
                                    value={data['Company']?.['Company Total']?.[month]?.indirectEmployees || ''}
                                    onChange={(e) => updateData('Company', 'Company Total', month, 'indirectEmployees', e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    className="w-16 border rounded px-2 py-1 text-sm"
                                    placeholder="1"
                                    value={data['Company']?.['Company Total']?.[month]?.activeVehicles || ''}
                                    onChange={(e) => updateData('Company', 'Company Total', month, 'activeVehicles', e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    className="w-24 border rounded px-2 py-1 text-sm"
                                    placeholder="$0"
                                    value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.totalVehicleRepairMaint)}
                                    onChange={(e) => updateData('Company', 'Company Total', month, 'totalVehicleRepairMaint', parseCurrencyInput(e.target.value))}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    className="w-24 border rounded px-2 py-1 text-sm"
                                    placeholder="$0"
                                    value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.wages)}
                                    onChange={(e) => updateData('Company', 'Company Total', month, 'wages', parseCurrencyInput(e.target.value))}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Regular Department Entries */}
                {departments.map(dept => (
                  <div key={dept} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div 
                      className="px-6 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                      onClick={() => toggleDepartment(dept)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedDepartments[dept] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        <h4 className="font-medium text-gray-900">{dept}</h4>
                      </div>
                      <span className="text-sm text-gray-600">
                        Total Revenue: {formatCurrency(
                          allMonths.filter(month => month >= startMonth && month <= endMonth)
                            .reduce((sum, month) => sum + (data['Company']?.[dept]?.[month]?.revenue || 0), 0)
                        )}
                      </span>
                    </div>
                    
                    {expandedDepartments[dept] && (
                      <div className="px-6 pb-4">
                        <div className="overflow-x-auto overflow-y-auto max-h-[400px] border rounded-lg">
                          <table className="min-w-max w-full">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr className="bg-white shadow-sm">
                                <th className="sticky left-0 z-20 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300 border-r">Month</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Revenue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">COGS</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Net Income</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Maint Labor Cost</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Total Employees</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Direct</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Indirect</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Vehicles</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Vehicle Costs</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Indirect Personnel Costs</th>
                                {allMonths.filter(month => month >= startMonth && month <= endMonth).some(month => month.startsWith('2025')) && maintenanceDepartments.includes(dept) && (
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Planned Revenue</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {allMonths.filter(month => month >= startMonth && month <= endMonth).map((month) => (
                                <tr key={month} className="hover:bg-gray-50 group">
                                  <td className="sticky left-0 z-10 px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap bg-white group-hover:bg-gray-50 border-r">
                                    {month}
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      className="w-24 border rounded px-2 py-1 text-sm"
                                      placeholder="$0"
                                      value={getFormattedValue(data['Company']?.[dept]?.[month]?.revenue)}
                                      onChange={(e) => updateData('Company', dept, month, 'revenue', parseCurrencyInput(e.target.value))}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      className="w-24 border rounded px-2 py-1 text-sm"
                                      placeholder="$0"
                                      value={getFormattedValue(data['Company']?.[dept]?.[month]?.cogs)}
                                      onChange={(e) => updateData('Company', dept, month, 'cogs', parseCurrencyInput(e.target.value))}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      className="w-24 border rounded px-2 py-1 text-sm"
                                      placeholder="$0"
                                      value={getFormattedValue(data['Company']?.[dept]?.[month]?.netIncome)}
                                      onChange={(e) => updateData('Company', dept, month, 'netIncome', parseCurrencyInput(e.target.value))}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      className="w-24 border rounded px-2 py-1 text-sm"
                                      placeholder="$0"
                                      value={getFormattedValue(data['Company']?.[dept]?.[month]?.maintDirectLaborCost)}
                                      onChange={(e) => updateData('Company', dept, month, 'maintDirectLaborCost', parseCurrencyInput(e.target.value))}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      className="w-16 border rounded px-2 py-1 text-sm"
                                      placeholder="1"
                                      value={data['Company']?.[dept]?.[month]?.totalEmployees || ''}
                                      onChange={(e) => updateData('Company', dept, month, 'totalEmployees', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      className="w-16 border rounded px-2 py-1 text-sm"
                                      placeholder="1"
                                      value={data['Company']?.[dept]?.[month]?.directEmployees || ''}
                                      onChange={(e) => updateData('Company', dept, month, 'directEmployees', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      className="w-16 border rounded px-2 py-1 text-sm"
                                      placeholder="0"
                                      value={data['Company']?.[dept]?.[month]?.indirectEmployees || ''}
                                      onChange={(e) => updateData('Company', dept, month, 'indirectEmployees', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      className="w-16 border rounded px-2 py-1 text-sm"
                                      placeholder="1"
                                      value={data['Company']?.[dept]?.[month]?.activeVehicles || ''}
                                      onChange={(e) => updateData('Company', dept, month, 'activeVehicles', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      className="w-24 border rounded px-2 py-1 text-sm"
                                      placeholder="$0"
                                      value={getFormattedValue(data['Company']?.[dept]?.[month]?.totalVehicleRepairMaint)}
                                      onChange={(e) => updateData('Company', dept, month, 'totalVehicleRepairMaint', parseCurrencyInput(e.target.value))}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      className="w-24 border rounded px-2 py-1 text-sm"
                                      placeholder="$0"
                                      value={getFormattedValue(data['Company']?.[dept]?.[month]?.wages)}
                                      onChange={(e) => updateData('Company', dept, month, 'wages', parseCurrencyInput(e.target.value))}
                                    />
                                  </td>
                                  {month.startsWith('2025') && maintenanceDepartments.includes(dept) ? (
                                    <td className="px-4 py-2">
                                      <input
                                        type="text"
                                        className="w-24 border rounded px-2 py-1 text-sm"
                                        placeholder="$0"
                                        value={getFormattedValue(data['Company']?.[dept]?.[month]?.maintenancePlan2025)}
                                        onChange={(e) => updateData('Company', dept, month, 'maintenancePlan2025', parseCurrencyInput(e.target.value))}
                                      />
                                    </td>
                                  ) : (allMonths.filter(month => month >= startMonth && month <= endMonth).some(month => month.startsWith('2025')) && maintenanceDepartments.includes(dept)) ? (
                                    <td className="px-4 py-2 bg-gray-50"></td>
                                  ) : null}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Summary section for Company data */}
                {data && data['Company'] && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Company Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Maintenance Departments</h5>
                        <div className="space-y-1">
                          {maintenanceDepartments.map(dept => (
                            <div key={dept} className="flex justify-between text-sm">
                              <span className="text-gray-600">{dept}:</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  allMonths.filter(month => month >= startMonth && month <= endMonth)
                                    .reduce((sum, month) => sum + (data['Company']?.[dept]?.[month]?.revenue || 0), 0)
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total Maintenance:</span>
                            <span className="text-blue-600">
                              {formatCurrency(
                                allMonths.filter(month => month >= startMonth && month <= endMonth)
                                  .reduce((sum, month) => {
                                    let maintTotal = 0;
                                    maintenanceDepartments.forEach(dept => {
                                      maintTotal += data['Company']?.[dept]?.[month]?.revenue || 0;
                                    });
                                    return sum + maintTotal;
                                  }, 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Extra Sales Departments</h5>
                        <div className="space-y-1">
                          {extraSalesDepartments.map(dept => (
                            <div key={dept} className="flex justify-between text-sm">
                              <span className="text-gray-600">{dept}:</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  allMonths.filter(month => month >= startMonth && month <= endMonth)
                                    .reduce((sum, month) => sum + (data['Company']?.[dept]?.[month]?.revenue || 0), 0)
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total Extra Sales:</span>
                            <span className="text-green-600">
                              {formatCurrency(
                                allMonths.filter(month => month >= startMonth && month <= endMonth)
                                  .reduce((sum, month) => {
                                    let extraTotal = 0;
                                    extraSalesDepartments.forEach(dept => {
                                      extraTotal += data['Company']?.[dept]?.[month]?.revenue || 0;
                                    });
                                    return sum + extraTotal;
                                  }, 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Overhead Department</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Revenue:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                allMonths.filter(month => month >= startMonth && month <= endMonth)
                                  .reduce((sum, month) => sum + (data['Company']?.['Overhead']?.[month]?.revenue || 0), 0)
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Net Income Impact:</span>
                            <span className="font-medium text-red-600">
                              {formatCurrency(
                                allMonths.filter(month => month >= startMonth && month <= endMonth)
                                  .reduce((sum, month) => sum + (data['Company']?.['Overhead']?.[month]?.netIncome || 0), 0)
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Indirect HC:</span>
                            <span className="font-medium">
                              {Math.round(
                                allMonths.filter(month => month >= startMonth && month <= endMonth)
                                  .reduce((sum, month) => sum + (data['Company']?.['Overhead']?.[month]?.indirectEmployees || 0), 0) /
                                allMonths.filter(month => month >= startMonth && month <= endMonth).length
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Vehicles:</span>
                            <span className="font-medium">
                              {Math.round(
                                allMonths.filter(month => month >= startMonth && month <= endMonth)
                                  .reduce((sum, month) => sum + (data['Company']?.['Overhead']?.[month]?.activeVehicles || 0), 0) /
                                allMonths.filter(month => month >= startMonth && month <= endMonth).length
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Company Revenue:</span>
                        <span className="text-lg font-semibold">
                          {formatCurrency(
                            allMonths.filter(month => month >= startMonth && month <= endMonth)
                              .reduce((sum, month) => {
                                let monthTotal = 0;
                                departments.forEach(dept => {
                                  monthTotal += data['Company']?.[dept]?.[month]?.revenue || 0;
                                });
                                return sum + monthTotal;
                              }, 0)
                          )}
                        </span>
                      </div>
                      {data['Company']['Company Total'] && calculateMetrics.some(m => data['Company']['Company Total'][m.month]?.revenue > 0) && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Company Total (High-Level P&L):</strong> {formatCurrency(
                            allMonths.filter(month => month >= startMonth && month <= endMonth)
                              .reduce((sum, month) => sum + (data['Company']['Company Total'][month]?.revenue || 0), 0)
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Regular Data Entry Table - Only show if region and department are selected */}
            {dataEntryRegion && dataEntryDept && dataEntryRegion !== 'Company' && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h4 className="font-medium text-gray-900">Monthly Data Entry: {dataEntryRegion} - {dataEntryDept}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing months from {startMonth} to {endMonth}
                  </p>
                </div>
                
                <div className="relative" style={{ height: '600px' }}>
                  <div className="overflow-auto h-full" style={{ position: 'relative' }}>
                    <table className="w-full">
                      <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                        <tr className="bg-white shadow-sm">
                          <th style={{ position: 'sticky', left: 0, zIndex: 30 }} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Month</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Revenue</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">COGS</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Net Income</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Maint Labor Cost</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Total Employees</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Direct</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Indirect</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Vehicles</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Vehicle Costs</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Indirect Personnel Costs</th>
                          {allMonths.filter(month => month >= startMonth && month <= endMonth).some(month => month.startsWith('2025')) && maintenanceDepartments.includes(dataEntryDept) && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Planned Revenue</th>
                          )}
                        </tr>
                      </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allMonths.filter(month => month >= startMonth && month <= endMonth).map((month) => (
                        <tr key={month} className="hover:bg-gray-50 group">
                          <td style={{ position: 'sticky', left: 0, zIndex: 10 }} className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap bg-white group-hover:bg-gray-50 border-r">
                            {month}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(data[dataEntryRegion]?.[dataEntryDept]?.[month]?.revenue)}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'revenue', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(data[dataEntryRegion]?.[dataEntryDept]?.[month]?.cogs)}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'cogs', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(data[dataEntryRegion]?.[dataEntryDept]?.[month]?.netIncome)}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'netIncome', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(data[dataEntryRegion]?.[dataEntryDept]?.[month]?.maintDirectLaborCost)}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'maintDirectLaborCost', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              className="w-16 border rounded px-2 py-1 text-sm"
                              placeholder="1"
                              value={data[dataEntryRegion]?.[dataEntryDept]?.[month]?.totalEmployees || ''}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'totalEmployees', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              className="w-16 border rounded px-2 py-1 text-sm"
                              placeholder="1"
                              value={data[dataEntryRegion]?.[dataEntryDept]?.[month]?.directEmployees || ''}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'directEmployees', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              className="w-16 border rounded px-2 py-1 text-sm"
                              placeholder="0"
                              value={data[dataEntryRegion]?.[dataEntryDept]?.[month]?.indirectEmployees || ''}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'indirectEmployees', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              className="w-16 border rounded px-2 py-1 text-sm"
                              placeholder="1"
                              value={data[dataEntryRegion]?.[dataEntryDept]?.[month]?.activeVehicles || ''}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'activeVehicles', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(data[dataEntryRegion]?.[dataEntryDept]?.[month]?.totalVehicleRepairMaint)}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'totalVehicleRepairMaint', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(data[dataEntryRegion]?.[dataEntryDept]?.[month]?.wages)}
                              onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'wages', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          {month.startsWith('2025') && maintenanceDepartments.includes(dataEntryDept) ? (
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                className="w-24 border rounded px-2 py-1 text-sm"
                                placeholder="$0"
                                value={getFormattedValue(data[dataEntryRegion]?.[dataEntryDept]?.[month]?.maintenancePlan2025)}
                                onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'maintenancePlan2025', parseCurrencyInput(e.target.value))}
                              />
                            </td>
                          ) : (allMonths.filter(month => month >= startMonth && month <= endMonth).some(month => month.startsWith('2025')) && maintenanceDepartments.includes(dataEntryDept)) ? (
                            <td className="px-4 py-2 bg-gray-50"></td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
                
                <div className="px-6 py-4 bg-blue-50 border-t">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Data is automatically saved as you type. Use the date range filters at the top to control which months are displayed. The dashboard will automatically calculate all derived metrics. For Maintenance departments, you can enter 2025 Planned Revenue values for budget comparison.
                    {dataEntryRegion === 'Company' && (
                      <span> <strong>Company Region:</strong> Enter consolidated company-wide data by department. This data is separate from individual region data and useful for quick high-level entry.</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Chart Modal - rendered via portal */}
      {expandedChart && <ChartModal chart={expandedChart} onClose={() => setExpandedChart(null)} />}
    </div>
  );
};

export default FinancialDashboard;