// src/components/FinancialDashboardv2/hooks/useClientRetention.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { allMonths, clientRetentionBranches } from '../constants';

// Default data for each month
const defaultClientRetentionData = {
  retentionPercent: 90,
  retentionDollars: 0,
  lostClients: 0,
  totalClients: 0,
  propertiesLostList: ''
};

export const useClientRetention = () => {
  const [clientRetentionData, setClientRetentionData] = useState(() => {
    // Initialize with default data for all branches and months
    const initialData = {};
    
    // Initialize Company level
    initialData['Company'] = {};
    allMonths.forEach(month => {
      initialData['Company'][month] = { ...defaultClientRetentionData };
    });
    
    // Initialize each branch
    clientRetentionBranches.forEach(branch => {
      initialData[branch] = {};
      allMonths.forEach(month => {
        initialData[branch][month] = { ...defaultClientRetentionData };
      });
    });
    
    return initialData;
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);

  // Load client retention data from Supabase
  const loadClientRetentionFromSupabase = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('client_retention_data')
        .select('*');
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Start with initialized data
      const newRetentionData = {};
      
      // Initialize Company level
      newRetentionData['Company'] = {};
      allMonths.forEach(month => {
        newRetentionData['Company'][month] = { ...defaultClientRetentionData };
      });
      
      // Initialize each branch
      clientRetentionBranches.forEach(branch => {
        newRetentionData[branch] = {};
        allMonths.forEach(month => {
          newRetentionData[branch][month] = { ...defaultClientRetentionData };
        });
      });
      
      // Populate with data from database
      if (dbData && dbData.length > 0) {
        dbData.forEach(row => {
          const branch = row.branch;
          const month = row.month;
          
          if (newRetentionData[branch] && newRetentionData[branch][month]) {
            newRetentionData[branch][month] = {
              retentionPercent: parseFloat(row.retention_percent) || 90,
              retentionDollars: parseFloat(row.retention_dollars) || 0,
              lostClients: parseInt(row.lost_properties) || 0,
              totalClients: parseInt(row.total_properties) || 0,
              propertiesLostList: row.properties_lost_list || ''
            };
          }
        });
      }
      
      setClientRetentionData(newRetentionData);
    } catch (error) {
      console.error('Error loading client retention data:', error);
      // Keep initialized data on error
    }
  };

  // Save client retention data to Supabase
  const saveClientRetentionToSupabase = useCallback(async (branch, month, data) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('client_retention_data')
        .upsert({
          branch,
          month,
          retention_percent: data.retentionPercent,
          retention_dollars: data.retentionDollars,
          lost_properties: data.lostClients,
          total_properties: data.totalClients,
          properties_lost_list: data.propertiesLostList || '',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'branch,month'
        });
      
      if (error) {
        console.error('Client retention save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving client retention data:', error);
      // Don't alert for now since column might not exist yet
      console.warn('Note: properties_lost_list column may need to be added to Supabase');
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update client retention data
  const updateClientRetentionData = (branch, month, field, value) => {
    setClientRetentionData(prev => {
      const newData = { ...prev };
      if (!newData[branch]) {
        newData[branch] = {};
      }
      if (!newData[branch][month]) {
        newData[branch][month] = { ...defaultClientRetentionData };
      }
      
      // Parse value based on field type
      if (field === 'retentionPercent') {
        newData[branch][month][field] = parseFloat(value) || 0;
      } else if (field === 'retentionDollars') {
        newData[branch][month][field] = parseFloat(value) || 0;
      } else if (field === 'lostClients' || field === 'totalClients') {
        newData[branch][month][field] = parseInt(value) || 0;
      } else if (field === 'propertiesLostList') {
        // Store as string
        newData[branch][month][field] = value;
      } else {
        newData[branch][month][field] = value;
      }
      
      // Clear existing timer
      if (saveTimer) clearTimeout(saveTimer);
      
      // Set new timer to save after 1 second of inactivity
      const timer = setTimeout(() => {
        saveClientRetentionToSupabase(branch, month, newData[branch][month]);
      }, 1000);
      
      setSaveTimer(timer);
      
      return newData;
    });
  };

  // Calculate metrics for chart display
  const calculateClientRetentionMetrics = useCallback((startMonth, endMonth, selectedBranches) => {
    const filteredMonths = allMonths.filter(month => month >= startMonth && month <= endMonth);
    const metrics = [];
    
    filteredMonths.forEach(month => {
      let monthData = {
        month,
        hasData: false,
        propertiesLostList: '' // Will aggregate properties lost from selected branches
      };
      
      // If "All" is selected or no branches selected, aggregate all branches INCLUDING Company
      if (selectedBranches.includes('All') || selectedBranches.length === 0) {
        let totalRetentionPercent = 0;
        let totalRetentionDollars = 0;
        let totalLostClients = 0;
        let totalTotalClients = 0;
        let branchCount = 0;
        let hasAnyData = false;
        let allPropertiesLost = [];
        
        // Include Company data
        const companyData = clientRetentionData['Company']?.[month];
        if (companyData && (companyData.retentionDollars > 0 || companyData.totalClients > 0)) {
          totalRetentionPercent += companyData.retentionPercent;
          totalRetentionDollars += companyData.retentionDollars;
          totalLostClients += companyData.lostClients;
          totalTotalClients += companyData.totalClients;
          branchCount++;
          hasAnyData = true;
          if (companyData.propertiesLostList) {
            allPropertiesLost.push(`Company: ${companyData.propertiesLostList}`);
          }
        }
        
        // Include all branch data
        clientRetentionBranches.forEach(branch => {
          const data = clientRetentionData[branch]?.[month];
          if (data && (data.retentionDollars > 0 || data.totalClients > 0)) {
            totalRetentionPercent += data.retentionPercent;
            totalRetentionDollars += data.retentionDollars;
            totalLostClients += data.lostClients;
            totalTotalClients += data.totalClients;
            branchCount++;
            hasAnyData = true;
            if (data.propertiesLostList) {
              allPropertiesLost.push(`${branch}: ${data.propertiesLostList}`);
            }
          }
        });
        
        if (hasAnyData && branchCount > 0) {
          monthData.retentionPercent = totalRetentionPercent / branchCount;
          monthData.retentionDollars = totalRetentionDollars;
          monthData.lostClients = totalLostClients;
          monthData.totalClients = totalTotalClients;
          monthData.hasData = true;
          monthData.propertiesLostList = allPropertiesLost.join('\n');
        } else {
          monthData.retentionPercent = null;
          monthData.retentionDollars = null;
          monthData.lostClients = null;
          monthData.totalClients = null;
        }
      } else {
        // Calculate for selected branches
        let totalRetentionPercent = 0;
        let totalRetentionDollars = 0;
        let totalLostClients = 0;
        let totalTotalClients = 0;
        let branchCount = 0;
        let hasAnyData = false;
        let allPropertiesLost = [];
        
        selectedBranches.forEach(branch => {
          let data = null;
          
          if (branch === 'Company') {
            data = clientRetentionData['Company']?.[month];
          } else if (clientRetentionBranches.includes(branch)) {
            data = clientRetentionData[branch]?.[month];
          }
          
          if (data && (data.retentionDollars > 0 || data.totalClients > 0)) {
            totalRetentionPercent += data.retentionPercent;
            totalRetentionDollars += data.retentionDollars;
            totalLostClients += data.lostClients;
            totalTotalClients += data.totalClients;
            branchCount++;
            hasAnyData = true;
            if (data.propertiesLostList) {
              allPropertiesLost.push(`${branch}: ${data.propertiesLostList}`);
            }
          }
        });
        
        if (hasAnyData && branchCount > 0) {
          monthData.retentionPercent = totalRetentionPercent / branchCount;
          monthData.retentionDollars = totalRetentionDollars;
          monthData.lostClients = totalLostClients;
          monthData.totalClients = totalTotalClients;
          monthData.hasData = true;
          monthData.propertiesLostList = allPropertiesLost.join('\n');
        } else {
          monthData.retentionPercent = null;
          monthData.retentionDollars = null;
          monthData.lostClients = null;
          monthData.totalClients = null;
        }
      }
      
      // Add individual branch data for tooltips
      clientRetentionBranches.forEach(branch => {
        const data = clientRetentionData[branch]?.[month];
        if (data && (data.retentionDollars > 0 || data.totalClients > 0)) {
          monthData[`${branch}_percent`] = data.retentionPercent;
          monthData[`${branch}_dollars`] = data.retentionDollars;
          monthData[`${branch}_propertiesLost`] = data.propertiesLostList || '';
        } else {
          monthData[`${branch}_percent`] = null;
          monthData[`${branch}_dollars`] = null;
          monthData[`${branch}_propertiesLost`] = '';
        }
      });
      
      // Add Company data for tooltips
      const companyData = clientRetentionData['Company']?.[month];
      if (companyData && (companyData.retentionDollars > 0 || companyData.totalClients > 0)) {
        monthData['Company_percent'] = companyData.retentionPercent;
        monthData['Company_dollars'] = companyData.retentionDollars;
        monthData['Company_propertiesLost'] = companyData.propertiesLostList || '';
      } else {
        monthData['Company_percent'] = null;
        monthData['Company_dollars'] = null;
        monthData['Company_propertiesLost'] = '';
      }
      
      metrics.push(monthData);
    });
    
    return metrics;
  }, [clientRetentionData]);

  // Load data on mount
  useEffect(() => {
    loadClientRetentionFromSupabase();
  }, []);

  return {
    clientRetentionData,
    updateClientRetentionData,
    calculateClientRetentionMetrics,
    isSaving
  };
};