import {
  FiArrowRight,
  FiEye,
  FiShield,
  FiFileText,
  FiAward,
  FiGlobe,
  FiCheckCircle,
  FiUsers,
  FiUserCheck,
  FiSearch,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./About.css";

export default function About() {
  const navigate = useNavigate();

  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const valuesData = [
    {
      icon: FiEye,
      title: "Transparency",
      description:
        "Promote openness and make election information understandable and verifiable.",
    },
    {
      icon: FiShield,
      title: "Security",
      description:
        "Protect election information and provide secure access throughout the electoral process.",
    },
    {
      icon: FiFileText,
      title: "Accountability",
      description:
        "Maintain records and audit information that help stakeholders verify election activities.",
    },
    {
      icon: FiAward,
      title: "Integrity",
      description:
        "Support trustworthy election processes based on accurate and reliable information.",
    },
    {
      icon: FiGlobe,
      title: "Accessibility",
      description:
        "Make important election information accessible to different electoral stakeholders.",
    },
    {
      icon: FiCheckCircle,
      title: "Trust",
      description:
        "Build confidence through secure systems, transparency and verifiable information.",
    },
  ];

  const stakeholdersData = [
    {
      icon: FiUsers,
      title: "Voters",
      description:
        "Empowered with real-time access to verified election details, polling station locations, and transparent result tracking.",
    },
    {
      icon: FiUserCheck,
      title: "Candidates",
      description:
        "Guaranteed a fair, transparent playing field with real-time monitoring and immutable audit logging.",
    },
    {
      icon: FiShield,
      title: "Election Officials",
      description:
        "Equipped with robust digital management workflows, secure voter registration tools, and seamless data validation.",
    },
    {
      icon: FiSearch,
      title: "Observers",
      description:
        "Provided with independent audit access and transparent metrics to monitor and evaluate election compliance.",
    },
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <span className="eyebrow">ABOUT SEIS</span>
          <h1 className="about-hero-title">Building Trust in Every Vote</h1>
          <p className="about-hero-description">
            SEIS is designed to ensure transparency, security and accountability
            in every stage of the electoral process. From voter registration to
            result declaration, our platform empowers all stakeholders with
            real-time information and verifiable data.
          </p>
          <div className="hero-buttons">
            <button
              className="green-btn"
              onClick={() => handleScrollToSection("mission")}
            >
              Learn More <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id="mission" className="about-mission-vision">
        <div className="about-container grid-two-col">
          <div className="info-card mission-card">
            <span className="card-badge">Our Mission</span>
            <h2>Fostering Digital Trust</h2>
            <p>
              SEIS aims to provide a secure, transparent, trustworthy and
              verifiable digital election experience that guarantees every vote counts
              and can be audited independently.
            </p>
          </div>
          <div className="info-card vision-card">
            <span className="card-badge badge-dark">Our Vision</span>
            <h2>Standardizing Electoral Integrity</h2>
            <p>
              SEIS envisions an electoral process where voters, candidates,
              election officials and observers can confidently access reliable and
              verifiable election information.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values">
        <div className="about-container">
          <div className="section-heading">
            <span className="eyebrow">OUR FOUNDATION</span>
            <h2>Our Core Values</h2>
          </div>
          <div className="values-grid">
            {valuesData.map((val) => {
              const IconComponent = val.icon;
              return (
                <div key={val.title} className="value-card">
                  <div className="value-icon">
                    <IconComponent />
                  </div>
                  <h3>{val.title}</h3>
                  <p>{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section id="stakeholders" className="about-stakeholders">
        <div className="about-container">
          <div className="section-heading">
            <span className="eyebrow">INCLUSIVE ELECTORAL SOLUTION</span>
            <h2>Built for Every Electoral Stakeholder</h2>
          </div>
          <div className="stakeholders-grid">
            {stakeholdersData.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.title} className="stakeholder-card">
                  <div className="stakeholder-icon">
                    <IconComponent />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-container cta-content">
          <h2>Ready to Build Trust in Every Vote?</h2>
          <p>
            Explore SEIS and discover how secure, transparent and verifiable
            digital election technology can support the electoral process.
          </p>
          <div className="cta-buttons">
            <button
              className="outline-btn-light"
              onClick={() => {
                navigate("/");
                setTimeout(() => {
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              Explore Features
            </button>
            <button
              className="light-btn"
              onClick={() => {
                navigate("/");
                setTimeout(() => {
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}