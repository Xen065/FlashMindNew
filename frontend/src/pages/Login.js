import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  // Auto-focus on first field
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      // Announce error for screen readers
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.setAttribute('role', 'alert');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (error) {
      setError('');
    }

    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login to FlashMind</h2>
        {error && <div className="error-message" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required" aria-label="required">*</span>
            </label>
            <input
              id="email"
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
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
            <label htmlFor="password">
              Password <span className="required" aria-label="required">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              onBlur={validateForm}
              required
              aria-required="true"
              aria-invalid={fieldErrors.password ? 'true' : 'false'}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              disabled={loading}
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <span id="password-error" className="field-error" role="alert">
                {fieldErrors.password}
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
                <span>Logging in...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
