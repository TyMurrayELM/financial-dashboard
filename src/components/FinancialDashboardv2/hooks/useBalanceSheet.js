// src/components/FinancialDashboard/hooks/useBalanceSheet.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { initializeBalanceSheetData } from '../utils/dataHelpers';

export const useBalanceSheet = () => {
  const [balanceSheetData, setBalanceSheetData] = useState(() => initializeBalanceSheetData());
  const [balanceSheetSaveTimer, setBalanceSheetSaveTimer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
    } catch (error) {
      console.error('Error saving balance sheet data:', error);
      alert(`Failed to save balance sheet data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }, []);

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

  // Load data on mount
  useEffect(() => {
    loadBalanceSheetFromSupabase();
  }, []);

  return {
    balanceSheetData,
    updateBalanceSheetData,
    isSaving
  };
};