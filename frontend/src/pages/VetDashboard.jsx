import React from 'react';
import Navbar from '../components/Navbar';

export default function VetDashboard() {
  return (
    <div className="dashboard">
      <Navbar 
        dashboardName="Vet Dashboard — Dr. Arjun Sharma" 
        userName="Dr. Arjun Sharma"
        userRole="vet"
      />
      <div className="dashboard-content">
        <h1>Vet Dashboard</h1>
        <p>Coming in Phase 4...</p>
      </div>
    </div>
  );
}
