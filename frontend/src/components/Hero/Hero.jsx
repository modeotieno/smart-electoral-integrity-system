import "./Hero.css";

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-text">
        <h1>Smart Electoral Integrity System</h1>

        <p>
          A secure demonstration platform that showcases transparent,
          verifiable and trustworthy digital elections.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn">Get Started</button>
          <button className="secondary-btn">Learn More</button>
        </div>
      </div>

      <div className="hero-image">
        <div className="hero-image">
  <img
    src="/hero2.png"
    alt="Smart Electoral Integrity System"
  />
</div>
      </div>
    </section>
  );
}

export default Hero;