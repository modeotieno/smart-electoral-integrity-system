import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";

import "../../App.css";
import "./Contact.css";

export default function ContactPage() {
  return (
    <div className="contact-page">

      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-eyebrow">
            CONTACT SEIS
          </span>

          <h1>
            Have Questions
            <br />
            <span>About SEIS?</span>
          </h1>

          <p>
            Get in touch to learn more about the Smart Electoral
            Integrity System demonstration platform.
          </p>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="contact-section">

        {/* LEFT SIDE */}
        <div className="contact-details">

          <span className="contact-eyebrow">
            GET IN TOUCH
          </span>

          <h2>Let's Talk</h2>

          <p className="contact-description">
            Learn more about our demonstration platform and how
            it showcases secure, transparent and verifiable
            election processes.
          </p>

          <div className="contact-info">

            <div className="contact-info-item">
              <div className="contact-icon">
                <FiMail />
              </div>

              <div>
                <span>Email</span>
                <p>otienomodesta505@gmail.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">
                <FiPhone />
              </div>

              <div>
                <span>Phone</span>
                <p>+254 727 822 752</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">
                <FiMapPin />
              </div>

              <div>
                <span>Location</span>
                <p>Kenya</p>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="contact-form-wrapper">

          <div className="contact-form-heading">
            <h3>Send us a message</h3>

            <p>
              Have a question or want to learn more about SEIS?
              Send us a message.
            </p>
          </div>

          <form
            className="contact-form"
            onSubmit={(e) => e.preventDefault()}
          >

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="name">
                  Your Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="subject">
                Subject
              </label>

              <input
                id="subject"
                type="text"
                placeholder="What would you like to ask?"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                rows="6"
                placeholder="Write your message here..."
                required
              />
            </div>

            <button
              type="submit"
              className="contact-submit"
            >
              Send Message
              <FiArrowRight />
            </button>

          </form>

        </div>

      </section>

      {/* CTA */}
      <section className="contact-cta">
        <div>
          <span className="contact-eyebrow">
            SMART ELECTORAL INTEGRITY SYSTEM
          </span>

          <h2>
            Building trust through
            <span> transparency.</span>
          </h2>

          <p>
            Explore how SEIS demonstrates secure, transparent
            and verifiable digital election processes.
          </p>
        </div>
      </section>

    </div>
  );
}