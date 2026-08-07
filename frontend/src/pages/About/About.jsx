import "./About.css";
import {
  FaShieldAlt,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";

function About() {
  return (
    <section className="about">

      <div className="about-left">

        <span className="about-tag">
          About SEIS
        </span>

        <h2>
          Revolutionizing Electoral
          Integrity Through
          Technology
        </h2>

        <p>
          The Smart Electoral Integrity System (SEIS) provides a secure,
          transparent and verifiable digital voting platform designed
          to increase trust in elections through modern technology.
        </p>

        <div className="about-features">

          <div className="feature">
            <FaShieldAlt className="feature-icon" />
            <div>
              <h4>Secure Voting</h4>
              <p>Encrypted ballots and secure authentication.</p>
            </div>
          </div>

          <div className="feature">
            <FaLock className="feature-icon" />
            <div>
              <h4>Data Protection</h4>
              <p>Every vote is stored safely and cannot be altered.</p>
            </div>
          </div>

          <div className="feature">
            <FaCheckCircle className="feature-icon" />
            <div>
              <h4>Verified Results</h4>
              <p>Transparent counting with instant verification.</p>
            </div>
          </div>

        </div>

        <button className="learn-btn">
          Learn More
        </button>

      </div>

      <div className="about-right">

        <div className="dashboard-card">

          <div className="dashboard-title"></div>

          <div className="dashboard-bars">

            <div className="bar bar1"></div>
            <div className="bar bar2"></div>
            <div className="bar bar3"></div>
            <div className="bar bar4"></div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default About;