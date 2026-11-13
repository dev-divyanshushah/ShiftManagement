import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ShiftFlow Runtime Error Intercepted:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '750px', margin: '40px auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>!</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>ShiftFlow Application Error</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>An unhandled client render error occurred.</p>
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: '600', fontSize: '13px', fontFamily: 'monospace' }}>
              {this.state.error?.toString()}
            </p>
            {this.state.errorInfo?.componentStack && (
              <pre style={{ marginTop: '12px', fontSize: '11px', color: '#475569', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '200px' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Reload Page
            </button>
            <button
              onClick={this.handleReset}
              style={{ padding: '10px 18px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Reset Session Data & Go to Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

