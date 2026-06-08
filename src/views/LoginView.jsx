import { useState } from 'react'

export function LoginView({ onSignIn, onVerifyOtp }) {
  const [email,   setEmail]   = useState('')
  const [code,    setCode]    = useState('')
  const [step,    setStep]    = useState('email')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const submitEmail = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await onSignIn(email.trim())
      if (err) throw err
      setStep('code')
    } catch (err) {
      setError(err.message || 'Erro ao enviar código. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const submitCode = async (e) => {
    e.preventDefault()
    if (code.trim().length < 6) return
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await onVerifyOtp(email.trim(), code.trim())
      if (err) throw err
    } catch (err) {
      setError('Código inválido ou expirado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F1FF 50%, #FDF4FF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: '#4338CA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(67,56,202,.3)',
          }}>📅</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1E1B4B', marginBottom: 6 }}>OrvixPlan</h1>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.5 }}>
            Planeje com propósito.<br />Viva com equilíbrio.
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: 20, padding: 32,
          boxShadow: '0 8px 40px rgba(67,56,202,.12)', border: '1px solid #EEF0FF',
        }}>
          {step === 'email' ? (
            <>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1E1B4B', marginBottom: 6 }}>Entrar</h2>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 22 }}>
                Você vai receber um <strong>código de 6 dígitos</strong> no email.
              </p>
              <form onSubmit={submitEmail}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email" autoFocus value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" style={inputStyle}
                />
                {error && <div style={errorStyle}>{error}</div>}
                <button type="submit" disabled={loading || !email.trim()}
                  style={{ ...btnStyle, background: loading ? '#A5B4FC' : '#4338CA' }}>
                  {loading ? 'Enviando…' : 'Enviar código'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1E1B4B', marginBottom: 6 }}>
                Digite o código
              </h2>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
                Enviamos para <strong>{email}</strong>
              </p>

              {/* Instrução crítica para iOS PWA */}
              <div style={{
                padding: '10px 12px', background: '#EEF2FF', borderRadius: 8,
                marginBottom: 18, fontSize: 12, color: '#4338CA', lineHeight: 1.5,
              }}>
                ⚠️ Use o <strong>código de 6 dígitos</strong> do email.<br />
                Não clique no link — ele abrirá no navegador.
              </div>

              <form onSubmit={submitCode}>
                <label style={labelStyle}>Código</label>
                <input
                  type="text" autoFocus inputMode="numeric" pattern="[0-9]*"
                  maxLength={6} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  style={{ ...inputStyle, letterSpacing: 8, fontSize: 26, textAlign: 'center', padding: '14px' }}
                />
                {error && <div style={errorStyle}>{error}</div>}
                <button type="submit" disabled={loading || code.length < 6}
                  style={{ ...btnStyle, background: loading ? '#A5B4FC' : '#4338CA' }}>
                  {loading ? 'Verificando…' : 'Entrar'}
                </button>
              </form>

              <button onClick={() => { setStep('email'); setCode(''); setError(null) }}
                style={{
                  width: '100%', marginTop: 10, background: 'none', border: 'none',
                  color: '#9CA3AF', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                Reenviar para outro email
              </button>
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
  color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px',
}
const inputStyle = {
  width: '100%', border: '1.5px solid #E0E7FF', borderRadius: 10,
  padding: '11px 14px', fontSize: 14, fontFamily: 'inherit',
  outline: 'none', color: '#1E1B4B', marginBottom: 16, display: 'block',
}
const btnStyle = {
  width: '100%', padding: 12, borderRadius: 10, border: 'none',
  color: 'white', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s',
}
const errorStyle = {
  padding: '8px 12px', background: '#FEF2F2', borderRadius: 8,
  fontSize: 13, color: '#DC2626', marginBottom: 14,
}
