import { useState } from 'react'
import { irParaCheckout } from '../hooks/useAccess.js'

// Paywall — oferta única: pagamento único R$37 (vitalício).
// `bloqueante` esconde o botão de fechar (trial expirado).
export function PricingModal({ onClose, bloqueante = false, motivo, onSignOut }) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const comprar = async () => {
    setErro(null)
    setLoading(true)
    try { await irParaCheckout() }
    catch (e) { setErro(e.message); setLoading(false) }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        {!bloqueante && (
          <button onClick={onClose} style={closeBtn} aria-label="Fechar">×</button>
        )}

        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 32 }}>🚀</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E1B4B', margin: '8px 0 4px' }}>
            {bloqueante ? 'Seu teste acabou' : 'Desbloqueie o OrvixPlan'}
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
            {motivo || 'Pague uma vez e use para sempre — sem mensalidade, sem renovação.'}
          </p>
        </div>

        {/* Oferta única — vitalício */}
        <div style={{ ...card, borderColor: '#4338CA', position: 'relative' }}>
          <span style={badge}>PAGAMENTO ÚNICO</span>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 14, color: '#9CA3AF' }}>R$</span>
            <span style={{ fontWeight: 800, fontSize: 40, color: '#4338CA', lineHeight: 1 }}>37</span>
          </div>
          <p style={{ fontSize: 12, color: '#16A34A', textAlign: 'center', fontWeight: 600, margin: '4px 0 12px' }}>
            ✓ Acesso vitalício · pague uma vez só
          </p>

          <ul style={beneficios}>
            <li>📅 Planejamento diário, semanal e mensal</li>
            <li>🎯 Categorias de vida (espiritual, família, trabalho…)</li>
            <li>🔔 Lembretes automáticos no horário de cada tarefa</li>
            <li>✨ Assistente de IA para organizar seu dia</li>
            <li>📝 Diário e acompanhamento de progresso</li>
          </ul>

          <button onClick={comprar} disabled={loading} style={btnPrimary}>
            {loading ? 'Abrindo…' : 'Liberar acesso vitalício'}
          </button>
        </div>

        {erro && (
          <p style={{ fontSize: 12, color: '#DC2626', textAlign: 'center', marginTop: 4 }}>{erro}</p>
        )}

        <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
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
  border: '2px solid #E0E7FF', borderRadius: 14, padding: '16px 16px',
}
const badge = {
  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
  background: '#4338CA', color: 'white',
  fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '.5px',
  whiteSpace: 'nowrap',
}
const beneficios = {
  listStyle: 'none', padding: 0, margin: '0 0 14px',
  display: 'flex', flexDirection: 'column', gap: 7,
  fontSize: 13, color: '#374151', lineHeight: 1.4,
}
const btnPrimary = {
  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
  background: '#4338CA', color: 'white', fontSize: 15, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
