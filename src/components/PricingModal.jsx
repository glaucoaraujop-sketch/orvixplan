import { useState } from 'react'
import { irParaCheckout } from '../hooks/useAccess.js'

// Tela de planos / paywall. `bloqueante` esconde o botão de fechar (plano expirado).
export function PricingModal({ onClose, bloqueante = false, motivo, onSignOut }) {
  const [loading, setLoading] = useState(null)
  const [erro, setErro] = useState(null)

  const comprar = async (ciclo) => {
    setErro(null)
    setLoading(ciclo)
    try { await irParaCheckout(ciclo) }
    catch (e) { setErro(e.message); setLoading(null) }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        {!bloqueante && (
          <button onClick={onClose} style={closeBtn} aria-label="Fechar">×</button>
        )}

        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 32 }}>🚀</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E1B4B', margin: '8px 0 4px' }}>
            {bloqueante ? 'Seu acesso expirou' : 'Desbloqueie o OrvixPlan Pro'}
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
            {motivo || 'Planeje em 5 pilares, receba lembretes automáticos e use a IA sem limites práticos.'}
          </p>
        </div>

        {/* Anual — destaque */}
        <div style={{ ...card, borderColor: '#4338CA', position: 'relative' }}>
          <span style={badge}>MAIS ECONÔMICO</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1E1B4B' }}>Anual</span>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#4338CA' }}>R$ 219</span>
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 10px' }}>
            12 meses — equivale a R$ 18,25/mês · pagamento único
          </p>
          <button onClick={() => comprar('anual')} disabled={loading} style={btnPrimary}>
            {loading === 'anual' ? 'Abrindo…' : 'Assinar anual'}
          </button>
        </div>

        {/* Mensal */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1E1B4B' }}>Mensal</span>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#1E1B4B' }}>R$ 19,90</span>
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 10px' }}>
            Renova todo mês · cancele quando quiser
          </p>
          <button onClick={() => comprar('mensal')} disabled={loading} style={btnSecondary}>
            {loading === 'mensal' ? 'Abrindo…' : 'Assinar mensal'}
          </button>
        </div>

        {erro && (
          <p style={{ fontSize: 12, color: '#DC2626', textAlign: 'center', marginTop: 4 }}>{erro}</p>
        )}

        <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
          Pagamento seguro via Stripe · pix e cartão
        </p>

        {bloqueante && onSignOut && (
          <button onClick={onSignOut} style={{
            border: 'none', background: 'none', color: '#9CA3AF',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
          }}>
            Sair da conta
          </button>
        )}
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(30,27,75,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20, zIndex: 1000,
}
const modal = {
  background: 'white', borderRadius: 18, padding: '22px 18px',
  width: '100%', maxWidth: 380, position: 'relative',
  display: 'flex', flexDirection: 'column', gap: 12,
  boxShadow: '0 20px 60px rgba(30,27,75,.3)',
}
const closeBtn = {
  position: 'absolute', top: 12, right: 14, border: 'none', background: 'none',
  fontSize: 26, color: '#9CA3AF', cursor: 'pointer', lineHeight: 1,
}
const card = {
  border: '1.5px solid #E0E7FF', borderRadius: 12, padding: '14px 14px',
}
const badge = {
  position: 'absolute', top: -9, left: 14, background: '#4338CA', color: 'white',
  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, letterSpacing: '.5px',
}
const btnPrimary = {
  width: '100%', padding: '11px', borderRadius: 9, border: 'none',
  background: '#4338CA', color: 'white', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
const btnSecondary = {
  width: '100%', padding: '11px', borderRadius: 9, border: '1.5px solid #4338CA',
  background: 'white', color: '#4338CA', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
