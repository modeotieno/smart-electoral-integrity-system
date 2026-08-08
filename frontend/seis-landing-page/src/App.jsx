import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiClock,
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
import "./App.css";

const navItems = [
  ["Home", "home"],
  ["About", "about"],
  ["Features", "features"],
  ["How It Works", "how-it-works"],
  ["Who We Serve", "who-we-serve"],
  ["Contact", "contact"],
];

function Logo() {
  return (
    <a href="#home" className="brand" aria-label="SEIS home">
      <div className="fingerprint" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div>
        <strong>SEIS</strong>
        <small>SMART ELECTORAL<br />INTEGRITY SYSTEM</small>
      </div>
    </a>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="navbar">
      <Logo />

      <nav className={open ? "nav-links open" : "nav-links"}>
        {navItems.map(([label, id]) => (
          <button
            key={id}
            className={id === "home" ? "active" : ""}
            onClick={() => go(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="nav-actions">
        <button className="login-btn" onClick={() => go("contact")}>
          <FiUserCheck /> Login
        </button>
        <button className="green-btn small" onClick={() => go("contact")}>
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
            <div className="dash-logo"><span className="mini-fingerprint" /> SEIS</div>
            {["Dashboard", "Voters", "Candidates", "Polling Stations", "Results", "Reports", "Audit Logs", "Settings"].map((x, i) => (
              <div className={i === 0 ? "dash-menu selected" : "dash-menu"} key={x}>
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
              <span>◦ ◦</span>
            </div>

            <div className="dash-cards">
              <div><small>Registered Voters</small><b>2.5M+</b></div>
              <div><small>Candidates</small><b>18</b></div>
              <div><small>Polling Stations</small><b>1,250</b></div>
              <div><small>Results Submitted</small><b>99.9%</b></div>
            </div>

            <div className="dash-grid">
              <div className="dash-panel">
                <b>Results Submission Progress</b>
                <div className="donut"><span>99.9%<small>Submitted</small></span></div>
              </div>
              <div className="dash-panel activity">
                <b>Recent Activity</b>
                <p><FiCheck /> Polling Station 1250 submitted results <small>2 min ago</small></p>
                <p><FiCheck /> County results updated <small>15 min ago</small></p>
                <p><FiCheck /> Audit verification completed <small>1 hour ago</small></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="phone">
        <div className="phone-top" />
        <div className="phone-content">
          <div className="phone-brand"><span className="mini-fingerprint" /> SEIS</div>
          <h3>Your Vote<br /><span>Your Future</span></h3>
          <p>Make your vote count.<br />Secure. Simple. Trusted.</p>
          <div className="shield">✓</div>
          <button>Cast Your Vote</button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="hero section-dark">
      <div className="hero-copy">
        <span className="badge">Trusted. Transparent. Verifiable.</span>
        <h1>Smart Electoral<br />Integrity System</h1>
        <p>A secure demonstration platform that showcases transparent, verifiable and trustworthy digital elections.</p>
        <div className="hero-buttons">
          <button className="green-btn" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
            Get Started <FiArrowRight />
          </button>
          <button className="outline-btn" onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
            Learn More <FiArrowRight />
          </button>
        </div>
      </div>
      <DashboardMockup />
    </section>
  );
}

const stats = [
  [FiUsers, "2.5M+", "Registered Voters"],
  [FiUserCheck, "18", "Candidates"],
  [FiMapPin, "1,250", "Polling Stations"],
  [FiPieChart, "99.9%", "System Uptime"],
];

function Stats() {
  return (
    <section className="stats-wrap">
      <div className="stats-card">
        {stats.map(([Icon, value, label]) => (
          <div className="stat" key={label}>
            <div className="stat-icon"><Icon /></div>
            <div><b>{value}</b><span>{label}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section about-section">
      <div className="about-copy">
        <span className="eyebrow">ABOUT SEIS</span>
        <h2>Building Trust in Every Vote</h2>
        <p>
          SEIS is designed to ensure transparency, security and accountability
          in every stage of the electoral process. From voter registration to
          result declaration, our platform empowers all stakeholders with
          real-time information and verifiable data.
        </p>
        <button className="outline-green">Learn More About SEIS <FiArrowRight /></button>
      </div>

      <div className="election-illustration">
        <div className="floating-card person"><FiUserCheck /></div>
        <div className="floating-card lock"><FiLock /></div>
        <div className="ballot-box"><div className="slot" /><div className="box-check">✓</div><div className="box-fingerprint">◎</div></div>
      </div>

      <div className="overview">
        <span className="eyebrow">PLATFORM DASHBOARD PREVIEW</span>
        <h2>Real-Time Election Overview</h2>
        <p>SEIS provides secure dashboards for candidates, election officials, voters, and observers to monitor election activities with confidence.</p>
        <button className="dashboard-btn">Explore Dashboard <FiArrowRight /></button>
        <div className="mini-dashboard">
          <div className="mini-side"><b>SEIS</b><span className="selected">Dashboard</span><span>Voters</span><span>Candidates</span><span>Polling Stations</span><span>Results</span></div>
          <div className="mini-main">
            <div className="mini-stats"><b>2.5M</b><b>18</b><b>1,250</b><b>99.9%</b></div>
            <div className="progress-row"><b>Results Submission Progress</b><div><span /></div><small>99.9%</small></div>
            <div className="updates"><b>Latest Updates</b><p><FiCheck /> Polling Station submitted results</p><p><FiCheck /> County results updated</p><p><FiCheck /> Audit verification completed</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  [FiLock, "Secure Voting", "Protect every vote using modern encryption and secure vote storage."],
  [FiUserCheck, "Identity Verification", "Verify voters using secure authentication and identity checks."],
  [FiBarChart2, "Transparent Results", "Publish auditable election results with complete transparency."],
  [FiUsers, "Candidate Dashboard", "Allow candidates to monitor election progress and verify official results."],
  [FiShield, "Security & Integrity", "Built with audit logs, secure access, and data protection."],
  [FiFileText, "Reports & Analytics", "Generate election reports and visualize official statistics."],
];

function Features() {
  return (
    <section id="features" className="section features-section">
      <div className="section-heading">
        <span className="eyebrow">ELECTION FEATURES</span>
        <h2>Why Choose SEIS?</h2>
        <p>Everything you need to conduct secure, transparent and trustworthy digital elections.</p>
      </div>
      <div className="features-grid">
        {features.map(([Icon, title, text]) => (
          <article className="feature-card" key={title}>
            <div className="feature-icon"><Icon /></div>
            <h3>{title}</h3>
            <p>{text}</p>
            <button>Learn More <FiArrowRight /></button>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "Register", "Create your secure account."],
    ["02", "Verify Identity", "Complete identity verification before voting."],
    ["03", "Cast Your Vote", "Vote securely using encrypted technology."],
    ["04", "Verify Results", "Published results can be independently verified."],
  ];
  return (
    <section id="how-it-works" className="section how-section">
      <div className="section-heading">
        <span className="eyebrow">HOW IT WORKS</span>
        <h2>A Simple, Secure Election Journey</h2>
      </div>
      <div className="steps">
        {steps.map(([n, title, text]) => (
          <article className="step" key={n}>
            <div className="step-number">{n}</div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhoWeServe() {
  const people = [
    [FiUsers, "Voters", "Register securely, verify your identity, cast your vote and confidently view official election results."],
    [FiUserCheck, "Candidates", "Monitor election progress and verify that official results accurately reflect published election data."],
    [FiShield, "Election Officials", "Efficiently manage elections from voter registration to publishing official election results."],
    [FiSearch, "Observers", "Independently monitor election transparency and review published audit information."],
  ];
  return (
    <section id="who-we-serve" className="section serve-section">
      <div className="section-heading">
        <span className="eyebrow">WHO WE SERVE</span>
        <h2>Built for Every Electoral Stakeholder</h2>
        <p>SEIS empowers every stakeholder in the electoral process through secure, transparent and trusted digital election solutions.</p>
      </div>
      <div className="serve-grid">
        {people.map(([Icon, title, text]) => (
          <article className="serve-card" key={title}>
            <div className="serve-icon"><Icon /></div>
            <h3>{title}</h3>
            <p>{text}</p>
            <ul><li><FiCheck /> Secure access</li><li><FiCheck /> Real-time information</li><li><FiCheck /> Verifiable results</li></ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="contact-copy">
        <span className="eyebrow">CONTACT SEIS</span>
        <h2>Let's Build Trust in Every Vote</h2>
        <p>Have a question, feedback, or want to learn more about the Smart Electoral Integrity System? Reach out to us.</p>
        <div className="contact-details">
          <p><FiMail /> info@seis.org</p>
          <p><FiPhone /> +254 700 000 000</p>
          <p><FiMapPin /> Kisumu, Kenya</p>
        </div>
      </div>
      <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
        <input placeholder="Your Name" />
        <input type="email" placeholder="Your Email" />
        <input placeholder="Subject" />
        <textarea rows="5" placeholder="Write your message..." />
        <button className="green-btn" type="submit">Send Message <FiArrowRight /></button>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <Logo />
      <p>© 2026 Smart Electoral Integrity System. Secure. Transparent. Verifiable.</p>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <Features />
        <HowItWorks />
        <WhoWeServe />
        <Contact />
      </main>
      <Footer />
    </>
  );
}