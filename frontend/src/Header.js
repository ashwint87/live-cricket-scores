// src/components/Header.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <div className="tabs-container">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? 'tab-button active' : 'tab-button'
        }
        end
      >
        Home
      </NavLink>
      <NavLink
        to="/schedule"
        className={({ isActive }) =>
          isActive ? 'tab-button active' : 'tab-button'
        }
      >
        Schedule
      </NavLink>
      <NavLink
        to="/series"
        className={({ isActive }) =>
          isActive ? 'tab-button active' : 'tab-button'
        }
      >
        Series
      </NavLink>
      <NavLink
        to="/news"
        className={({ isActive }) =>
          isActive ? 'tab-button active' : 'tab-button'
        }
      >
        News
      </NavLink>
      <NavLink
        to="/rankings"
        className={({ isActive }) =>
          isActive ? 'tab-button active' : 'tab-button'
        }
      >
        Rankings
      </NavLink>
      <NavLink
        to="/player"
        className={({ isActive }) =>
          isActive ? 'tab-button active' : 'tab-button'
        }
      >
        Players
      </NavLink>
      <NavLink
        to="/teams"
        className={({ isActive }) =>
          isActive ? 'tab-button active' : 'tab-button'
        }
      >
        Teams
      </NavLink>
      <NavLink
        to="/stadiums"
        className={({ isActive }) =>
          isActive ? 'tab-button active' : 'tab-button'
        }
      >
        Stadiums
      </NavLink>
    </div>
  );
};

export default Header;
