import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiFileText,
  FiLock,
  FiMail,
  FiMapPin,
  FiMenu,
  FiPhone,
  FiPieChart,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// External Page Component Imports
import AboutPage from "./pages/About/About";
import FeaturesPage from "./pages/Features/Features";
import ContactPage from "./pages/Contact/Contact";

import "./App.css";

// Nav items targeting exact URL paths
const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Features", "/features"],
  ["How It Works", "/how-it-works"],
  ["Who We Serve", "/who-we-serve"],
  ["Contact", "/contact"],
];

// Helper to open relative paths safely in a new browser tab
const openInNewTab = (path) => {
  window.open(path, "_blank", "noopener,noreferrer");
};

function Logo() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className="brand"
      aria-label="SEIS home"
    >
      <div className="fingerprint" aria-hidden="true">
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
    </a>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleNavigation = (path) => {
    setOpen(false);
    openInNewTab(path);
  };

  return (
    <header className="navbar">
      <Logo />

      <nav className={open ? "nav-links open" : "nav-links"}>
        {navItems.map(([label, path]) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              className={isActive ? "active" : ""}
              onClick={() => handleNavigation(path)}
            >
              {label}
            </button>
          );
        })}
      </nav>

      <div className="nav-actions">
        <button
          className="login-btn"
          onClick={() => handleNavigation("/login")}
        >
          <FiUserCheck /> Login
        </button>
        <button
          className="green-btn small"
          onClick={() => handleNavigation("/contact")}
        >
          Get Started
        </button>
      </div>

      <button
        className="mobile-toggle"
        aria-label="Toggle menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <FiX /> : <FiMenu />}
      </button>
    </header>
  );
}

function DashboardMockup() {
  return (
    <div className="visual-wrap">
      <div className="network network-one" />
      <div className="network network-two" />
      <div className="laptop">
        <div className="laptop-camera" />
        <div className="dashboard">
          <aside className="dash-sidebar">
            <div className="dash-logo">
              <span className="mini-fingerprint" /> SEIS
            </div>
            {[
              "Dashboard",
              "Voters",
              "Candidates",
              "Polling Stations",
              "Results",
              "Reports",
            ].map((x, i) => (
              <div
                className={i === 0 ? "dash-menu selected" : "dash-menu"}
                key={x}
              >
                <FiBarChart2 /> {x}
              </div>
            ))}
          </aside>
          <div className="dash-main">
            <div className="dash-heading">
              <div>
                <b>Welcome, Election Official</b>
                <small>General overview of the election</small>
              </div>
            </div>
            <div className="dash-cards">
              <div>
                <small>Registered Voters</small>
                <b>2.5M+</b>
              </div>
              <div>
                <small>Candidates</small>
                <b>18</b>
              </div>
              <div>
                <small>Polling Stations</small>
                <b>1,250</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero section-dark">
      <div className="hero-copy">
        <span className="badge">Trusted. Transparent. Verifiable.</span>
        <h1>
          Smart Electoral
          <br />
          Integrity System
        </h1>
        <p>
          A secure demonstration platform that showcases transparent, verifiable and trustworthy digital elections.
        </p>
        <div className="hero-buttons">
          <button
            className="green-btn"
            onClick={() => openInNewTab("/contact")}
          >
            Get Started <FiArrowRight />
          </button>
          <button
            className="outline-btn"
            onClick={() => openInNewTab("/about")}
          >
            Learn More <FiArrowRight />
          </button>
        </div>
      </div>
      <DashboardMockup />
    </section>
  );
}

function Stats() {
  const statsList = [
    [FiUsers, "2.5M+", "Registered Voters"],
    [FiUserCheck, "18", "Candidates"],
    [FiMapPin, "1,250", "Polling Stations"],
    [FiPieChart, "99.9%", "System Uptime"],
  ];

  return (
    <section className="stats-wrap">
      <div className="stats-card">
        {statsList.map(([Icon, value, label]) => (
          <div className="stat" key={label}>
            <div className="stat-icon">
              <Icon />
            </div>
            <div>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeAboutSection() {
  return (
    <section className="section about-section">
      <div className="about-copy">
        <span className="eyebrow">ABOUT SEIS</span>
        <h2>Building Trust in Every Vote</h2>
        <p>
          SEIS ensures structural transparency and cryptographic integrity across digital validation pipelines.
        </p>
        <button
          className="green-btn"
          onClick={() => openInNewTab("/about")}
        >
          Our Full Vision
        </button>
      </div>
    </section>
  );
}

// Inline placeholder pages for route targets
function HowItWorksPage() {
  return (
    <div className="page-layout section">
      <h2>How It Works</h2>
      <p>
        Discover our step-by-step cryptographic audit and zero-knowledge verification frameworks.
      </p>
    </div>
  );
}

function WhoWeServePage() {
  return (
    <div className="page-layout section">
      <h2>Who We Serve</h2>
      <p>
        Providing ironclad consensus security parameters for civil registries and government bodies.
      </p>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="page-layout section">
      <h2>System Authentication</h2>
      <p>
        Please enter your biometric or administrative keys to view operational voter control hubs.
      </p>
    </div>
  );
}

function HomeLayout() {
  return (
    <>
      <Hero />
      <Stats />
      <HomeAboutSection />
    </>
  );
}

function Footer() {
  return (
    <footer className="footer section-dark">
      <p>&copy; {new Date().getFullYear()} SEIS. All rights reserved.</p>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeLayout />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/who-we-serve" element={<WhoWeServePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}