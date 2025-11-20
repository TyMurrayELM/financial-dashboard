// src/components/FinancialDashboard/hooks/useFinancialData.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { getInitialData } from '../utils/dataHelpers';
import { defaultMonthData } from '../constants';

export const useFinancialData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveTimer, setSaveTimer] = useState(null);

  // Check Supabase connection
  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_data')
        .select('count', { count: 'exact', head: true });
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
              maintDirectLaborCostOnsites: parseFloat(row.maint_direct_labor_cost_onsites) || 0,
              totalVehicleRepairMaint: parseFloat(row.total_vehicle_repair_maint) || 0,
              activeVehicles: parseInt(row.active_vehicles) || 1,
              netIncome: parseFloat(row.net_income) || 0,
              totalEmployees: parseInt(row.total_employees) || 1,
              indirectEmployees: parseInt(row.indirect_employees) || 0,
              directEmployees: parseInt(row.direct_employees) || 1,
              wages: parseFloat(row.wages) || 0,
              benefits: 0, // Default to 0 since column removed
              employeeMealsAppreciation: 0, // Default to 0 since column removed
              maintenancePlan2025: parseFloat(row.maintenance_plan_2025) || 0,
              maintenanceOnsitePlan2025: parseFloat(row.maintenance_onsite_plan_2025) || 0,
              maintenanceForecast2025: parseFloat(row.maintenance_forecast_2025) || 0,
              maintenanceOnsiteForecast2025: parseFloat(row.maintenance_onsite_forecast_2025) || 0
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
          maint_direct_labor_cost_onsites: fieldData.maintDirectLaborCostOnsites,
          total_vehicle_repair_maint: fieldData.totalVehicleRepairMaint,
          active_vehicles: fieldData.activeVehicles,
          net_income: fieldData.netIncome,
          total_employees: fieldData.totalEmployees,
          indirect_employees: fieldData.indirectEmployees,
          direct_employees: fieldData.directEmployees,
          wages: fieldData.wages,
          maintenance_plan_2025: fieldData.maintenancePlan2025,
          maintenance_onsite_plan_2025: fieldData.maintenanceOnsitePlan2025,
          maintenance_forecast_2025: fieldData.maintenanceForecast2025,
          maintenance_onsite_forecast_2025: fieldData.maintenanceOnsiteForecast2025,
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

  // Handle data update with automatic saving
  const updateData = (region, dept, month, field, value) => {
    // Update local state immediately
    setData(prev => {
      const newData = { ...prev };
      
      // Ensure the structure exists
      if (!newData[region]) newData[region] = {};
      if (!newData[region][dept]) newData[region][dept] = {};
      if (!newData[region][dept][month]) {
        newData[region][dept][month] = { ...defaultMonthData };
      }
      
      // Update the specific field
      newData[region][dept][month][field] = field === 'totalEmployees' || field === 'indirectEmployees' || field === 'directEmployees' || field === 'activeVehicles' 
        ? parseInt(value) || 0 
        : parseFloat(value) || 0;
      
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

  // Load data on mount
  useEffect(() => {
    loadDataFromSupabase();
    checkConnection();
  }, []);

  return {
    data,
    isLoading,
    isConnected,
    isSaving,
    lastSaved,
    updateData,
    loadDataFromSupabase,
    checkConnection
  };
};