import { FiArrowRight, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

export default function ContactPage() {
  return (
    <main style={{ paddingTop: "5rem" }}>
      <section id="contact" className="section contact-section">
        <div className="contact-copy">
          <span className="eyebrow">CONTACT SEIS</span>
          <h2>Let's Build Trust in Every Vote</h2>
          <p>
            Have a question, feedback, or want to learn more about the Smart
            Electoral Integrity System? Reach out to us.
          </p>
          <div className="contact-details">
            <p>
              <FiMail /> otienomodesta505@gmail.com
            </p>
            <p>
              <FiPhone /> +254 727 822 752
            </p>
            <p>
              <FiMapPin /> Kisumu, Kenya
            </p>
          </div>
        </div>
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <input placeholder="Subject" />
          <textarea rows="5" placeholder="Write your message..." />
          <button className="green-btn" type="submit">
            Send Message <FiArrowRight />
          </button>
        </form>
      </section>
    </main>
  );
}