import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiKey, FiArrowRight, FiShield, FiCheck } from "react-icons/fi";
import { login } from "../../api/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side: Brand Intro */}
        <div className="login-intro">
          <div className="login-brand">
            <div className="login-fingerprint">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div>
              <strong>SEIS</strong>
              <small>SMART ELECTORAL INTEGRITY SYSTEM</small>
            </div>
          </div>
          <span className="eyebrow">SEIS ACCESS</span>
          <h1>Secure <span>Portal</span> Access</h1>
          <p>Access the SEIS demonstration platform to view system features and verification workflows.</p>

          <div className="login-points">
            <div>
              <FiCheck />
              <span>Multi-Factor Authentication</span>
            </div>
            <div>
              <FiCheck />
              <span>Encrypted Credentials</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="login-card">
          <div className="login-heading">
            <span className="eyebrow">SEIS ACCESS</span>
            <h2>Login</h2>
            <p>Access the SEIS demonstration platform.</p>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: "0.85rem",
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiKey />
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button type="submit" className="green-btn login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
              <FiArrowRight />
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: "0.85rem", color: "var(--slate-500)" }}>
            No account?{" "}
            <Link to="/register" style={{ color: "var(--green-600)", fontWeight: 700 }}>
              Create account
            </Link>
          </p>

          <div className="login-security">
            <FiShield />
            <span>256-bit SSL Encrypted Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}