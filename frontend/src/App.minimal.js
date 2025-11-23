import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 2rem',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981', textDecoration: 'none' }}>
              FlashMind
            </Link>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <Link to="/login" style={{ color: '#6b7280', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ color: '#6b7280', textDecoration: 'none' }}>Register</Link>
            </div>
          </div>
        </nav>

        <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={
              <div className="homepage">
                <div className="hero">
                  <h1>Welcome to FlashMind</h1>
                  <p>Master any subject with spaced repetition learning</p>
                  <div className="cta-buttons">
                    <Link to="/register" className="btn btn-primary">Get Started</Link>
                    <Link to="/login" className="btn btn-secondary">Login</Link>
                  </div>
                </div>
              </div>
            } />
            <Route path="/login" element={
              <div className="auth-page">
                <div className="auth-container">
                  <h2>Login to FlashMind</h2>
                  <p>Backend connection test page</p>
                </div>
              </div>
            } />
            <Route path="/register" element={
              <div className="auth-page">
                <div className="auth-container">
                  <h2>Register for FlashMind</h2>
                  <p>Create your account</p>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
