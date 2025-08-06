import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/contact">Contact Us</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms & Conditions</Link>
      </div>
      <div className="footer-copy">
        © {new Date().getFullYear()} All rights reserved.
      </div>
    </footer>
  );
}
