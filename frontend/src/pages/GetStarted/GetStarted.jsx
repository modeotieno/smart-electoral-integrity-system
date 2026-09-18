import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../../api/api';
import './GetStarted.css';

// Changed to default export to match App.jsx import
export default function GetStarted() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: false });

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setStatus({ loading: false, message: "Passwords don't match!", error: true });
      return;
    }

    if (!isLogin && formData.password.length < 8) {
      setStatus({ loading: false, message: 'Password must be at least 8 characters!', error: true });
      return;
    }

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({
          full_name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'citizen',
        });
      }

      setStatus({
        loading: false,
        message: isLogin ? 'Login successful!' : 'Account created successfully!',
        error: false,
      });

      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      navigate('/dashboard');
    } catch (err) {
      setStatus({ loading: false, message: err.message, error: true });
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setStatus({ loading: false, message: '', error: false });
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="brand-dot">◯</span> SEIS
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
          <p>{isLogin ? 'Access your election dashboard' : 'Join the Smart Electoral Integrity System'}</p>
        </div>

        {status.message && (
          <div className={`status-banner ${status.error ? 'banner-error' : 'banner-success'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="official@seis.gov"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={status.loading}>
            {status.loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              className="toggle-btn"
              onClick={handleToggleMode}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}