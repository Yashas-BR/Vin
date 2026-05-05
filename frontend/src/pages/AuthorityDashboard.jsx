import React from 'react';
import Navbar from '../components/Navbar';

export default function AuthorityDashboard() {
  return (
    <div className="dashboard">
      <Navbar 
        dashboardName="Authority Dashboard — AMU Monitoring Portal" 
        userName="Authority Admin"
        userRole="authority"
      />
      <div className="dashboard-content">
        <h1>Authority Dashboard</h1>
        <p>Coming in Phase 6...</p>
      </div>
    </div>
  );
}
