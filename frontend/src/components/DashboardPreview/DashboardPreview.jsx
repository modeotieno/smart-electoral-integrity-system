import "./DashboardPreview.css";

function DashboardPreview() {
  return (
    <section className="dashboard-preview">

      <div className="dashboard-text">
        <h2>Platform Dashboard Preview</h2>

        <p>
          SEIS provides secure dashboards for candidates, election officials,
          voters, and observers to monitor election activities with confidence.
        </p>

        <button>Explore Dashboard</button>
      </div>

      <div className="dashboard-card">

        <div className="dashboard-header">
          <h3>SEIS Dashboard</h3>
        </div>

        <div className="stats">

          <div className="stat-box">
            <h4>2.5M</h4>
            <p>Registered Voters</p>
          </div>

          <div className="stat-box">
            <h4>18</h4>
            <p>Candidates</p>
          </div>

          <div className="stat-box">
            <h4>46K</h4>
            <p>Polling Stations</p>
          </div>

          <div className="stat-box">
            <h4>87%</h4>
            <p>Results Submitted</p>
          </div>

        </div>

        <div className="progress-section">
          <h4>Election Progress</h4>

          <div className="progress-bar">
            <div className="progress"></div>
          </div>
        </div>

        <div className="notifications">

          <h4>Latest Updates</h4>

          <p>✅ Polling Station 24 submitted results</p>

          <p>✅ County results updated</p>

          <p>✅ Audit verification completed</p>

        </div>

      </div>

    </section>
  );
}

export default DashboardPreview;