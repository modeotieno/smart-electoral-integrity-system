import { Link } from "react-router-dom";
import {
  FiGithub,
  FiGlobe,
  FiLinkedin,
  FiTwitter,
} from "react-icons/fi";
import { Logo } from "./Navbar";

export default function Footer() {
  return (
    <footer className="footer section-dark">
      <div className="footer-container">
        <div className="footer-brand">
          <Logo />
          <p className="footer-desc">
            Empowering modern democracies with cryptographically verifiable,
            transparent, and resilient electoral infrastructure.
          </p>
          <div className="social-links">
            <a href="#github" aria-label="Github"><FiGithub /></a>
            <a href="#twitter" aria-label="Twitter"><FiTwitter /></a>
            <a href="#linkedin" aria-label="LinkedIn"><FiLinkedin /></a>
            <a href="#global" aria-label="Website"><FiGlobe /></a>
          </div>
        </div>

        <div className="footer-nav">
          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-list">
              <li><Link to="/features">Cryptographic Audit</Link></li>
              <li><Link to="/features">Biometric Auth</Link></li>
              <li><Link to="/how-it-works">Live Tallying</Link></li>
              <li><Link to="/features">Public Ledger</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Stakeholders</h4>
            <ul className="footer-list">
              <li><Link to="/who-we-serve">Electoral Commissions</Link></li>
              <li><Link to="/who-we-serve">Registered Voters</Link></li>
              <li><Link to="/who-we-serve">International Observers</Link></li>
              <li><Link to="/who-we-serve">Political Parties</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-list">
              <li><Link to="/about">About SEIS</Link></li>
              <li><Link to="/contact">System Security</Link></li>
              <li><Link to="/contact">Documentation</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SEIS Platform. All rights reserved.</p>
        <div className="legal-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#security">Security Specs</a>
        </div>
      </div>
    </footer>
  );
}
