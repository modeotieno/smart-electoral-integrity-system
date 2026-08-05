import "./Features.css";

function Features() {
  return (
    <section className="features">
      <h2>Why Choose SEIS?</h2>

      <div className="features-grid">
        <div className="feature-card">
          <h3>🔒 Secure Voting</h3>
          <p>
            Advanced encryption protects every vote using modern security
            standards.
          </p>
        </div>

        <div className="feature-card">
          <h3>👤 Voter Verification</h3>
          <p>
            Biometric and secure identity verification helps prevent voter
            fraud.
          </p>
        </div>

        <div className="feature-card">
          <h3>📊 Transparent Results</h3>
          <p>
            Every vote can be verified, audited, and counted transparently.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features;