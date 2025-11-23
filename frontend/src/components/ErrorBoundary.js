import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: '#ef4444' }}>Something went wrong</h1>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', padding: '1rem', background: '#fee', borderRadius: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
              Click to see error details
            </summary>
            <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
            <p><strong>Stack:</strong></p>
            <code style={{ fontSize: '0.875rem' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </code>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
