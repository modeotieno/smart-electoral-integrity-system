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
          demonstrate how digital election processes can be made more
          trustworthy.
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

            <button onClick={() => openInNewTab("/features")}>
              Learn More <FiArrowRight />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Register",
      text: "Eligible voters are securely registered within the election system.",
    },
    {
      number: "02",
      title: "Authenticate",
      text: "The system verifies the identity and authorization of the user.",
    },
    {
      number: "03",
      title: "Cast Vote",
      text: "An authorized voter securely participates in the voting process.",
    },
    {
      number: "04",
      title: "Verify",
      text: "Election information passes through verification and integrity checks.",
    },
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
        {steps.map((step) => (
          <div className="step" key={step.number}>
            <div className="step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
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
      items: ["Secure access", "Vote verification", "Transparent processes"],
    },
    {
      icon: FiUserCheck,
      title: "Election Officials",
      text: "Give authorized officials tools for monitoring election activities.",
      items: ["Election dashboard", "Results monitoring", "Audit records"],
    },
    {
      icon: FiSearch,
      title: "Observers",
      text: "Support election observation through accessible and verifiable information.",
      items: ["Process visibility", "Results verification", "Audit information"],
    },
    {
      icon: FiBarChart2,
      title: "Election Administrators",
      text: "Support administrators with structured election management information.",
      items: ["Polling stations", "Candidate information", "Election statistics"],
    },
  ];

  return (
    <section className="section serve-section">
      <div className="section-heading">
        <span className="eyebrow">WHO WE SERVE</span>
        <h2>Built for Election Stakeholders</h2>
        <p>
          SEIS is designed as a demonstration platform for different
          participants in the election ecosystem.
        </p>
      </div>

      <div className="serve-grid">
        {groups.map(({ icon: Icon, title, text, items }) => (
          <div className="serve-card" key={title}>
            <div className="serve-icon">
              <Icon />
            </div>

            <h3>{title}</h3>
            <p>{text}</p>

            <ul>
              {items.map((item) => (
                <li key={item}>
                  <FiCheck /> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
function ContactSection() {
  return (
    <section className="section contact-section">
      <div className="contact-details">
        <span className="eyebrow">CONTACT US</span>

        <h2>Have Questions About SEIS?</h2>

        <p>
          Learn more about our demonstration platform and how it showcases
          secure, transparent and verifiable election processes.
        </p>

        <p>
          <FiMail />
          otienomodesta505@gmail.communication
        </p>

        <p>
          <FiPhone />
          +254 727822752
        </p>

        <p>
          <FiMapPin />
          Kenya
        </p>
      </div>

      <form
        className="contact-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <input type="text" placeholder="Your Name" />
        <input type="email" placeholder="Your Email" />
        <input type="text" placeholder="Subject" />
        <textarea
          rows="5"
          placeholder="Your Message"
        />

        <button className="green-btn" type="submit">
          Send Message <FiArrowRight />
        </button>
      </form>
    </section>
  );
}

function HomeLayout() {
  return (
    <>
      <Hero />
      <Stats />
      <HomeAboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhoWeServeSection />
      <ContactSection />
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