import { Link } from "react-router-dom";
import "./ContactPreview.css";

function ContactPreview() {
  return (
    <section className="contact-preview">
      <h2>Contact Us</h2>

      <p>
        Have questions about SEIS? We'd love to hear from you.
      </p>

      <Link to="/contact" className="contact-btn">
        Contact Us
      </Link>
    </section>
  );
}

export default ContactPreview;