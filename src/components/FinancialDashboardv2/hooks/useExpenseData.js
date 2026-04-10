// src/components/FinancialDashboardv2/hooks/useExpenseData.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { allMonths, defaultExpenseData } from '../constants';

export const useExpenseData = () => {
  const [expenseData, setExpenseData] = useState(() => {
    // Initialize with default data for all months
    const initialData = {};
    allMonths.forEach(month => {
      initialData[month] = { ...defaultExpenseData };
    });
    return initialData;
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef(null);

  // Load expense data from Supabase
  const loadExpenseDataFromSupabase = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('expense_categories')
        .select('*');
      
      if (error && error.code !== 'PGRST116') throw error; // Ignore table not found error
      
      // Start with initialized data
      const newExpenseData = {};
      allMonths.forEach(month => {
        newExpenseData[month] = { ...defaultExpenseData };
      });
      
      // Populate from database if data exists
      if (dbData && dbData.length > 0) {
        dbData.forEach(row => {
          if (newExpenseData[row.month]) {
            newExpenseData[row.month] = {
              cogsLabor: parseFloat(row.cogs_labor) || 0,
              cogsMaterial: parseFloat(row.cogs_material) || 0,
              indirectJobSupplies: parseFloat(row.indirect_job_supplies) || 0,
              vehicleExpenses: parseFloat(row.vehicle_expenses) || 0,
              equipmentExpenses: parseFloat(row.equipment_expenses) || 0,
              facilitiesExpenses: parseFloat(row.facilities_expenses) || 0,
              technologyExpenses: parseFloat(row.technology_expenses) || 0,
              officeExpenses: parseFloat(row.office_expenses) || 0,
              travel: parseFloat(row.travel) || 0,
              operationalSupport: parseFloat(row.operational_support) || 0,
              insurance: parseFloat(row.insurance) || 0,
              advertisingMarketing: parseFloat(row.advertising_marketing) || 0,
              bankCharges: parseFloat(row.bank_charges) || 0,
              outsourcedServices: parseFloat(row.outsourced_services) || 0,
              indirectPayrollCosts: parseFloat(row.indirect_payroll_costs) || 0,
              otherIncomeExpenses: parseFloat(row.other_income_expenses) || 0
            };
          }
        });
      }
      
      setExpenseData(newExpenseData);
    } catch (error) {
      console.error('Error loading expense data:', error);
      // Initialize with default data on error
      const newExpenseData = {};
      allMonths.forEach(month => {
        newExpenseData[month] = { ...defaultExpenseData };
      });
      setExpenseData(newExpenseData);
    }
  };

  // Save expense data to Supabase
  const saveExpenseDataToSupabase = useCallback(async (month, data) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('expense_categories')
        .upsert({
          month,
          cogs_labor: data.cogsLabor,
          cogs_material: data.cogsMaterial,
          indirect_job_supplies: data.indirectJobSupplies,
          vehicle_expenses: data.vehicleExpenses,
          equipment_expenses: data.equipmentExpenses,
          facilities_expenses: data.facilitiesExpenses,
          technology_expenses: data.technologyExpenses,
          office_expenses: data.officeExpenses,
          travel: data.travel,
          operational_support: data.operationalSupport,
          insurance: data.insurance,
          advertising_marketing: data.advertisingMarketing,
          bank_charges: data.bankCharges,
          outsourced_services: data.outsourcedServices,
          indirect_payroll_costs: data.indirectPayrollCosts,
          other_income_expenses: data.otherIncomeExpenses,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'month'
        });
      
      if (error) {
        console.error('Expense data save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving expense data:', error);
      alert(`Failed to save expense data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update expense data
  const updateExpenseData = (month, field, value) => {
    setExpenseData(prev => {
      const newData = { ...prev };
      if (!newData[month]) {
        newData[month] = { ...defaultExpenseData };
      }
      
      newData[month][field] = parseFloat(value) || 0;
      
      // Clear existing timer
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      // Set new timer to save after 1 second of inactivity
      saveTimerRef.current = setTimeout(() => {
        saveExpenseDataToSupabase(month, newData[month]);
      }, 1000);
      
      return newData;
    });
  };

  // Calculate totals for a given month range
  const calculateExpenseTotals = useCallback((startMonth, endMonth) => {
    const filteredMonths = allMonths.filter(month => month >= startMonth && month <= endMonth);
    const totals = { ...defaultExpenseData };
    
    filteredMonths.forEach(month => {
      const monthData = expenseData[month] || defaultExpenseData;
      Object.keys(totals).forEach(key => {
        totals[key] += monthData[key];
      });
    });
    
    return totals;
  }, [expenseData]);

  // Load data on mount
  useEffect(() => {
    loadExpenseDataFromSupabase();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return {
    expenseData,
    updateExpenseData,
    calculateExpenseTotals,
    isSaving
  };
};