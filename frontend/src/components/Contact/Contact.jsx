import Navbar from "../../components/Navbar/Navbar";
import "./Contact.css";

function Contact() {
  return (
    <>
      <Navbar />

      <section className="contact">

        <div className="contact-header">
          <h1>Contact SEIS</h1>

          <p>
            We'd love to hear from you. Whether you have a question,
            feedback, or would like to learn more about the Smart
            Electoral Integrity System, feel free to reach out.
          </p>
        </div>

        <div className="contact-container">

          <div className="contact-info">

            <h2>Get in Touch</h2>

            <p><strong>Email:</strong> info@seis.org</p>

            <p><strong>Phone:</strong> +254 700 000 000</p>

            <p><strong>Location:</strong> Kisumu, Kenya</p>

            <p>
              Our team is committed to promoting secure,
              transparent, and trustworthy digital elections.
            </p>

          </div>

          <form className="contact-form">

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
              placeholder="Write your message..."
            ></textarea>

            <button type="submit">
              Send Message
            </button>

          </form>

        </div>

      </section>
    </>
  );
}

export default Contact;