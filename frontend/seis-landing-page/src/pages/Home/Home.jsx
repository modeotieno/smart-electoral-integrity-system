import React from "react";

// Inline SVG components for icons
const UsersIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CandidateIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LocationIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UptimeIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const DashboardIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const LockIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CheckIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function HomeSection({ onNavigate }) {
  return (
    <>
      {/* HERO SECTION */}
      <section className="section-dark">
        <div className="hero">
          <div className="hero-copy">
            <span className="badge">Trusted. Transparent. Verifiable.</span>
            <h1>Smart Electoral Integrity System</h1>
            <p>
              A secure demonstration platform that showcases transparent,
              verifiable and trustworthy digital elections.
            </p>
            <div className="hero-buttons">
              <button
                className="green-btn"
                onClick={() => onNavigate && onNavigate("features")}
              >
                Get Started <ArrowRightIcon />
              </button>
              <button
                className="outline-btn"
                onClick={() => onNavigate && onNavigate("about")}
              >
                Learn More <ArrowRightIcon />
              </button>
            </div>
          </div>

          {/* DASHBOARD PREVIEW MOCKUP */}
          <div className="visual-wrap">
            <div className="network network-one"></div>
            <div className="network network-two"></div>
            <div className="laptop">
              <div className="laptop-camera"></div>
              <div className="dashboard">
                <div className="dash-sidebar">
                  <div className="dash-logo">
                    <div className="mini-fingerprint"></div>
                    <span>SEIS</span>
                  </div>
                  <div className="dash-menu selected">
                    <DashboardIcon /> Dashboard
                  </div>
                  <div className="dash-menu">
                    <UsersIcon /> Voters
                  </div>
                  <div className="dash-menu">
                    <CandidateIcon /> Candidates
                  </div>
                  <div className="dash-menu">
                    <LocationIcon /> Polling Stations
                  </div>
                  <div className="dash-menu">
                    <CheckIcon /> Results
                  </div>
                </div>

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
        </div>
      </section>

      {/* STATS OVERLAY BAR */}
      <div className="stats-wrap">
        <div className="stats-card">
          <div className="stat">
            <div className="stat-icon">
              <UsersIcon />
            </div>
            <div>
              <b>2.5M+</b>
              <span>Registered Voters</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon">
              <CandidateIcon />
            </div>
            <div>
              <b>18</b>
              <span>Candidates</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon">
              <LocationIcon />
            </div>
            <div>
              <b>1,250</b>
              <span>Polling Stations</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon">
              <UptimeIcon />
            </div>
            <div>
              <b>99.9%</b>
              <span>System Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section className="section features-section" id="features">
        <div className="section-heading">
          <span className="eyebrow">CORE FEATURES</span>
          <h2>Built for Uncompromising Electoral Integrity</h2>
          <p>
            Our platform combines cutting-edge cryptographic verification with
            intuitive user controls.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <LockIcon />
            </div>
            <h3>Cryptographic Verification</h3>
            <p>
              Every vote is mathematically sealed and auditable using zero-knowledge
              proof principles without compromising ballot privacy.
            </p>
            <a href="#learn">
              Explore Tech <ArrowRightIcon />
            </a>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <UsersIcon />
            </div>
            <h3>Biometric Voter Auth</h3>
            <p>
              Multi-factor identification ensure only registered citizens cast a
              single ballot across authorized nodes.
            </p>
            <a href="#learn">
              Explore Tech <ArrowRightIcon />
            </a>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <CheckIcon />
            </div>
            <h3>Real-time Tallying</h3>
            <p>
              Automated precinct aggregation provides immediate, verifiable results
              transmission to oversight boards.
            </p>
            <a href="#learn">
              Explore Tech <ArrowRightIcon />
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="section-heading">
          <span className="eyebrow">WORKFLOW</span>
          <h2>How SEIS Ensures Fair Results</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">01</span>
              <div className="step-icon">
                <UsersIcon />
              </div>
            </div>
            <h3>Voter Registration</h3>
            <p>Citizens verify identity through secure biometric channels.</p>
          </div>
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">02</span>
              <div className="step-icon">
                <LockIcon />
              </div>
            </div>
            <h3>Ballot Casting</h3>
            <p>Encrypted choices are processed with instantaneous cryptographic hashes.</p>
          </div>
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">03</span>
              <div className="step-icon">
                <CheckIcon />
              </div>
            </div>
            <h3>Audit & Verification</h3>
            <p>Independent observers validate hashes across distributed nodes.</p>
          </div>
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">04</span>
              <div className="step-icon">
                <DashboardIcon />
              </div>
            </div>
            <h3>Public Reporting</h3>
            <p>Final results are published transparently on the public ledger dashboard.</p>
          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="serve-section" id="who-we-serve">
        <div className="serve-header">
          <span className="eyebrow">STAKEHOLDERS</span>
          <h2>
            Designed for <span>Every Participant</span> in the Process
          </h2>
        </div>
        <div className="serve-grid">
          <div className="serve-card">
            <div className="serve-icon">
              <UsersIcon />
            </div>
            <h3>Electoral Commissions</h3>
            <p>Comprehensive oversight tools and live monitoring dashboards for official administrators.</p>
            <a href="#commissions">
              Learn options <ArrowRightIcon />
            </a>
          </div>
          <div className="serve-card featured">
            <div className="serve-icon">
              <CheckIcon />
            </div>
            <h3>Citizens & Voters</h3>
            <p>Easy-to-use digital tools with receipt verification to ensure votes are correctly counted.</p>
            <a href="#voters">
              Learn options <ArrowRightIcon />
            </a>
          </div>
          <div className="serve-card">
            <div className="serve-icon">
              <LocationIcon />
            </div>
            <h3>International Observers</h3>
            <p>Open access API channels for independent auditing bodies and civil rights organizations.</p>
            <a href="#observers">
              Learn options <ArrowRightIcon />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomeSection;