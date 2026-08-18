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
  useNavigate,
} from "react-router-dom";

import "./App.css";

/* =========================
   NAVIGATION
========================= */

const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Features", "/features"],
  ["How It Works", "/how-it-works"],
  ["Who We Serve", "/who-we-serve"],
  ["Contact", "/contact"],
];

/* =========================
   LOGO
========================= */

function Logo() {
  const navigate = useNavigate();

  return (
    <button
      className="brand"
      onClick={() => navigate("/")}
      aria-label="SEIS home"
      type="button"
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
    </button>
  );
}

/* =========================
   NAVBAR
========================= */

function Navbar() {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    setOpen(false);
    navigate(path);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <header className="navbar">

      {/* LOGO */}
      <Logo />

      {/* NAVIGATION */}
      <nav className={open ? "nav-links open" : "nav-links"}>

        {navItems.map(([label, path]) => {
          const isActive = location.pathname === path;

          return (
            <button
              key={path}
              type="button"
              className={isActive ? "active" : ""}
              onClick={() => handleNavigation(path)}
            >
              {label}
            </button>
          );
        })}

      </nav>

      {/* ACTION BUTTONS */}
      <div className="nav-actions">

        <button
          type="button"
          className="login-btn"
          onClick={() => handleNavigation("/login")}
        >
          <FiUserCheck />
          Login
        </button>

        <button
          type="button"
          className="green-btn small"
          onClick={() => handleNavigation("/contact")}
        >
          Get Started
        </button>

      </div>

      {/* MOBILE MENU */}
      <button
        type="button"
        className="mobile-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
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

          {/* SIDEBAR */}
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
                key={item}
                className={
                  index === 0
                    ? "dash-menu selected"
                    : "dash-menu"
                }
              >
                <FiBarChart2 />
                {item}
              </div>
            ))}

          </aside>

          {/* DASHBOARD CONTENT */}
          <div className="dash-main">

            <div className="dash-heading">

              <div>
                <b>Welcome, Election Official</b>

                <small>
                  General overview of the election
                </small>
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
   HERO
========================= */

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero section-dark">

      <div className="hero-copy">

        <span className="badge">
          Trusted. Transparent. Verifiable.
        </span>

        <h1>
          Smart Electoral
          <br />
          Integrity System
        </h1>

        <p>
          A secure demonstration platform that showcases
          transparent, verifiable and trustworthy digital
          elections.
        </p>

        <div className="hero-buttons">

          <button
            type="button"
            className="green-btn"
            onClick={() => navigate("/contact")}
          >
            Get Started
            <FiArrowRight />
          </button>

          <button
            type="button"
            className="outline-btn"
            onClick={() => navigate("/about")}
          >
            Learn More
            <FiArrowRight />
          </button>

        </div>

      </div>

      <DashboardMockup />

    </section>
  );
}

/* =========================
   STATS
========================= */

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

/* =========================
   HOME ABOUT SECTION
========================= */

function HomeAboutSection() {
  const navigate = useNavigate();

  return (
    <section className="section about-section">

      <div className="about-copy">

        <span className="eyebrow">
          ABOUT SEIS
        </span>

        <h2>
          Building Trust in Every Vote
        </h2>

        <p>
          SEIS demonstrates how transparency, security
          and verification can support trustworthy
          digital election processes.
        </p>

        <button
          type="button"
          className="green-btn"
          onClick={() => navigate("/about")}
        >
          Our Full Vision
          <FiArrowRight />
        </button>

      </div>

    </section>
  );
}

/* =========================
   FEATURES SECTION
========================= */

function FeaturesSection() {
  const navigate = useNavigate();

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

        <span className="eyebrow">
          KEY FEATURES
        </span>

        <h2>
          Designed for Election Integrity
        </h2>

        <p>
          SEIS brings together security, transparency
          and verification to demonstrate trustworthy
          digital elections.
        </p>

      </div>

      <div className="features-grid">

        {features.map(({ icon: Icon, title, text }) => (

          <div
            className="feature-card"
            key={title}
          >

            <div className="feature-icon">
              <Icon />
            </div>

            <h3>{title}</h3>

            <p>{text}</p>

            <button
              type="button"
              onClick={() => navigate("/features")}
            >
              Learn More
              <FiArrowRight />
            </button>

          </div>

        ))}

      </div>

    </section>
  );
}

/* =========================
   HOW IT WORKS
========================= */

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

        <span className="eyebrow">
          HOW IT WORKS
        </span>

        <h2>
          A Transparent Election Process
        </h2>

        <p>
          SEIS demonstrates a structured workflow designed
          to support secure, transparent and verifiable
          digital elections.
        </p>

      </div>

      <div className="steps">

        {steps.map((step) => (

          <div
            className="step"
            key={step.number}
          >

            <div className="step-number">
              {step.number}
            </div>

            <h3>{step.title}</h3>

            <p>{step.text}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

/* =========================
   WHO WE SERVE
========================= */

function WhoWeServeSection() {
  const groups = [
    {
      icon: FiUsers,
      title: "Voters",
      text: "Provide voters with a clear and trustworthy digital election experience.",
      items: [
        "Secure access",
        "Vote verification",
        "Transparent processes",
      ],
    },
    {
      icon: FiUserCheck,
      title: "Election Officials",
      text: "Give authorized officials tools for monitoring election activities.",
      items: [
        "Election dashboard",
        "Results monitoring",
        "Audit records",
      ],
    },
    {
      icon: FiSearch,
      title: "Observers",
      text: "Support election observation through accessible and verifiable information.",
      items: [
        "Process visibility",
        "Results verification",
        "Audit information",
      ],
    },
    {
      icon: FiBarChart2,
      title: "Election Administrators",
      text: "Support administrators with structured election management information.",
      items: [
        "Polling stations",
        "Candidate information",
        "Election statistics",
      ],
    },
  ];

  return (
    <section className="section serve-section">

      <div className="section-heading">

        <span className="eyebrow">
          WHO WE SERVE
        </span>

        <h2>
          Built for Election Stakeholders
        </h2>

        <p>
          SEIS is designed as a demonstration platform
          for participants in the election ecosystem.
        </p>

      </div>

      <div className="serve-grid">

        {groups.map(
          ({ icon: Icon, title, text, items }) => (

            <div
              className="serve-card"
              key={title}
            >

              <div className="serve-icon">
                <Icon />
              </div>

              <h3>{title}</h3>

              <p>{text}</p>

              <ul>
                {items.map((item) => (
                  <li key={item}>
                    <FiCheck />
                    {item}
                  </li>
                ))}
              </ul>

            </div>

          )
        )}

      </div>

    </section>
  );
}

/* =========================
   CONTACT SECTION
========================= */

function ContactSection() {
  return (
    <section className="section contact-section">

      <div className="contact-details">

        <span className="eyebrow">
          CONTACT US
        </span>

        <h2>
          Have Questions About SEIS?
        </h2>

        <p>
          Learn more about our demonstration platform
          and how it showcases secure, transparent and
          verifiable election processes.
        </p>

        <p>
          <FiMail />
          otienomodesta505@gmail.com
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

        <input
          type="text"
          placeholder="Your Name"
        />

        <input
          type="email"
          placeholder="Your Email"
        />

        <input
          type="text"
          placeholder="Subject"
        />

        <textarea
          rows="5"
          placeholder="Your Message"
        />

        <button
          type="submit"
          className="green-btn"
        >
          Send Message
          <FiArrowRight />
        </button>

      </form>

    </section>
  );
}

/* =========================
   HOME LAYOUT
========================= */

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

/* =========================
   ABOUT PAGE
========================= */

function AboutPage() {
  return (
    <section className="section page-section">

      <span className="eyebrow">
        ABOUT SEIS
      </span>

      <h1>
        About Smart Electoral Integrity System
      </h1>

      <p>
        SEIS is a demonstration platform designed to
        explore secure, transparent and verifiable
        digital election processes.
      </p>

      <p>
        The platform demonstrates concepts such as
        secure authentication, controlled access,
        audit trails, verification and transparent
        election monitoring.
      </p>

    </section>
  );
}

/* =========================
   FEATURES PAGE
========================= */

function FeaturesPage() {
  return (
    <section className="section page-section">

      <span className="eyebrow">
        FEATURES
      </span>

      <h1>SEIS Features</h1>

      <div className="features-grid">

        <div className="feature-card">
          <FiShield />

          <h3>
            Secure Authentication
          </h3>

          <p>
            Secure access for authorized users.
          </p>
        </div>

        <div className="feature-card">
          <FiLock />

          <h3>
            Data Protection
          </h3>

          <p>
            Protection of sensitive election information.
          </p>
        </div>

        <div className="feature-card">
          <FiCheck />

          <h3>
            Vote Verification
          </h3>

          <p>
            Verification workflows for election information.
          </p>
        </div>

        <div className="feature-card">
          <FiFileText />

          <h3>
            Audit Trail
          </h3>

          <p>
            Traceable records of important system activities.
          </p>
        </div>

      </div>

    </section>
  );
}

/* =========================
   HOW IT WORKS PAGE
========================= */

function HowItWorksPage() {
  return (
    <section className="section page-section">

      <span className="eyebrow">
        HOW IT WORKS
      </span>

      <h1>How SEIS Works</h1>

      <div className="steps">

        <div className="step">
          <div className="step-number">01</div>
          <h3>Register</h3>
          <p>
            Eligible voters are registered securely.
          </p>
        </div>

        <div className="step">
          <div className="step-number">02</div>
          <h3>Authenticate</h3>
          <p>
            The system verifies the user's identity.
          </p>
        </div>

        <div className="step">
          <div className="step-number">03</div>
          <h3>Cast Vote</h3>
          <p>
            An authorized voter participates in the
            voting process.
          </p>
        </div>

        <div className="step">
          <div className="step-number">04</div>
          <h3>Verify</h3>
          <p>
            Election information goes through integrity
            checks.
          </p>
        </div>

      </div>

    </section>
  );
}

/* =========================
   WHO WE SERVE PAGE
========================= */

function WhoWeServePage() {
  return (
    <section className="section page-section">

      <span className="eyebrow">
        WHO WE SERVE
      </span>

      <h1>
        Election Stakeholders
      </h1>

      <div className="serve-grid">

        <div className="serve-card">
          <FiUsers />

          <h3>Voters</h3>

          <p>
            A clear and trustworthy digital election
            experience.
          </p>
        </div>

        <div className="serve-card">
          <FiUserCheck />

          <h3>
            Election Officials
          </h3>

          <p>
            Tools for monitoring election activities.
          </p>
        </div>

        <div className="serve-card">
          <FiSearch />

          <h3>Observers</h3>

          <p>
            Accessible election information and
            verification.
          </p>
        </div>

        <div className="serve-card">
          <FiBarChart2 />

          <h3>Administrators</h3>

          <p>
            Structured election management information.
          </p>
        </div>

      </div>

    </section>
  );
}

/* =========================
   CONTACT PAGE
========================= */

function ContactPage() {
  return (
    <section className="section page-section">

      <span className="eyebrow">
        CONTACT
      </span>

      <h1>Contact SEIS</h1>

      <p>
        Have questions about the Smart Electoral
        Integrity System?
      </p>

      <div className="contact-details">

        <p>
          <FiMail />
          otienomodesta505@gmail.com
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

    </section>
  );
}

/* =========================
   LOGIN PAGE
========================= */

function LoginPage() {
  return (
    <section className="login-page">
      <div className="login-container">

        {/* LEFT SIDE */}
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

          <span className="eyebrow">SECURE ACCESS</span>

          <h1>
            Welcome back to
            <span> SEIS</span>
          </h1>

          <p>
            Access the Smart Electoral Integrity System
            demonstration platform and explore secure,
            transparent and verifiable election processes.
          </p>

          <div className="login-points">
            <div>
              <FiShield />
              <span>Secure authentication</span>
            </div>

            <div>
              <FiLock />
              <span>Protected election data</span>
            </div>

            <div>
              <FiCheck />
              <span>Transparent verification</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-card">

          <div className="login-heading">
            <span className="eyebrow">SEIS ACCESS</span>

            <h2>Sign in</h2>

            <p>
              Enter your credentials to continue.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={(e) => e.preventDefault()}
          >

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">
                <FiMail />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <FiLock />

                <input
                  id="password"
                  type="password"
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

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>
            </div>

            <button
              className="green-btn login-submit"
              type="submit"
            >
              Login
              <FiArrowRight />
            </button>

          </form>

          <div className="login-security">
            <FiShield />

            <span>
              Your access is protected by secure
              authentication.
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}

/* =========================
   FOOTER
========================= */

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer section-dark">

      <div className="footer-content">

        {/* FOOTER LOGO */}
        <button
          type="button"
          className="footer-brand"
          onClick={() => {
            navigate("/");
            window.scrollTo(0, 0);
          }}
        >
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
        </button>

        {/* FOOTER LINKS */}
        <div className="footer-links">

          <button
            type="button"
            onClick={() => navigate("/about")}
          >
            About
          </button>

          <button
            type="button"
            onClick={() => navigate("/features")}
          >
            Features
          </button>

          <button
            type="button"
            onClick={() => navigate("/contact")}
          >
            Contact
          </button>

        </div>

      </div>

      <p className="footer-copy">
        &copy; {new Date().getFullYear()} SEIS. All rights reserved.
      </p>

    </footer>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  return (
    <Router>

      <div className="app-container">

        <Navbar />

        <main className="main-content">

          <Routes>

            <Route
              path="/"
              element={<HomeLayout />}
            />

            <Route
              path="/about"
              element={<AboutPage />}
            />

            <Route
              path="/features"
              element={<FeaturesPage />}
            />

            <Route
              path="/how-it-works"
              element={<HowItWorksPage />}
            />

            <Route
              path="/who-we-serve"
              element={<WhoWeServePage />}
            />

            <Route
              path="/contact"
              element={<ContactPage />}
            />

            <Route
              path="/login"
              element={<LoginPage />}
            />

          </Routes>

        </main>

        <Footer />

      </div>

    </Router>
  );
}