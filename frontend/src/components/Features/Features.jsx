import "./Features.css";

function Features() {
  return (
    <section id="features" className="features">

      <h2>Why Choose SEIS?</h2>

      <p className="features-subtitle">
        Everything you need to conduct secure, transparent and trustworthy
        digital elections.
      </p>

      <div className="features-grid">

        <div className="feature-card">
          <div className="icon">🔒</div>

          <h3>Secure Voting</h3>

          <p>
            Protect every vote using modern encryption and secure vote storage.
          </p>

          <button>Learn More</button>
        </div>

        <div className="feature-card">
          <div className="icon">👤</div>

          <h3>Identity Verification</h3>

          <p>
            Verify voters using secure authentication and identity checks.
          </p>

          <button>Learn More</button>
        </div>

        <div className="feature-card">
          <div className="icon">📊</div>

          <h3>Transparent Results</h3>

          <p>
            Publish auditable election results with complete transparency.
          </p>

          <button>Learn More</button>
        </div>

        <div className="feature-card">
          <div className="icon">🎤</div>

          <h3>Candidate Dashboard</h3>

          <p>
            Allow candidates to monitor election progress and verify official
            results.
          </p>

          <button>Learn More</button>
        </div>

        <div className="feature-card">
          <div className="icon">🛡️</div>

          <h3>Security & Integrity</h3>

          <p>
            Built with audit logs, secure access, and data protection.
          </p>

          <button>Learn More</button>
        </div>

        <div className="feature-card">
          <div className="icon">📈</div>

          <h3>Reports & Analytics</h3>

          <p>
            Generate election reports and visualize official statistics.
          </p>

          <button>Learn More</button>
        </div>

      </div>

    </section>
  );
}

export default Features;