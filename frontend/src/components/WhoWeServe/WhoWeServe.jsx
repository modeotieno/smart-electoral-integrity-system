import "./WhoWeServe.css";

function WhoWeServe() {
  return (
    <section id="who-we-serve" className="who-we-serve">

      <h2>Who We Serve</h2>

      <p className="subtitle">
        SEIS empowers every stakeholder in the electoral process through
        secure, transparent and trusted digital election solutions.
      </p>

      <div className="users-grid">

        <div className="user-card">
          <div className="user-icon">🗳️</div>

          <h3>Voters</h3>

          <p>
            Register securely, verify your identity, cast your vote and
            confidently view official election results.
          </p>

          <ul>
            <li>✔ Secure Registration</li>
            <li>✔ Identity Verification</li>
            <li>✔ Vote Securely</li>
            <li>✔ View Results</li>
          </ul>
        </div>

        <div className="user-card">
          <div className="user-icon">🎤</div>

          <h3>Candidates</h3>

          <p>
            Monitor election progress and verify that official results
            accurately reflect published election data.
          </p>

          <ul>
            <li>✔ Candidate Dashboard</li>
            <li>✔ Polling Station Updates</li>
            <li>✔ Result Verification</li>
            <li>✔ Download Reports</li>
          </ul>
        </div>

        <div className="user-card">
          <div className="user-icon">🏛️</div>

          <h3>Election Officials</h3>

          <p>
            Efficiently manage elections from voter registration to
            publishing official election results.
          </p>

          <ul>
            <li>✔ Manage Elections</li>
            <li>✔ Register Candidates</li>
            <li>✔ Verify Voters</li>
            <li>✔ Publish Results</li>
          </ul>
        </div>

        <div className="user-card">
          <div className="user-icon">👁️</div>

          <h3>Observers</h3>

          <p>
            Independently monitor election transparency and review
            published audit information.
          </p>

          <ul>
            <li>✔ Audit Logs</li>
            <li>✔ Transparency Reports</li>
            <li>✔ Election Monitoring</li>
            <li>✔ Public Verification</li>
          </ul>
        </div>

      </div>

    </section>
  );
}

export default WhoWeServe;