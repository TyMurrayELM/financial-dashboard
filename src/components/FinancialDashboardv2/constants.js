// src/components/FinancialDashboardv2/constants.js

export const regions = ['Las Vegas', 'Phoenix'];

export const departments = [
  'Maintenance', 
  'Maintenance Onsite', 
  'Maintenance WO', 
  'Irrigation', 
  'Enhancements', 
  'Arbor', 
  'Spray/PHC', 
  'Overhead'
];

export const maintenanceDepartments = ['Maintenance', 'Maintenance Onsite'];
export const extraSalesDepartments = ['Maintenance WO', 'Irrigation', 'Enhancements', 'Arbor', 'Spray/PHC'];

// Client retention branches
export const clientRetentionBranches = [
  'Las Vegas',
  'Phx - SW',
  'Phx - SE',
  'Phx - N'
];

// New expense categories for Sankey chart
export const expenseCategories = [
  'COGS Labor',
  'COGS Material, Equipment & Other',
  'Indirect Job Supplies',
  'Vehicle Expenses',
  'Equipment Expenses',
  'Facilities Expenses',
  'Technology Expenses',
  'Office Expenses',
  'Travel',
  'Operational Support & Compliance',
  'Insurance',
  'Advertising & Marketing',
  'Bank Charges & Fees',
  'Outsourced Services',
  'Indirect Payroll Costs',
  'Other Income & Expenses'
];

// Mapping of database fields to display names
export const expenseCategoryFields = {
  cogsLabor: 'COGS Labor',
  cogsMaterial: 'COGS Material, Equipment & Other',
  indirectJobSupplies: 'Indirect Job Supplies',
  vehicleExpenses: 'Vehicle Expenses',
  equipmentExpenses: 'Equipment Expenses',
  facilitiesExpenses: 'Facilities Expenses',
  technologyExpenses: 'Technology Expenses',
  officeExpenses: 'Office Expenses',
  travel: 'Travel',
  operationalSupport: 'Operational Support & Compliance',
  insurance: 'Insurance',
  advertisingMarketing: 'Advertising & Marketing',
  bankCharges: 'Bank Charges & Fees',
  outsourcedServices: 'Outsourced Services',
  indirectPayrollCosts: 'Indirect Payroll Costs',
  otherIncomeExpenses: 'Other Income & Expenses'
};

export const generateMonths = () => {
  const months = [];
  for (let year = 2023; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      months.push(`${year}-${month.toString().padStart(2, '0')}`);
    }
  }
  return months;
};

export const allMonths = generateMonths();

// Default data structure for a single month entry
export const defaultMonthData = {
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

// Default expense category data for a single month
export const defaultExpenseData = {
  cogsLabor: 0,
  cogsMaterial: 0,
  indirectJobSupplies: 0,
  vehicleExpenses: 0,
  equipmentExpenses: 0,
  facilitiesExpenses: 0,
  technologyExpenses: 0,
  officeExpenses: 0,
  travel: 0,
  operationalSupport: 0,
  insurance: 0,
  advertisingMarketing: 0,
  bankCharges: 0,
  outsourcedServices: 0,
  indirectPayrollCosts: 0,
  otherIncomeExpenses: 0
};

// Default balance sheet data structure
export const defaultBalanceSheetData = {
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

// Default client retention data structure
export const defaultClientRetentionData = {
  retentionPercent: 90, // Default to 90% retention
  retentionDollars: 0,
  lostClients: 0,
  totalClients: 0
};