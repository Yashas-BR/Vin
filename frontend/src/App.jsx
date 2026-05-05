import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VetDashboard from './pages/VetDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/vet" replace />} />
        <Route path="/vet" element={<VetDashboard />} />
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/authority" element={<AuthorityDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
