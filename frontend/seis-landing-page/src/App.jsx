import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Link,
} from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiFileText,
  FiLock,
  FiMail,
  FiMapPin,
  FiPieChart,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUsers,
  FiMenu,
  FiX,
  FiKey,
  FiGlobe,
  FiGithub,
  FiTwitter,
  FiLinkedin,
} from "react-icons/fi";

import AboutPage from "./pages/About/About";
import FeaturesPage from "./pages/Features/Features";
import ContactPage from "./pages/Contact/Contact";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./components/dashboard/DashboardOverview";

import "./App.css";

const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Features", "/features"],
  ["How It Works", "/how-it-works"],
  ["Who We Serve", "/who-we-serve"],
  ["Contact", "/contact"],
];

/* =========================
   NAVBAR
========================= */

function Logo() {
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

function Navbar() {
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

        <Link to="/dashboard" className="green-btn small">
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

/* =========================
   DASHBOARD MOCKUP (HERO PREVIEW)
========================= */

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
              <span className="mini-fingerprint" />
              SEIS
            </div>

            {[
              "Dashboard",
              "Voters",
              "Candidates",
              "Polling Stations",
              "Results",
              "Reports",
            ].map((item, index) => (
              <div
                className={index === 0 ? "dash-menu selected" : "dash-menu"}
                key={item}
              >
                <FiBarChart2 />
                {item}
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

/* =========================
   HOME CONTENT LAYOUT
========================= */

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
          A secure demonstration platform that showcases transparent,
          verifiable and trustworthy digital elections.
        </p>

        <div className="hero-buttons">
          <Link to="/dashboard" className="green-btn">
            Get Started
            <FiArrowRight />
          </Link>

          <Link to="/about" className="outline-btn">
            Learn More
            <FiArrowRight />
          </Link>
        </div>
      </div>

      <DashboardMockup />
    </section>
  );
}

function Stats() {
  const stats = [
    [FiUsers, "2.5M+", "Registered Voters"],
    [FiUserCheck, "18", "Candidates"],
    [FiMapPin, "1,250", "Polling Stations"],
    [FiPieChart, "99.9%", "System Uptime"],
  ];

  return (
    <section className="stats-wrap">
      <div className="stats-card">
        {stats.map(([Icon, value, label]) => (
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

function HomeLayout() {
  return (
    <>
      <Hero />
      <Stats />
      <HowItWorksSection />
      <WhoWeServeSection />
    </>
  );
}

/* =========================
   SECTIONS FOR OTHER ROUTES
========================= */

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Register",
      text: "Eligible voters are securely registered within the election system.",
      icon: FiUserCheck,
    },
    {
      number: "02",
      title: "Authenticate",
      text: "The system verifies the identity and authorization of the user.",
      icon: FiLock,
    },
    {
      number: "03",
      title: "Cast Vote",
      text: "An authorized voter securely participates in the voting process.",
      icon: FiCheck,
    },
    {
      number: "04",
      title: "Verify",
      text: "Election information passes through verification and integrity checks.",
      icon: FiShield,
    },
  ];

  return (
    <section className="section how-it-works-section">
      <div className="section-heading">
        <span className="eyebrow">HOW IT WORKS</span>
        <h2>Transparent & Verifiable Process</h2>
        <p>Four simple steps to ensure complete electoral integrity.</p>
      </div>

      <div className="steps-grid">
        {steps.map(({ number, title, text, icon: Icon }) => (
          <div className="step-card" key={number}>
            <div className="step-header">
              <span className="step-number">{number}</span>
              <div className="step-icon">
                <Icon />
              </div>
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhoWeServeSection() {
  return (
    <section className="serve-section" id="who-we-serve">
      <div className="serve-header">
        <span className="eyebrow">WHO WE SERVE</span>
        <h2>
          Built for Everyone in the <span>Electoral Ecosystem</span>
        </h2>
        <p>
          SEIS connects the people and institutions that make elections
          transparent, secure and trustworthy.
        </p>
      </div>

      <div className="serve-grid">
        <div className="serve-card">
          <div className="serve-icon">
            <FiUsers />
          </div>
          <h3>Voters</h3>
          <p>
            Empowering citizens with secure and transparent access to electoral
            information.
          </p>
          <a href="#voters">Learn More &rarr;</a>
        </div>

        <div className="serve-card featured">
          <div className="serve-icon">
            <FiUserCheck />
          </div>
          <h3>Election Officials</h3>
          <p>
            Providing election administrators with reliable tools for managing
            secure electoral processes.
          </p>
          <a href="#officials">Learn More &rarr;</a>
        </div>

        <div className="serve-card">
          <div className="serve-icon">
            <FiShield />
          </div>
          <h3>Candidates</h3>
          <p>
            Creating a transparent environment where candidates can participate
            with confidence.
          </p>
          <a href="#candidates">Learn More &rarr;</a>
        </div>

        <div className="serve-card">
          <div className="serve-icon">
            <FiSearch />
          </div>
          <h3>Election Observers</h3>
          <p>
            Supporting independent observation and verification throughout the
            electoral process.
          </p>
          <a href="#observers">Learn More &rarr;</a>
        </div>

        <div className="serve-card">
          <div className="serve-icon">
            <FiCheck />
          </div>
          <h3>Political Parties</h3>
          <p>
            Helping political parties engage in a fair, transparent and
            accountable electoral system.
          </p>
          <a href="#parties">Learn More &rarr;</a>
        </div>

        <div className="serve-card">
          <div className="serve-icon">
            <FiFileText />
          </div>
          <h3>Civil Society</h3>
          <p>
            Giving civil society organizations access to trustworthy electoral
            information and insights.
          </p>
          <a href="#society">Learn More &rarr;</a>
        </div>
      </div>
    </section>
  );
}

/* =========================
   PAGES
========================= */

function HowItWorksPage() {
  return (
    <section className="section page-section">
      <HowItWorksSection />
    </section>
  );
}

function WhoWeServePage() {
  return (
    <section className="section page-section">
      <WhoWeServeSection />
    </section>
  );
}

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-intro">
          <div className="login-brand">
            <div className="login-fingerprint">
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
          </div>

          <span className="eyebrow">SEIS ACCESS</span>
          <h1>
            Secure <span>Portal</span> Access
          </h1>
          <p>
            Access the SEIS demonstration platform to view system features and
            verification workflows.
          </p>

          <div className="login-points">
            <div>
              <FiCheck />
              <span>Multi-Factor Authentication</span>
            </div>
            <div>
              <FiCheck />
              <span>Encrypted Credentials</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-heading">
            <span className="eyebrow">SEIS ACCESS</span>
            <h2>Login</h2>
            <p>Access the SEIS demonstration platform.</p>
          </div>

          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiKey />
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button type="button" className="forgot-password">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="green-btn login-submit">
              Login
              <FiArrowRight />
            </button>
          </form>

          <div className="login-security">
            <FiShield />
            <span>256-bit SSL Encrypted Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   PROFESSIONAL FOOTER
========================= */

function Footer() {
  return (
    <footer className="footer section-dark">
      <div className="footer-container">
        <div className="footer-brand">
          <Logo />
          <p className="footer-desc">
            Empowering modern democracies with cryptographically verifiable,
            transparent, and resilient electoral infrastructure.
          </p>
          <div className="social-links">
            <a href="#github" aria-label="Github"><FiGithub /></a>
            <a href="#twitter" aria-label="Twitter"><FiTwitter /></a>
            <a href="#linkedin" aria-label="LinkedIn"><FiLinkedin /></a>
            <a href="#global" aria-label="Website"><FiGlobe /></a>
          </div>
        </div>

        <div className="footer-nav">
          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-list">
              <li><Link to="/features">Cryptographic Audit</Link></li>
              <li><Link to="/features">Biometric Auth</Link></li>
              <li><Link to="/how-it-works">Live Tallying</Link></li>
              <li><Link to="/features">Public Ledger</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Stakeholders</h4>
            <ul className="footer-list">
              <li><Link to="/who-we-serve">Electoral Commissions</Link></li>
              <li><Link to="/who-we-serve">Registered Voters</Link></li>
              <li><Link to="/who-we-serve">International Observers</Link></li>
              <li><Link to="/who-we-serve">Political Parties</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-list">
              <li><Link to="/about">About SEIS</Link></li>
              <li><Link to="/contact">System Security</Link></li>
              <li><Link to="/contact">Documentation</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SEIS Platform. All rights reserved.</p>
        <div className="legal-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#security">Security Specs</a>
        </div>
      </div>
    </footer>
  );
}

/* =========================
   PUBLIC LAYOUT WRAPPER
========================= */

function PublicLayout() {
  return (
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
  );
}

/* =========================
   APP ROUTER
========================= */

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Nested Full Dashboard Route */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
        </Route>

        {/* Public Marketing/Website Pages */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </Router>
  );
}