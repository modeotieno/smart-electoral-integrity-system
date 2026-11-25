import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import { sendContactMessage } from "../../api/api";
import "../../App.css";
import "./Contact.css";

const emptyForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      await sendContactMessage(form);
      setForm(emptyForm);
      setStatus({
        type: "success",
        message: "Thank you — your message has been received.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Your message could not be sent.",
      });
    } finally {
      setSending(false);
    }
  };

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
            onSubmit={handleSubmit}
          >

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="name">
                  Your Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength="150"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength="150"
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
                name="subject"
                type="text"
                placeholder="What would you like to ask?"
                value={form.subject}
                onChange={handleChange}
                maxLength="200"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
                minLength="10"
                maxLength="5000"
                required
              />
            </div>

            <input
              className="contact-honeypot"
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              autoComplete="off"
              tabIndex="-1"
              aria-hidden="true"
            />

            {status && (
              <div
                className={`contact-status contact-status-${status.type}`}
                role={status.type === "error" ? "alert" : "status"}
              >
                {status.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                <span>{status.message}</span>
              </div>
            )}

            <button
              type="submit"
              className="contact-submit"
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Message"}
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