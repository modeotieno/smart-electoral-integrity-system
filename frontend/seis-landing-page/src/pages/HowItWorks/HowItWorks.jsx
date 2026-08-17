import { FiUserCheck, FiLock, FiCheckCircle, FiShield, FiFileText } from "react-icons/fi";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: FiUserCheck,
      step: "01",
      title: "Voter Authentication",
      desc: "Eligible voters authenticate securely using multi-factor identity validation to prevent duplicate entries and unauthorized access.",
    },
    {
      icon: FiLock,
      step: "02",
      title: "Encrypted Ballot Casting",
      desc: "Votes are cryptographically encrypted at the moment of submission, guaranteeing complete voter anonymity and confidentiality.",
    },
    {
      icon: FiShield,
      step: "03",
      title: "Immutable Ledger Recording",
      desc: "Every ballot token is anchored into a tamper-evident, distributed audit ledger for real-time validation across nodes.",
    },
    {
      icon: FiCheckCircle,
      step: "04",
      title: "Zero-Knowledge Verification",
      desc: "Voters receive a unique cryptographic receipt to independently verify that their vote was recorded and counted accurately.",
    },
  ];

  return (
    <div className="how-it-works-page page-layout section">
      <div className="section-header">
        <span className="eyebrow">TRANSPARENT PROCESS</span>
        <h1>How The Electoral System Works</h1>
        <p className="subtitle">
          SEIS leverages end-to-end cryptographic encryption and distributed audit pipelines to ensure complete election integrity.
        </p>
      </div>

      <div className="steps-grid">
        {steps.map(({ icon: Icon, step, title, desc }) => (
          <div className="step-card" key={step}>
            <div className="step-number">{step}</div>
            <div className="step-icon"><Icon /></div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>

      <div className="trust-banner">
        <FiFileText className="trust-icon" />
        <div>
          <h4>Independent Auditability</h4>
          <p>Election observers and public auditors can continuously verify ledger consistency without compromising voter privacy.</p>
        </div>
      </div>
    </div>
  );
}