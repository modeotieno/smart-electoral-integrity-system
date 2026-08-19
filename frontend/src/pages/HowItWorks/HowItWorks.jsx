import {
  FiUserPlus,
  FiShield,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";

import "../../App.css";

const steps = [
  {
    icon: FiUserPlus,
    number: "01",
    title: "Register",
    text: "Eligible voters are securely registered within the election system.",
  },
  {
    icon: FiShield,
    number: "02",
    title: "Authenticate",
    text: "The system verifies the identity and authorization of the user.",
  },
  {
    icon: FiCheckCircle,
    number: "03",
    title: "Cast Vote",
    text: "An authorized voter securely participates in the voting process.",
  },
  {
    icon: FiFileText,
    number: "04",
    title: "Verify",
    text: "Election information passes through verification and integrity checks.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="inner-page">

      <section className="page-hero">
        <div className="page-hero-content">

          <span className="eyebrow">
            HOW IT WORKS
          </span>

          <h1>
            A Transparent
            <br />
            Election Process
          </h1>

          <p>
            Follow the SEIS demonstration workflow from
            voter registration to election information
            verification.
          </p>

        </div>
      </section>

      <section className="section">

        <div className="section-heading">

          <span className="eyebrow">
            THE WORKFLOW
          </span>

          <h2>
            From Registration to Verification
          </h2>

        </div>

        <div className="workflow-grid">

          {steps.map(
            ({ icon: Icon, number, title, text }) => (
              <div className="workflow-card" key={number}>

                <div className="workflow-number">
                  {number}
                </div>

                <div className="feature-icon">
                  <Icon />
                </div>

                <h3>{title}</h3>

                <p>{text}</p>

              </div>
            )
          )}

        </div>

      </section>

    </div>
  );
}