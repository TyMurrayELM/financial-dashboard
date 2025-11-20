// src/components/FinancialDashboard/utils/dataHelpers.js

import { regions, departments, allMonths, defaultMonthData, defaultBalanceSheetData } from '../constants';

export const initializeEmptyData = () => {
  const initialData = {};
  
  // Initialize regular regions and departments
  regions.forEach(region => {
    initialData[region] = {};
    departments.forEach(dept => {
      initialData[region][dept] = {};
      allMonths.forEach(month => {
        initialData[region][dept][month] = { ...defaultMonthData };
      });
    });
  });
  
  // Initialize Company level with all departments
  initialData['Company'] = {};
  departments.forEach(dept => {
    initialData['Company'][dept] = {};
    allMonths.forEach(month => {
      initialData['Company'][dept][month] = { ...defaultMonthData };
    });
  });
  
  // Add Company Total for high-level P&L entry
  initialData['Company']['Company Total'] = {};
  allMonths.forEach(month => {
    initialData['Company']['Company Total'][month] = { ...defaultMonthData };
  });
  
  return initialData;
};

export const getInitialData = () => {
  const data = initializeEmptyData();
  
  // Ensure all structures exist
  ['Company', ...regions].forEach(region => {
    if (!data[region]) data[region] = {};
    departments.forEach(dept => {
      if (!data[region][dept]) data[region][dept] = {};
      allMonths.forEach(month => {
        if (!data[region][dept][month]) {
          data[region][dept][month] = { ...defaultMonthData };
        }
      });
    });
  });
  
  // Ensure Company Total exists
  if (!data['Company']['Company Total']) {
    data['Company']['Company Total'] = {};
    allMonths.forEach(month => {
      data['Company']['Company Total'][month] = { ...defaultMonthData };
    });
  }
  
  return data;
};

export const initializeBalanceSheetData = () => {
  const balanceData = {};
  allMonths.forEach(month => {
    balanceData[month] = { ...defaultBalanceSheetData };
  });
  return balanceData;
};