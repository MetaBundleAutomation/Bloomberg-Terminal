import React from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
