import "./Navbar.css";
import { FaUser } from "react-icons/fa";

function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">
        <h2>SEIS</h2>
        <p>Smart Electoral Integrity System</p>
      </div>

      <nav>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">How It Works</a></li>
          <li><a href="#">Who We Serve</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>

      <div className="nav-buttons">
        <button className="login-btn">
          <FaUser />
          Login
        </button>

        <button className="start-btn">
          Get Started
        </button>
      </div>
    </header>
  );
}

export default Navbar;