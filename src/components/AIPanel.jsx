export function AIPanel({ content, loading, error, onClose }) {
  if (!loading && !content && !error) return null

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #E0E7FF',
        borderRadius: 14,
        padding: 18,
        marginTop: 12,
        position: 'relative',
        boxShadow: '0 4px 20px rgba(67,56,202,.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>✨</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#4338CA' }}>OrvixPlan IA</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9CA3AF',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13 }}>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
          Pensando…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div style={{ color: '#DC2626', fontSize: 13, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {content && (
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: '#374151',
            whiteSpace: 'pre-wrap',
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}
