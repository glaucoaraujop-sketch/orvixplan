import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(e) {
    return { error: e }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 40, fontFamily: 'Outfit, system-ui, sans-serif',
          background: '#FEF2F2', minHeight: '100vh', color: '#991B1B',
        }}>
          <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 80 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Erro ao carregar o app</h2>
            <p style={{ fontSize: 14, marginBottom: 16, color: '#6B7280' }}>
              Recarregue a página. Se persistir, copie o erro abaixo e reporte.
            </p>
            <pre style={{
              fontSize: 12, background: '#FFF', padding: 16,
              borderRadius: 8, border: '1px solid #FECACA',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#374151',
            }}>
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20, padding: '10px 20px', background: '#DC2626',
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
