// src/components/FinancialDashboard/utils/formatting.js

export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercent = (value) => {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(1)}%`;
};

export const formatInputCurrency = (value) => {
  if (!value || value === 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const parseCurrencyInput = (value) => {
  return value.replace(/[^0-9.-]/g, '');
};

export const getFormattedValue = (value) => {
  return value ? formatInputCurrency(value) : '';
};