import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheck, FiLock, FiMail, FiShield, FiUser } from "react-icons/fi";
import { register } from "../../api/api";

const roles = [
  { value: "citizen", label: "Citizen / Voter" },
  { value: "observer", label: "Election Observer" },
  { value: "candidate", label: "Candidate" },
  { value: "presiding_officer", label: "Presiding Officer" },
  { value: "returning_officer", label: "Returning Officer" },
  { value: "election_administrator", label: "Election Administrator" },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "", role: "citizen" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left intro - reuse login styles */}
        <div className="login-intro">
          <div className="login-brand">
            <div className="login-fingerprint">
              <span /><span /><span /><span />
            </div>
            <div>
              <strong>SEIS</strong>
              <small>SMART ELECTORAL<br />INTEGRITY SYSTEM</small>
            </div>
          </div>
          <span className="eyebrow">CREATE ACCOUNT</span>
          <h1>Join <span>SEIS</span></h1>
          <p>Create your secure account to access transparent, verifiable election services. Your credentials are encrypted and protected.</p>
          <div className="login-points">
            <div><FiShield /><span>Secure credential storage</span></div>
            <div><FiLock /><span>Encrypted & auditable</span></div>
            <div><FiCheck /><span>Role-based access</span></div>
          </div>
        </div>

        {/* Right form */}
        <div className="login-card">
          <div className="login-heading">
            <span className="eyebrow">SEIS ACCESS</span>
            <h2>Create account</h2>
            <p>Enter your credentials to get started.</p>
          </div>

          <form className="login-form" onSubmit={onSubmit}>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: 8, fontSize: "0.85rem", marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <div className="input-wrapper">
                <FiUser />
                <input id="full_name" name="full_name" type="text" placeholder="Enter your full name" value={form.full_name} onChange={onChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail />
                <input id="email" name="email" type="email" placeholder="Enter your email" value={form.email} onChange={onChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <div className="input-wrapper">
                <FiShield />
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={onChange}
                  style={{ width: "100%", height: 48, padding: "0 14px 0 44px", border: "1px solid var(--slate-200)", borderRadius: 9, background: "var(--slate-50)" }}
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiLock />
                <input id="password" name="password" type="password" placeholder="Create a password (min 8 chars)" value={form.password} onChange={onChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock />
                <input id="confirm" name="confirm" type="password" placeholder="Repeat your password" value={form.confirm} onChange={onChange} required />
              </div>
            </div>

            <button type="submit" className="green-btn login-submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
              <FiArrowRight />
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: "0.85rem", color: "var(--slate-500)" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--green-600)", fontWeight: 700 }}>Sign in</Link>
          </p>

          <div className="login-security">
            <FiShield />
            <span>Your credentials are protected by bcrypt hashing.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
