import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const usernameInputRef = useRef(null);

  // Auto-focus on first field
  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    // Contains lowercase
    if (/[a-z]/.test(password)) score++;
    // Contains uppercase
    if (/[A-Z]/.test(password)) score++;
    // Contains numbers
    if (/\d/.test(password)) score++;
    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: '#DC2626' };
    if (score <= 4) return { score: 2, label: 'Fair', color: '#FF9800' };
    if (score <= 5) return { score: 3, label: 'Good', color: '#4CAF50' };
    return { score: 4, label: 'Strong', color: '#10B981' };
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Register for FlashMind</h2>
        {error && <div className="error-message" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">
              Username <span className="required" aria-label="required">*</span>
            </label>
            <input
              id="username"
              ref={usernameInputRef}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={validateForm}
              required
              aria-required="true"
              aria-invalid={fieldErrors.username ? 'true' : 'false'}
              aria-describedby={fieldErrors.username ? 'username-error' : undefined}
              disabled={loading}
              autoComplete="username"
            />
            {fieldErrors.username && (
              <span id="username-error" className="field-error" role="alert">
                {fieldErrors.username}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required" aria-label="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={validateForm}
              required
              aria-required="true"
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              disabled={loading}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <span id="email-error" className="field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required" aria-label="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={validateForm}
                required
                aria-required="true"
                aria-invalid={fieldErrors.password ? 'true' : 'false'}
                aria-describedby={fieldErrors.password ? 'password-error password-strength' : 'password-strength'}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {fieldErrors.password && (
              <span id="password-error" className="field-error" role="alert">
                {fieldErrors.password}
              </span>
            )}
            {formData.password && (
              <div id="password-strength" className="password-strength" aria-live="polite">
                <div className="strength-label">
                  Password Strength: <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
                </div>
                <div className="strength-bar">
                  <div
                    className="strength-bar-fill"
                    style={{
                      width: `${(passwordStrength.score / 4) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                <div className="strength-tips">
                  <small>Use 8+ characters, mix uppercase, lowercase, numbers & symbols</small>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password <span className="required" aria-label="required">*</span>
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={validateForm}
              required
              aria-required="true"
              aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
              disabled={loading}
              autoComplete="new-password"
            />
            {fieldErrors.confirmPassword && (
              <span id="confirmPassword-error" className="field-error" role="alert">
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                <span>Creating account...</span>
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
