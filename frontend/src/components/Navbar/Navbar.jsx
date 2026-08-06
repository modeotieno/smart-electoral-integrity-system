import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">

      <div className="logo">

  <div className="logo-box">
    🛡️
  </div>

  <div className="logo-text">
    <h2>SEIS</h2>
    <p>Smart Electoral Integrity System</p>
  </div>

</div>

      <nav>
        <ul className="nav-links">

          <li>
            <Link to="/">Home</Link>
          </li>

          <li>
            <Link to="/about">About</Link>
          </li>

          <li>
            <Link to="/features">Features</Link>
          </li>

          <li>
            <Link to="/how-it-works">How It Works</Link>
          </li>

          <li>
            <Link to="/who-we-serve">Who We Serve</Link>
          </li>

          <li>
            <Link to="/contact">Contact</Link>
          </li>

        </ul>
      </nav>

      <Link to="/login" className="login-btn">
        Login
      </Link>

    </header>
  );
}

export default Navbar;