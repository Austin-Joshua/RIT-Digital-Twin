import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>This page could not be shown</h1>
          <p style={{ color: 'var(--theme-text-muted)', marginBottom: '16px' }}>
            The rest of the campus is unchanged. Try again, or return home.
          </p>
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })} style={{ marginRight: '8px' }}>
            Try again
          </button>
          <button type="button" onClick={() => { window.location.href = '/'; }}>
            Go home
          </button>
        </div>
      </div>
    );
  }
}
