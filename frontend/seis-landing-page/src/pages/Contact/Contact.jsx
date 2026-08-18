import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";

import "../../App.css";

export default function ContactPage() {
  return (
    <div className="inner-page">

      <section className="page-hero">
        <div className="page-hero-content">

          <span className="eyebrow">
            CONTACT SEIS
          </span>

          <h1>
            Have Questions
            <br />
            About SEIS?
          </h1>

          <p>
            Get in touch to learn more about the Smart
            Electoral Integrity System demonstration
            platform.
          </p>

        </div>
      </section>

      <section className="section contact-section">

        <div className="contact-details">

          <span className="eyebrow">
            GET IN TOUCH
          </span>

          <h2>
            Let's Talk
          </h2>

          <p>
            Learn more about our demonstration platform
            and how it showcases secure, transparent and
            verifiable election processes.
          </p>

          <p>
            <FiMail />
            otienomodesta505@gmail.com
          </p>

          <p>
            <FiPhone />
            +254 727822752
          </p>

          <p>
            <FiMapPin />
            Kenya
          </p>

        </div>

        <form
          className="contact-form"
          onSubmit={(e) => e.preventDefault()}
        >

          <input
            type="text"
            placeholder="Your Name"
          />

          <input
            type="email"
            placeholder="Your Email"
          />

          <input
            type="text"
            placeholder="Subject"
          />

          <textarea
            rows="6"
            placeholder="Your Message"
          />

          <button
            type="submit"
            className="green-btn"
          >
            Send Message
            <FiArrowRight />
          </button>

        </form>

      </section>

    </div>
  );
}