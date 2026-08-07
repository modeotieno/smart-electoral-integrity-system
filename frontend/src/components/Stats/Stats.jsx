import "./Stats.css";
import {
  FaUsers,
  FaVoteYea,
  FaBuilding,
  FaCheckCircle,
} from "react-icons/fa";

function Stats() {
  const stats = [
    {
      icon: <FaUsers />,
      number: "2.5M+",
      title: "Registered Voters",
    },
    {
      icon: <FaVoteYea />,
      number: "18",
      title: "Candidates",
    },
    {
      icon: <FaBuilding />,
      number: "1,250",
      title: "Polling Stations",
    },
    {
      icon: <FaCheckCircle />,
      number: "99.9%",
      title: "System Uptime",
    },
  ];

  return (
    <section className="stats">
      <div className="stats-container">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="icon">{item.icon}</div>

            <h2>{item.number}</h2>

            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;