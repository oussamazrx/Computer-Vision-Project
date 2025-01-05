import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">School Attendance System</Link>
      </div>
      <ul className="nav-links">
        <li className={isActive('/dashboard')}>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li className={isActive('/classes')}>
          <Link to="/classes">Classes</Link>
        </li>
        <li className={isActive('/students')}>
          <Link to="/students">Students</Link>
        </li>
        <li className={isActive('/add_student')}>
          <Link to="/add_student">Add Student</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;