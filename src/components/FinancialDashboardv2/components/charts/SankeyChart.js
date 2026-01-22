// src/components/FinancialDashboard/components/charts/SankeyChart.js

import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { formatCurrency } from '../../utils/formatting';
import { expenseCategoryFields } from '../../constants';

export const SankeyChart = ({ 
  revenueData, 
  expenseData, 
  startMonth, 
  endMonth,
  selectedRegion,
  selectedDepartment 
}) => {
  const sankeyData = useMemo(() => {
    if (!revenueData || !expenseData) return null;

    // Calculate total revenue for the period
    const totalRevenue = revenueData.reduce((sum, m) => sum + (m.revenue || 0), 0);
    
    // Calculate expense totals
    const expenseTotals = {};
    let totalExpenses = 0;
    
    Object.keys(expenseCategoryFields).forEach(field => {
      const total = Object.keys(expenseData)
        .filter(month => month >= startMonth && month <= endMonth)
        .reduce((sum, month) => sum + (expenseData[month]?.[field] || 0), 0);
      
      if (total !== 0) { // Include negative values (other income)
        expenseTotals[field] = total;
        // For total expenses, treat negative values (income) as reducing expenses
        totalExpenses += total;
      }
    });

    // Calculate net income
    const netIncome = totalRevenue - totalExpenses;

    // Build nodes - Revenue on left, expenses in middle (sorted), net income at bottom
    const nodes = ['Revenue'];
    const nodeColors = ['#10b981']; // Green for revenue
    
    // Sort expense categories by absolute value (largest first)
    const sortedExpenses = Object.entries(expenseTotals)
      .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a));
    
    // Add sorted expense categories
    const expenseNodes = [];
    const expenseFieldOrder = [];
    sortedExpenses.forEach(([field, amount]) => {
      const label = expenseCategoryFields[field];
      nodes.push(label);
      expenseNodes.push(label);
      expenseFieldOrder.push(field);
      
      // Color based on category type
      if (field.includes('cogs')) {
        nodeColors.push('#ef4444'); // Red for COGS
      } else if (field.includes('payroll') || field.includes('wages')) {
        nodeColors.push('#3b82f6'); // Blue for payroll
      } else if (field.includes('vehicle') || field.includes('equipment')) {
        nodeColors.push('#f59e0b'); // Orange for equipment/vehicles
      } else if (field.includes('facilities') || field.includes('office')) {
        nodeColors.push('#8b5cf6'); // Purple for facilities/office
      } else if (field === 'travel') {
        nodeColors.push('#06b6d4'); // Cyan for travel
      } else if (field === 'otherIncomeExpenses' && amount < 0) {
        nodeColors.push('#10b981'); // Green for income (negative expense)
      } else {
        nodeColors.push('#6b7280'); // Gray for others
      }
    });
    
    // Add net income/loss node at the end (bottom)
    if (netIncome !== 0) {
      nodes.push(netIncome >= 0 ? 'Net Income' : 'Net Loss');
      nodeColors.push(netIncome >= 0 ? '#059669' : '#dc2626');
    }

    // Build links (flows)
    const source = [];
    const target = [];
    const value = [];
    const linkColors = [];
    const linkLabels = [];

    // Revenue flows to each expense category (in sorted order)
    let nodeIndex = 1; // Start after Revenue (index 0)
    sortedExpenses.forEach(([field, amount]) => {
      if (amount > 0) {
        source.push(0); // From Revenue
        target.push(nodeIndex); // To expense category
        value.push(amount);
        linkColors.push('rgba(239, 68, 68, 0.4)'); // Red tint for expenses
        linkLabels.push(formatCurrency(amount));
      } else if (amount < 0) {
        // Negative expenses (income)
        source.push(0); // From Revenue
        target.push(nodeIndex); // To "negative expense" (actually income)
        value.push(Math.abs(amount)); // Use absolute value for flow width
        linkColors.push('rgba(16, 185, 129, 0.4)'); // Green for income
        linkLabels.push(`Income: ${formatCurrency(Math.abs(amount))}`);
      }
      nodeIndex++;
    });

    // Revenue also flows to Net Income/Loss (at the bottom)
    if (netIncome !== 0) {
      source.push(0); // From Revenue
      target.push(nodes.length - 1); // To Net Income/Loss (last node)
      value.push(Math.abs(netIncome));
      linkColors.push(netIncome >= 0 ? 'rgba(5, 150, 105, 0.5)' : 'rgba(220, 38, 38, 0.5)');
      linkLabels.push(formatCurrency(netIncome));
    }

    return {
      nodes,
      nodeColors,
      source,
      target,
      value,
      linkColors,
      linkLabels,
      totalRevenue,
      totalExpenses,
      netIncome,
      expenseTotals,
      sortedExpenses
    };
  }, [revenueData, expenseData, startMonth, endMonth]);

  if (!sankeyData || sankeyData.totalRevenue === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Flow Sankey Chart</h3>
        <div className="flex items-center justify-center h-[450px] bg-gray-50 rounded-lg">
          <p className="text-gray-500">No revenue data available for the selected period</p>
        </div>
      </div>
    );
  }

  const trace = {
    type: 'sankey',
    orientation: 'h',
    arrangement: 'snap',
    node: {
      pad: 15,
      thickness: 30,
      line: {
        color: 'black',
        width: 1
      },
      label: sankeyData.nodes.map((node, i) => {
        if (node === 'Revenue') return `<b>${node}</b>`;
        if (node === 'Net Income' || node === 'Net Loss') {
          // Add percentage for net income/loss
          const percentOfRevenue = sankeyData.totalRevenue > 0 
            ? `${((sankeyData.netIncome / sankeyData.totalRevenue) * 100).toFixed(1)}%`
            : '0.0%';
          return `<b>${node} - ${percentOfRevenue}</b>`;
        }
        
        // For expense categories, add percentage
        const fieldEntry = Object.entries(expenseCategoryFields).find(([, label]) => label === node);
        if (fieldEntry) {
          const [field] = fieldEntry;
          const expenseValue = sankeyData.expenseTotals[field];
          const percentOfRevenue = sankeyData.totalRevenue > 0 
            ? `${(Math.abs(expenseValue) / sankeyData.totalRevenue * 100).toFixed(1)}%`
            : '0.0%';
          // Include percentage in the bold label
          return `<b>${node} - ${percentOfRevenue}</b>`;
        }
        return `<b>${node}</b>`;
      }),
      color: sankeyData.nodeColors,
      // Explicitly position nodes
      x: sankeyData.nodes.map((node, i) => {
        if (i === 0) return 0.001; // Revenue on far left
        return 0.999; // All others on far right
      }),
      y: sankeyData.nodes.map((node, i) => {
        if (i === 0) return 0.5; // Revenue in middle vertically
        
        // For expense nodes and net income
        const totalNodes = sankeyData.nodes.length - 1; // Exclude Revenue
        
        // Net Income/Loss should be at the bottom
        if (node === 'Net Income' || node === 'Net Loss') {
          return 0.99; // Bottom position
        }
        
        // Distribute expense nodes from top to bottom (excluding Net Income)
        const expenseIndex = i - 1; // Adjust for Revenue being at index 0
        const numExpenses = totalNodes - 1; // Exclude Net Income
        
        if (numExpenses > 0) {
          // Space expenses evenly from top (0.01) to just above bottom (0.85)
          return 0.01 + (expenseIndex * 0.84 / Math.max(1, numExpenses - 1));
        }
        return 0.5;
      }),
      customdata: sankeyData.nodes.map((node, i) => {
        if (node === 'Revenue') return formatCurrency(sankeyData.totalRevenue);
        if (node === 'Net Income' || node === 'Net Loss') return formatCurrency(sankeyData.netIncome);
        
        // Find the expense value for this node
        const fieldEntry = Object.entries(expenseCategoryFields).find(([, label]) => label === node);
        if (fieldEntry) {
          const [field] = fieldEntry;
          const expenseValue = sankeyData.expenseTotals[field];
          if (expenseValue < 0) {
            return `Income: ${formatCurrency(Math.abs(expenseValue))}`;
          }
          return formatCurrency(expenseValue);
        }
        return '';
      }),
      hovertemplate: '<b>%{label}</b><br>%{customdata}<extra></extra>',
      // Enhanced font settings for better visibility
      font: {
        size: 13,
        color: '#000000',
        family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
      }
    },
    link: {
      source: sankeyData.source,
      target: sankeyData.target,
      value: sankeyData.value,
      color: sankeyData.linkColors,
      customdata: sankeyData.linkLabels,
      hovertemplate: 'Flow: %{customdata}<extra></extra>'
    },
    // Enable text inside nodes for better readability
    textfont: {
      size: 12,
      color: '#000000',
      family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    }
  };

  const layout = {
    title: {
      text: `<b>Revenue Flow Analysis (${startMonth} to ${endMonth})</b>`,
      font: { 
        size: 18,
        color: '#1a202c',
        family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
      }
    },
    font: { 
      size: 12,
      family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    },
    height: 675,
    margin: { l: 120, r: 180, t: 60, b: 60 },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    annotations: [
      {
        x: -0.05,
        y: 0.5,
        xref: 'paper',
        yref: 'paper',
        text: '<b>REVENUE<br>INPUT</b>',
        showarrow: false,
        font: {
          size: 14,
          color: '#10b981',
          family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
        },
        textangle: -90
      },
      {
        x: 1.05,
        y: 0.9,
        xref: 'paper',
        yref: 'paper',
        text: '<b>EXPENSES</b><br><span style="font-size: 10px;">(Largest → Smallest)</span>',
        showarrow: false,
        font: {
          size: 13,
          color: '#4b5563',
          family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
        },
        textangle: 90,
        align: 'center'
      },
      {
        x: 1.05,
        y: 0.05,
        xref: 'paper',
        yref: 'paper',
        text: '<b>NET RESULT ↓</b>',
        showarrow: false,
        font: {
          size: 14,
          color: sankeyData.netIncome >= 0 ? '#059669' : '#dc2626',
          family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
        },
        textangle: 90
      }
    ]
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Revenue Flow Sankey Chart</h3>
        <p className="text-sm text-gray-600 mt-1">
          Visualizing how revenue flows through expense categories to net income
          {selectedRegion !== 'All' && ` for ${selectedRegion}`}
          {selectedDepartment !== 'All' && ` - ${selectedDepartment}`}
        </p>
        <div className="mt-2 p-3 bg-blue-50 rounded text-sm text-blue-800">
          <strong>How to read this chart:</strong>
          <ul className="mt-1 ml-4 list-disc">
            <li><strong>Left (Green):</strong> Total Revenue input for the period</li>
            <li><strong>Middle:</strong> Expense categories ordered from largest (top) to smallest</li>
            <li><strong>Bottom Right:</strong> Net Income/Loss after all expenses</li>
            <li>Flow width represents the dollar amount</li>
            <li>Red flows = expenses, Green flows = income/positive results</li>
          </ul>
        </div>
      </div>
      
      <Plot
        data={[trace]}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '675px' }}
      />
      
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Total Revenue (Input)</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(sankeyData.totalRevenue)}
          </p>
          <p className="text-xs text-gray-600 mt-1">100% of flow</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(Math.abs(sankeyData.totalExpenses))}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {sankeyData.totalRevenue > 0 
              ? `${((Math.abs(sankeyData.totalExpenses) / sankeyData.totalRevenue) * 100).toFixed(1)}% of revenue`
              : '0% of revenue'}
          </p>
        </div>
        <div className={`${sankeyData.netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-lg`}>
          <p className="text-sm font-medium text-gray-700 mb-1">
            {sankeyData.netIncome >= 0 ? 'Net Income (Bottom)' : 'Net Loss (Bottom)'}
          </p>
          <p className={`text-2xl font-bold ${sankeyData.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(sankeyData.netIncome)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {sankeyData.totalRevenue > 0 
              ? `${((sankeyData.netIncome / sankeyData.totalRevenue) * 100).toFixed(1)}% margin`
              : '0% margin'}
          </p>
        </div>
      </div>
      
      {/* Expense breakdown table - already sorted */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Expense Category Breakdown (Largest to Smallest)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-3">Rank</th>
                <th className="text-left py-2 px-3">Category</th>
                <th className="text-right py-2 px-3">Amount</th>
                <th className="text-right py-2 px-3">% of Revenue</th>
                <th className="text-right py-2 px-3">% of Total Expenses</th>
              </tr>
            </thead>
            <tbody>
              {sankeyData.sortedExpenses.map(([field, amount], index) => {
                const label = expenseCategoryFields[field];
                const percentOfRevenue = sankeyData.totalRevenue > 0 
                  ? (amount / sankeyData.totalRevenue * 100).toFixed(1)
                  : '0.0';
                const percentOfExpenses = sankeyData.totalExpenses !== 0 
                  ? (amount / Math.abs(sankeyData.totalExpenses) * 100).toFixed(1)
                  : '0.0';
                
                return (
                  <tr key={field} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 text-center font-medium text-gray-500">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 font-medium">{label}</td>
                    <td className={`text-right py-2 px-3 font-medium ${amount < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {amount < 0 && '(+'}{formatCurrency(Math.abs(amount))}{amount < 0 && ')'}
                    </td>
                    <td className="text-right py-2 px-3 text-gray-600">
                      {percentOfRevenue}%
                    </td>
                    <td className="text-right py-2 px-3 text-gray-600">
                      {percentOfExpenses}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold bg-gray-50">
                <td className="py-2 px-3"></td>
                <td className="py-2 px-3">Total</td>
                <td className="text-right py-2 px-3">{formatCurrency(Math.abs(sankeyData.totalExpenses))}</td>
                <td className="text-right py-2 px-3">
                  {sankeyData.totalRevenue > 0 
                    ? `${((Math.abs(sankeyData.totalExpenses) / sankeyData.totalRevenue) * 100).toFixed(1)}%`
                    : '0.0%'}
                </td>
                <td className="text-right py-2 px-3">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};