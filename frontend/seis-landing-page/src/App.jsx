import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiFileText,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPieChart,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUsers,
  FiMenu,
  FiX,
  FiKey,
} from "react-icons/fi";

import { useState } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Link,
} from "react-router-dom";

import AboutPage from "./pages/About/About";
import FeaturesPage from "./pages/Features/Features";
import ContactPage from "./pages/Contact/Contact";

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

        <Link to="/contact" className="green-btn small">
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
   DASHBOARD MOCKUP
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
   HOME CONTENT ONLY
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
          <Link to="/contact" className="green-btn">
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
    </>
  );
}

/* =========================
   SECTIONS FOR OTHER ROUTES
========================= */

function FeaturesSection() {
  const features = [
    {
      icon: FiShield,
      title: "Secure Authentication",
      text: "Protect voter and election-official access through secure authentication and authorization.",
    },
    {
      icon: FiLock,
      title: "Data Protection",
      text: "Protect sensitive election information through secure digital communication and controlled access.",
    },
    {
      icon: FiCheck,
      title: "Vote Verification",
      text: "Support verification workflows that help confirm the integrity of election information.",
    },
    {
      icon: FiFileText,
      title: "Audit Trail",
      text: "Maintain a traceable record of important election activities for accountability.",
    },
    {
      icon: FiBarChart2,
      title: "Results Monitoring",
      text: "Give authorized officials a clear overview of election statistics and results.",
    },
    {
      icon: FiSearch,
      title: "Transparency",
      text: "Make important election processes easier to monitor, understand and verify.",
    },
  ];

  return (
    <section className="section features-section">
      <div className="section-heading">
        <span className="eyebrow">KEY FEATURES</span>
        <h2>Designed for Election Integrity</h2>
        <p>
          SEIS brings together security, transparency and verification to
          demonstrate trustworthy digital elections.
        </p>
      </div>

      <div className="features-grid">
        {features.map(({ icon: Icon, title, text }) => (
          <div className="feature-card" key={title}>
            <div className="feature-icon">
              <Icon />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <Link to="/features">
              Learn More
              <FiArrowRight />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    ["01", "Register", "Eligible voters are securely registered within the election system."],
    ["02", "Authenticate", "The system verifies the identity and authorization of the user."],
    ["03", "Cast Vote", "An authorized voter securely participates in the voting process."],
    ["04", "Verify", "Election information passes through verification and integrity checks."],
  ];

  return (
    <section className="section how-section">
      <div className="section-heading">
        <span className="eyebrow">HOW IT WORKS</span>
        <h2>A Transparent Election Process</h2>
        <p>
          SEIS demonstrates a structured workflow designed to support secure,
          transparent and verifiable digital elections.
        </p>
      </div>

      <div className="steps">
        {steps.map(([number, title, text]) => (
          <div className="step" key={number}>
            <div className="step-number">{number}</div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhoWeServeSection() {
  const groups = [
    {
      icon: FiUsers,
      title: "Voters",
      text: "Provide voters with a clear and trustworthy digital election experience.",
    },
    {
      icon: FiUserCheck,
      title: "Election Officials",
      text: "Give authorized officials tools for monitoring election activities.",
    },
    {
      icon: FiSearch,
      title: "Observers",
      text: "Support election observation through accessible and verifiable information.",
    },
    {
      icon: FiBarChart2,
      title: "Election Administrators",
      text: "Support administrators with structured election management information.",
    },
  ];

  return (
    <section className="section serve-section">
      <div className="section-heading">
        <span className="eyebrow">WHO WE SERVE</span>
        <h2>Built for Election Stakeholders</h2>
        <p>
          SEIS is designed as a demonstration platform for participants in the
          election ecosystem.
        </p>
      </div>

      <div className="serve-grid">
        {groups.map(({ icon: Icon, title, text }) => (
          <div className="serve-card" key={title}>
            <div className="serve-icon">
              <Icon />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <Link to="/who-we-serve">
              Learn More
              <FiArrowRight />
            </Link>
          </div>
        ))}
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
   FOOTER
========================= */

function Footer() {
  return (
    <footer className="footer section-dark">
      <p>© {new Date().getFullYear()} SEIS. All rights reserved.</p>
    </footer>
  );
}

/* =========================
   APP ROUTER
========================= */

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