import "./HowItWorks.css";

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <h2>How It Works</h2>

      <div className="steps">

        <div className="step">
          <div className="number">1</div>
          <h3>Register</h3>
          <p>Create your secure account.</p>
        </div>

        <div className="step">
          <div className="number">2</div>
          <h3>Verify Identity</h3>
          <p>Complete identity verification before voting.</p>
        </div>

        <div className="step">
          <div className="number">3</div>
          <h3>Cast Your Vote</h3>
          <p>Vote securely using encrypted technology.</p>
        </div>

        <div className="step">
          <div className="number">4</div>
          <h3>Verify Results</h3>
          <p>Published results can be independently verified.</p>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;