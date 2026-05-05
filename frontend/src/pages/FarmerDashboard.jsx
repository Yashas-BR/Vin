import React from 'react';
import Navbar from '../components/Navbar';

export default function FarmerDashboard() {
  return (
    <div className="dashboard">
      <Navbar 
        dashboardName="My Farm — Green Valley Farm" 
        userName="Ramu Patil"
        userRole="farmer"
      />
      <div className="dashboard-content">
        <h1>Farmer Dashboard</h1>
        <p>Coming in Phase 5...</p>
      </div>
    </div>
  );
}
