import "./Hero.css";
import { FaArrowRight } from "react-icons/fa";

function Hero() {
  return (
    <section className="hero">

      {/* Background decorations */}
      <div className="shape one"></div>
      <div className="shape two"></div>

      {/* Left Content */}
      <div className="hero-left">

        <span className="hero-badge">
          Trusted. Transparent. Verifiable.
        </span>

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
          <button className="primary-btn">
            Get Started
            <FaArrowRight />
          </button>

          <button className="secondary-btn">
            Learn More
            <FaArrowRight />
          </button>
        </div>

      </div>

      {/* Right Content */}
      <div className="hero-right">

        <div className="laptop">

          <div className="screen">

            <div className="dashboard-header"></div>

            <div className="dashboard-content">

              <div className="sidebar">
                <div className="menu"></div>
                <div className="menu"></div>
                <div className="menu"></div>
                <div className="menu"></div>
                <div className="menu"></div>
              </div>

              <div className="main-dashboard">

                <div className="top-cards">
                  <div className="card"></div>
                  <div className="card"></div>
                  <div className="card"></div>
                </div>

                <div className="chart"></div>

                <div className="bottom-row">
                  <div className="small-card"></div>
                  <div className="small-card"></div>
                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="phone">
          <div className="phone-screen">
            <div className="vote-card"></div>
          </div>
        </div>

      </div>

    </section>
  );
}

export default Hero;