import { useState } from 'react'

export function LoginView({ onSignIn }) {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await onSignIn(email.trim())
      if (err) throw err
      setSent(true)
    } catch (err) {
      setError(err.message || 'Erro ao enviar link. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F1FF 50%, #FDF4FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 64, height: 64,
              borderRadius: 18,
              background: '#4338CA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30,
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(67,56,202,.3)',
            }}
          >
            📅
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1E1B4B', marginBottom: 6 }}>
            OrvixPlan
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.5 }}>
            Planeje com propósito.<br />Viva com equilíbrio.
          </p>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 32,
            boxShadow: '0 8px 40px rgba(67,56,202,.12)',
            border: '1px solid #EEF0FF',
          }}
        >
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E1B4B', marginBottom: 8 }}>
                Link enviado!
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                Verifique <strong>{email}</strong> e clique no link.<br />
                A sessão ficará ativa por até 60 dias.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                style={{
                  marginTop: 20, background: 'none', border: 'none',
                  color: '#4338CA', fontSize: 13, cursor: 'pointer',
                  fontFamily: 'inherit', textDecoration: 'underline',
                }}
              >
                Usar outro email
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1E1B4B', marginBottom: 6 }}>
                Entrar
              </h2>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 22 }}>
                Você vai receber um link de acesso no email.
              </p>

              <form onSubmit={submit}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  style={inputStyle}
                />

                {error && (
                  <div style={{
                    padding: '8px 12px', background: '#FEF2F2',
                    borderRadius: 8, fontSize: 13, color: '#DC2626', marginBottom: 14,
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  style={{
                    width: '100%', padding: 12, borderRadius: 10, border: 'none',
                    background: loading ? '#A5B4FC' : '#4338CA',
                    color: 'white', fontSize: 14, fontWeight: 600,
                    cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'inherit', transition: 'background .15s',
                  }}
                >
                  {loading ? 'Enviando…' : 'Enviar link de acesso'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#9CA3AF' }}>
          Orvix Tecnologia
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: '#6B7280', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '.5px',
}

const inputStyle = {
  width: '100%', border: '1.5px solid #E0E7FF',
  borderRadius: 10, padding: '11px 14px',
  fontSize: 14, fontFamily: 'inherit',
  outline: 'none', color: '#1E1B4B',
  marginBottom: 16, display: 'block',
}
