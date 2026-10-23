import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiUserCheck, FiX } from "react-icons/fi";

const navItems = [
  ["Home", "/"],
  ["Live Stream", "/live-stream"],
  ["About", "/about"],
  ["Features", "/features"],
  ["How It Works", "/how-it-works"],
  ["Who We Serve", "/who-we-serve"],
  ["Contact", "/contact"],
];

export function Logo() {
  return (
    <Link to="/" className="brand">
      <div className="fingerprint">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div>
        <strong>SEIS</strong>
        <small>
          SMART ELECTORAL
          <br />
          INTEGRITY SYSTEM
        </small>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <Logo />

      <nav className={open ? "nav-links open" : "nav-links"}>
        {navItems.map(([label, path]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        <Link to="/login" className="login-btn">
          <FiUserCheck />
          Login
        </Link>

        <Link to="/signup" className="green-btn small">
          Get Started
        </Link>
      </div>

      <button
        className="mobile-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <FiX /> : <FiMenu />}
      </button>
    </header>
  );
}
