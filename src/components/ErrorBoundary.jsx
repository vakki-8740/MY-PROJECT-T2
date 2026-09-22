import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '20px', textAlign: 'center', fontFamily: '-apple-system, sans-serif',
          background: '#f5f6f8', color: '#1c1c1e'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 32, background: '#ffe9e7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 16
          }}>⚠</div>
          <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: '#8e8e93', marginBottom: 16, maxWidth: 400 }}>{this.state.error.message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload() }}
            style={{
              background: '#007aff', color: '#fff', border: 'none', padding: '12px 24px',
              borderRadius: 12, fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
