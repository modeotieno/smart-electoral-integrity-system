import Navbar from "../../components/Navbar/Navbar";
import "./About.css";

function About() {
  return (
    <>
      <Navbar />

      <section className="about">
        <div className="about-image">
          <img
            src="/hero.png"
            alt="Election Security"
          />
        </div>

        <div className="about-content">
          <h2>About SEIS</h2>

          <p>
            Smart Electoral Integrity System (SEIS) is a secure digital
            election platform that promotes transparency, accountability,
            and trust throughout the election process.
          </p>

          <div className="about-list">
            <div className="about-item">✅ Secure voter authentication</div>
            <div className="about-item">✅ Candidate registration</div>
            <div className="about-item">✅ Transparent vote counting</div>
            <div className="about-item">✅ Election audit trails</div>
            <div className="about-item">✅ Trusted result verification</div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;