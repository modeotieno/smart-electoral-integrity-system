import {
  FiLock,
  FiUserCheck,
  FiBarChart2,
  FiUsers,
  FiShield,
  FiFileText,
} from "react-icons/fi";

import "./Features.css";

const features = [
  {
    id: "secure-voting",
    icon: FiLock,
    title: "Secure Voting",
    description:
      "SEIS demonstrates how secure digital voting can protect election information through controlled access and secure data handling.",
  },
  {
    id: "identity-verification",
    icon: FiUserCheck,
    title: "Identity Verification",
    description:
      "The system demonstrates identity verification workflows designed to ensure that only authorized participants can access election services.",
  },
  {
    id: "transparent-results",
    icon: FiBarChart2,
    title: "Transparent Results",
    description:
      "Election information can be monitored and presented in a clear format to support transparency and accountability.",
  },
  {
    id: "candidate-dashboard",
    icon: FiUsers,
    title: "Candidate Dashboard",
    description:
      "Candidates can access relevant election information through a centralized dashboard designed for easy monitoring.",
  },
  {
    id: "security-integrity",
    icon: FiShield,
    title: "Security & Integrity",
    description:
      "Security controls, access management and audit records help demonstrate how election information can be protected.",
  },
  {
    id: "reports-analytics",
    icon: FiFileText,
    title: "Reports & Analytics",
    description:
      "Election administrators can use reports and statistics to understand election activity and monitor important information.",
  },
];

function FeaturesHeroSection() {
  return (
    <section className="features-hero">
      <div className="features-hero-content">
        <span className="eyebrow">ELECTION FEATURES</span>

        <h1>
          Powerful Features for
          <span> Election Integrity</span>
        </h1>

        <p>
          Explore the security, transparency and verification features
          demonstrated by the Smart Electoral Integrity System.
        </p>
      </div>
    </section>
  );
}

function FeaturesDetailSection() {
  return (
    <section className="feature-details-section">
      <div className="feature-details-heading">
        <span className="eyebrow">SEIS CAPABILITIES</span>

        <h2>Built Around Trust</h2>

        <p>
          Every feature is designed around the principles of security,
          transparency and accountability.
        </p>
      </div>

      <div className="feature-details-grid">
        {features.map(({ id, icon: Icon, title, description }) => (
          <article id={id} className="feature-detail-card" key={id}>
            <div className="feature-detail-icon">
              <Icon />
            </div>

            <div>
              <span className="feature-number">SEIS FEATURE</span>

              <h3>{title}</h3>

              <p>{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <div className="features-page">
      <FeaturesHeroSection />
      <FeaturesDetailSection />
    </div>
  );
}