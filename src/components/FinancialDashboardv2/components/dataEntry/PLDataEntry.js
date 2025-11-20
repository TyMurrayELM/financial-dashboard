// src/components/FinancialDashboard/components/dataEntry/PLDataEntry.js

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { formatCurrency, getFormattedValue, parseCurrencyInput } from '../../utils/formatting';
import { regions, departments, maintenanceDepartments, extraSalesDepartments, allMonths } from '../../constants';

export const PLDataEntry = ({ data, updateData, startMonth, endMonth }) => {
  const [dataEntryRegion, setDataEntryRegion] = useState('');
  const [dataEntryDept, setDataEntryDept] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState({});

  // Toggle department expansion
  const toggleDepartment = (dept) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [dept]: !prev[dept]
    }));
  };

  return (
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
                    charts will use this data instead of aggregating department data. The 2025 Planned 
                    Revenue fields (regular and onsites) and 2025 Forecast Revenue fields will be aggregated for the Maintenance Revenue vs Plan chart.
                    The Maint Labor Cost fields are used for the Maintenance Direct Labor % chart calculations.
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Maint Labor Cost</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Maint Labor Cost Onsites</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Total Employees</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Direct</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Indirect</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Vehicles</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Vehicle Costs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">Indirect Personnel Costs</th>
                        {allMonths.filter(month => month >= startMonth && month <= endMonth).some(month => month.startsWith('2025')) && (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Planned Revenue</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Planned Revenue Onsites</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Forecast Revenue</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Forecast Revenue Onsites</th>
                          </>
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
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.maintDirectLaborCost)}
                              onChange={(e) => updateData('Company', 'Company Total', month, 'maintDirectLaborCost', parseCurrencyInput(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-24 border rounded px-2 py-1 text-sm"
                              placeholder="$0"
                              value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.maintDirectLaborCostOnsites)}
                              onChange={(e) => updateData('Company', 'Company Total', month, 'maintDirectLaborCostOnsites', parseCurrencyInput(e.target.value))}
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
                          {month.startsWith('2025') ? (
                            <>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  className="w-24 border rounded px-2 py-1 text-sm"
                                  placeholder="$0"
                                  value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.maintenancePlan2025)}
                                  onChange={(e) => updateData('Company', 'Company Total', month, 'maintenancePlan2025', parseCurrencyInput(e.target.value))}
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  className="w-24 border rounded px-2 py-1 text-sm"
                                  placeholder="$0"
                                  value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.maintenanceOnsitePlan2025)}
                                  onChange={(e) => updateData('Company', 'Company Total', month, 'maintenanceOnsitePlan2025', parseCurrencyInput(e.target.value))}
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  className="w-24 border rounded px-2 py-1 text-sm"
                                  placeholder="$0"
                                  value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.maintenanceForecast2025)}
                                  onChange={(e) => updateData('Company', 'Company Total', month, 'maintenanceForecast2025', parseCurrencyInput(e.target.value))}
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  className="w-24 border rounded px-2 py-1 text-sm"
                                  placeholder="$0"
                                  value={getFormattedValue(data['Company']?.['Company Total']?.[month]?.maintenanceOnsiteForecast2025)}
                                  onChange={(e) => updateData('Company', 'Company Total', month, 'maintenanceOnsiteForecast2025', parseCurrencyInput(e.target.value))}
                                />
                              </td>
                            </>
                          ) : (allMonths.filter(month => month >= startMonth && month <= endMonth).some(month => month.startsWith('2025'))) ? (
                            <>
                              <td className="px-4 py-2 bg-gray-50"></td>
                              <td className="px-4 py-2 bg-gray-50"></td>
                              <td className="px-4 py-2 bg-gray-50"></td>
                              <td className="px-4 py-2 bg-gray-50"></td>
                            </>
                          ) : null}
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
            <DepartmentEntry 
              key={dept}
              dept={dept}
              data={data}
              updateData={updateData}
              startMonth={startMonth}
              endMonth={endMonth}
              expandedDepartments={expandedDepartments}
              toggleDepartment={toggleDepartment}
            />
          ))}
          
          {/* Summary section for Company data */}
          {data && data['Company'] && (
            <CompanySummary 
              data={data}
              startMonth={startMonth}
              endMonth={endMonth}
            />
          )}
        </div>
      )}
      
      {/* Regular Data Entry Table - Only show if region and department are selected */}
      {dataEntryRegion && dataEntryDept && dataEntryRegion !== 'Company' && (
        <RegularDataEntry 
          dataEntryRegion={dataEntryRegion}
          dataEntryDept={dataEntryDept}
          data={data}
          updateData={updateData}
          startMonth={startMonth}
          endMonth={endMonth}
        />
      )}
    </div>
  );
};

// Department Entry Component
const DepartmentEntry = ({ dept, data, updateData, startMonth, endMonth, expandedDepartments, toggleDepartment }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
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
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Planned Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Forecast Revenue</th>
                    </>
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
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="w-24 border rounded px-2 py-1 text-sm"
                            placeholder="$0"
                            value={getFormattedValue(data['Company']?.[dept]?.[month]?.maintenancePlan2025)}
                            onChange={(e) => updateData('Company', dept, month, 'maintenancePlan2025', parseCurrencyInput(e.target.value))}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="w-24 border rounded px-2 py-1 text-sm"
                            placeholder="$0"
                            value={getFormattedValue(data['Company']?.[dept]?.[month]?.maintenanceForecast2025)}
                            onChange={(e) => updateData('Company', dept, month, 'maintenanceForecast2025', parseCurrencyInput(e.target.value))}
                          />
                        </td>
                      </>
                    ) : (allMonths.filter(month => month >= startMonth && month <= endMonth).some(month => month.startsWith('2025')) && maintenanceDepartments.includes(dept)) ? (
                      <>
                        <td className="px-4 py-2 bg-gray-50"></td>
                        <td className="px-4 py-2 bg-gray-50"></td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Company Summary Component
const CompanySummary = ({ data, startMonth, endMonth }) => {
  const filteredMonths = allMonths.filter(month => month >= startMonth && month <= endMonth);
  
  const maintenanceRevenue = filteredMonths.reduce((sum, month) => {
    let maintTotal = 0;
    maintenanceDepartments.forEach(dept => {
      maintTotal += data['Company']?.[dept]?.[month]?.revenue || 0;
    });
    return sum + maintTotal;
  }, 0);

  const extraSalesRevenue = filteredMonths.reduce((sum, month) => {
    let extraTotal = 0;
    extraSalesDepartments.forEach(dept => {
      extraTotal += data['Company']?.[dept]?.[month]?.revenue || 0;
    });
    return sum + extraTotal;
  }, 0);

  const overheadRevenue = filteredMonths.reduce((sum, month) => 
    sum + (data['Company']?.['Overhead']?.[month]?.revenue || 0), 0);

  const overheadNetIncome = filteredMonths.reduce((sum, month) => 
    sum + (data['Company']?.['Overhead']?.[month]?.netIncome || 0), 0);

  const avgOverheadIndirect = filteredMonths.reduce((sum, month) => 
    sum + (data['Company']?.['Overhead']?.[month]?.indirectEmployees || 0), 0) / filteredMonths.length;

  const avgOverheadVehicles = filteredMonths.reduce((sum, month) => 
    sum + (data['Company']?.['Overhead']?.[month]?.activeVehicles || 0), 0) / filteredMonths.length;

  const totalRevenue = filteredMonths.reduce((sum, month) => {
    let monthTotal = 0;
    departments.forEach(dept => {
      monthTotal += data['Company']?.[dept]?.[month]?.revenue || 0;
    });
    return sum + monthTotal;
  }, 0);

  const companyTotalRevenue = filteredMonths.reduce((sum, month) => 
    sum + (data['Company']['Company Total'][month]?.revenue || 0), 0);

  return (
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
                    filteredMonths.reduce((sum, month) => 
                      sum + (data['Company']?.[dept]?.[month]?.revenue || 0), 0)
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Maintenance:</span>
              <span className="text-blue-600">{formatCurrency(maintenanceRevenue)}</span>
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
                    filteredMonths.reduce((sum, month) => 
                      sum + (data['Company']?.[dept]?.[month]?.revenue || 0), 0)
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Extra Sales:</span>
              <span className="text-green-600">{formatCurrency(extraSalesRevenue)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Overhead Department</h5>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium">{formatCurrency(overheadRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Net Income Impact:</span>
              <span className="font-medium text-red-600">{formatCurrency(overheadNetIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Indirect HC:</span>
              <span className="font-medium">{Math.round(avgOverheadIndirect)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Vehicles:</span>
              <span className="font-medium">{Math.round(avgOverheadVehicles)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Company Revenue:</span>
          <span className="text-lg font-semibold">{formatCurrency(totalRevenue)}</span>
        </div>
        {companyTotalRevenue > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <strong>Company Total (High-Level P&L):</strong> {formatCurrency(companyTotalRevenue)}
          </div>
        )}
      </div>
    </div>
  );
};

// Regular Data Entry Component
const RegularDataEntry = ({ dataEntryRegion, dataEntryDept, data, updateData, startMonth, endMonth }) => {
  return (
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
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Planned Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap bg-white border-b-2 border-gray-300">2025 Forecast Revenue</th>
                  </>
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
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(data[dataEntryRegion]?.[dataEntryDept]?.[month]?.maintenancePlan2025)}
                          onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'maintenancePlan2025', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="$0"
                          value={getFormattedValue(data[dataEntryRegion]?.[dataEntryDept]?.[month]?.maintenanceForecast2025)}
                          onChange={(e) => updateData(dataEntryRegion, dataEntryDept, month, 'maintenanceForecast2025', parseCurrencyInput(e.target.value))}
                        />
                      </td>
                    </>
                  ) : (allMonths.filter(month => month >= startMonth && month <= endMonth).some(month => month.startsWith('2025')) && maintenanceDepartments.includes(dataEntryDept)) ? (
                    <>
                      <td className="px-4 py-2 bg-gray-50"></td>
                      <td className="px-4 py-2 bg-gray-50"></td>
                    </>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-blue-50 border-t">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Data is automatically saved as you type. Use the date range filters at the top to control which months are displayed. The dashboard will automatically calculate all derived metrics. For Maintenance departments, you can enter 2025 Planned Revenue values for budget comparison and 2025 Forecast Revenue values for current projections.
          {dataEntryRegion === 'Company' && (
            <span> <strong>Company Region:</strong> Enter consolidated company-wide data by department. This data is separate from individual region data and useful for quick high-level entry.</span>
          )}
        </p>
      </div>
    </div>
  );
};