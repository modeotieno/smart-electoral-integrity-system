import { Link } from "react-router-dom";
import "./AboutPreview.css";

function AboutPreview() {
  return (
    <section className="about-preview">

      <div className="about-text">
        <h2>About SEIS</h2>

        <p>
          Smart Electoral Integrity System (SEIS) is a secure digital election
          platform that promotes transparency, accountability, and trust
          throughout the election process.
        </p>

        <Link to="/about" className="learn-btn">
          Learn More →
        </Link>
      </div>

      <div className="about-image">
        <img src="/hero.png" alt="SEIS" />
      </div>

    </section>
  );
}

export default AboutPreview;