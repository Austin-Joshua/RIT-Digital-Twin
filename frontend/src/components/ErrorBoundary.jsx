import React from 'react';

const isChunkLoadError = (err) => {
  const msg = (err?.message || String(err || '')).toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('chunkloaderror') ||
    err?.name === 'ChunkLoadError'
  );
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary caught error]:', error, info);

    // If this is a chunk load / deployment hash mismatch error, auto-reload once to fetch fresh assets
    if (isChunkLoadError(error)) {
      const storageKey = 'rit_chunk_reload_attempt';
      const lastReload = sessionStorage.getItem(storageKey);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    if (isChunkLoadError(this.state.error)) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
        : this.props.fallback;
    }

    const isChunk = isChunkLoadError(this.state.error);

    if (this.props.inline) {
      return (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#991B1B',
          margin: '12px 0',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 6px 0', fontWeight: '600', fontSize: '0.95rem' }}>
            {isChunk ? 'Module Update Available' : (this.props.title || 'Module Unavailable')}
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', opacity: 0.85 }}>
            {isChunk
              ? 'A newer version of this module is available. Please reload the page.'
              : (this.state.error?.message || 'A visual error occurred while rendering this module.')}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {isChunk ? 'Reload Page' : 'Retry Module'}
          </button>
        </div>
      );
    }

    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          padding: '32px',
          borderRadius: '16px',
          background: 'var(--ims-card-bg, #FFFFFF)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid var(--ims-border, #E2E8F0)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: isChunk ? '#E0F2FE' : '#FEE2E2',
            color: isChunk ? '#0284C7' : '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '24px'
          }}>
            {isChunk ? '🔄' : '⚠️'}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--ims-heading, #0F172A)', margin: '0 0 8px 0' }}>
            {isChunk ? 'Portal Update Available' : 'Service Temporarily Interrupted'}
          </h2>
          <p style={{ color: 'var(--ims-subtext, #64748B)', fontSize: '0.875rem', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            {isChunk
              ? 'A newer version of the digital twin platform has been deployed. Please reload the page to load the latest release.'
              : (this.state.error?.message || 'An unexpected runtime error occurred while processing campus data.')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {isChunk ? 'Reload Application' : 'Try Again'}
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'transparent',
                color: '#475569',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}
