import "./Features.css";
import {
  FaShieldAlt,
  FaLock,
  FaChartLine,
  FaUserCheck,
  FaVoteYea,
  FaCloud,
} from "react-icons/fa";

function Features() {
  const features = [
    {
      icon: <FaShieldAlt />,
      title: "Secure Elections",
      text: "Advanced encryption ensures every vote remains confidential and tamper-proof.",
    },
    {
      icon: <FaLock />,
      title: "Data Protection",
      text: "All voter information is securely stored and protected from unauthorized access.",
    },
    {
      icon: <FaChartLine />,
      title: "Real-Time Analytics",
      text: "Monitor election progress and generate reports instantly.",
    },
    {
      icon: <FaUserCheck />,
      title: "Voter Verification",
      text: "Verify voter identity using secure authentication methods.",
    },
    {
      icon: <FaVoteYea />,
      title: "Transparent Results",
      text: "Instant vote counting with transparent and auditable reporting.",
    },
    {
      icon: <FaCloud />,
      title: "Cloud Integration",
      text: "Access the platform securely from anywhere at any time.",
    },
  ];

  return (
    <section className="features">

      <div className="section-header">

        <span>Features</span>

        <h2>
          Powerful Features Built for
          Modern Elections
        </h2>

        <p>
          Everything required to conduct secure, transparent and
          trustworthy elections from one centralized platform.
        </p>

      </div>

      <div className="features-grid">

        {features.map((feature, index) => (
          <div className="feature-card" key={index}>

            <div className="feature-icon">
              {feature.icon}
            </div>

            <h3>{feature.title}</h3>

            <p>{feature.text}</p>

          </div>
        ))}

      </div>

    </section>
  );
}

export default Features;