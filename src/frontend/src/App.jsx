import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import StatisticsDashboard from './components/StatisticsDashboard';
import GeodataDashboard from './components/GeodataDashboard';
import Sidebar from './components/Sidebar';

function App() {
  const [activeView, setActiveView] = useState('Dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Statistics':
        return <StatisticsDashboard />;
      case 'Geodata':
        return <GeodataDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App" style={{ display: 'flex' }}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div style={{ flex: 1 }}>
        {renderView()}
      </div>
    </div>
  );
}



export default App;
