import React from 'react';
import FinancialDashboard from './FinancialDashboard';
import FinancialDashboardModular from './components/FinancialDashboardv2';
import './App.css';

function App() {
  // 🔄 TOGGLE THIS TO SWITCH VERSIONS
  // false = Original version (your current working dashboard)
  // true = New modular version (for testing)
  const USE_MODULAR_VERSION = true;
  
  // Optional: Show which version is running (helpful for testing)
  const showVersionBanner = false;
  
  return (
    <div className="App">
      {/* Optional version banner - remove this section when done testing */}
      {showVersionBanner && (
        <div style={{
          backgroundColor: USE_MODULAR_VERSION ? '#10b981' : '#3b82f6',
          color: 'white',
          padding: '8px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Running: {USE_MODULAR_VERSION ? 'NEW MODULAR' : 'ORIGINAL'} Version
        </div>
      )}
      
      {/* Dashboard component - switches based on USE_MODULAR_VERSION */}
      {USE_MODULAR_VERSION ? (
        <FinancialDashboardModular />
      ) : (
        <FinancialDashboard />
      )}
    </div>
  );
}

export default App;