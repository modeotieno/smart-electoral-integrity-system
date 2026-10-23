import { Link } from "react-router-dom";
import {
  FiBarChart2,
  FiCheck,
  FiFileText,
  FiLock,
  FiMapPin,
  FiPieChart,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import VotingScene from "../VotingScene";

export function DashboardMockup() {
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

export function Hero() {
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
          <Link to="/signup" className="green-btn">
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

export function Stats() {
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

export function HowItWorksSection() {
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

export function WhoWeServeSection() {
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

export function HomeLayout() {
  return (
    <>
      <Hero />
      <Stats />
      <VotingScene />
      <HowItWorksSection />
      <WhoWeServeSection />
    </>
  );
}

export function HowItWorksPage() {
  return (
    <section className="section page-section">
      <HowItWorksSection />
    </section>
  );
}

export function WhoWeServePage() {
  return (
    <section className="section page-section">
      <WhoWeServeSection />
    </section>
  );
}
