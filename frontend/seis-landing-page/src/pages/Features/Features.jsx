import {
  FiArrowRight,
  FiBarChart2,
  FiFileText,
  FiLock,
  FiShield,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

const features = [
  [
    FiLock,
    "Secure Voting",
    "Protect every vote using modern encryption and secure vote storage.",
  ],
  [
    FiUserCheck,
    "Identity Verification",
    "Verify voters using secure authentication and identity checks.",
  ],
  [
    FiBarChart2,
    "Transparent Results",
    "Publish auditable election results with complete transparency.",
  ],
  [
    FiUsers,
    "Candidate Dashboard",
    "Allow candidates to monitor election progress and verify official results.",
  ],
  [
    FiShield,
    "Security & Integrity",
    "Built with audit logs, secure access, and data protection.",
  ],
  [
    FiFileText,
    "Reports & Analytics",
    "Generate election reports and visualize official statistics.",
  ],
];

export default function FeaturesPage() {
  return (
    <main style={{ paddingTop: "5rem" }}>
      <section id="features" className="section features-section">
        <div className="section-heading">
          <span className="eyebrow">ELECTION FEATURES</span>
          <h2>Why Choose SEIS?</h2>
          <p>
            Everything you need to conduct secure, transparent and trustworthy
            digital elections.
          </p>
        </div>
        <div className="features-grid">
          {features.map(([Icon, title, text]) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <button>
                Learn More <FiArrowRight />
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}