import React from 'react';

export default function Login() {
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
          <p>Access the SEIS demonstration platform.</p>
        </div>

        {/* Right Side: Form */}
        <div className="login-card">
          <div className="login-heading">
            <span className="eyebrow">SEIS ACCESS</span>
            <h2>Login</h2>
            <p>Access the SEIS demonstration platform.</p>
          </div>

          <form className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="green-btn login-submit">
              Login
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}