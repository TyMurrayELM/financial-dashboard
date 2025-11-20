// src/components/FinancialDashboard/utils/calculations.js

export const calculateRollingAverage = (data, key, windowSize = 6) => {
  // Create a unique key for each window size
  let rollingKey;
  if (windowSize === 3) {
    rollingKey = `${key}Rolling3`;
  } else if (windowSize === 6) {
    rollingKey = `${key}Rolling`;
  } else if (windowSize === 12) {
    rollingKey = `${key}Rolling12`;
  } else {
    rollingKey = `${key}Rolling${windowSize}`;
  }
  
  return data.map((item, index) => {
    // If the current data point is null/undefined, the rolling average should also be null
    // This ensures the rolling average line ends when the actual data ends
    if (item[key] === null || item[key] === undefined) {
      return {
        ...item,
        [rollingKey]: null
      };
    }
    
    const start = Math.max(0, index - windowSize + 1);
    const values = data.slice(start, index + 1)
      .map(d => d[key])
      .filter(val => val !== null && val !== undefined); // Filter out null/undefined values
    
    // If no valid values in the window, return null for the rolling average
    if (values.length === 0) {
      return {
        ...item,
        [rollingKey]: null
      };
    }
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return {
      ...item,
      [rollingKey]: avg
    };
  });
};