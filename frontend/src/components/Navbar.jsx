import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ dashboardName, userName, userRole }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <span className="leaf-icon">🌿</span>
          <span className="navbar-title">FarmTrack</span>
        </div>
        <div className="role-switch">
          <NavLink to="/vet" className="role-link">
            Vet
          </NavLink>
          <NavLink to="/farmer" className="role-link">
            Farmer
          </NavLink>
          <NavLink to="/authority" className="role-link">
            Authority
          </NavLink>
        </div>
      </div>
      
      <div className="navbar-center">
        <h1 className="dashboard-name">{dashboardName}</h1>
      </div>
      
      <div className="navbar-right">
        <span className="user-name">{userName}</span>
        <span className={`role-badge role-${userRole}`}>{userRole}</span>
      </div>
    </nav>
  );
}
