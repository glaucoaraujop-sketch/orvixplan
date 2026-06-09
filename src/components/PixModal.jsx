import { useState, useEffect, useRef } from 'react'
import { criarPix, consultarAcesso } from '../hooks/useAccess.js'

// Modal de pagamento Pix (Mercado Pago). Cria o pagamento, mostra o QR Code,
// e fica verificando até o pagamento ser confirmado.
// props: { produto: 'app'|'ia_pack', onClose, onPaid }
export function PixModal({ produto = 'app', onClose, onPaid }) {
  const [pix, setPix]       = useState(null)
  const [erro, setErro]     = useState(null)
  const [pago, setPago]     = useState(false)
  const [copiado, setCopiado] = useState(false)
  const baseline = useRef(null)
  const isIA = produto === 'ia_pack'

  // Cria o Pix ao abrir
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        baseline.current = await consultarAcesso()
        const data = await criarPix(produto)
        if (alive) setPix(data)
      } catch (e) { if (alive) setErro(e.message) }
    })()
    return () => { alive = false }
  }, [produto])

  // Verifica a cada 4s se o pagamento foi confirmado (via webhook)
  useEffect(() => {
    if (!pix || pago) return
    const iv = setInterval(async () => {
      try {
        const a = await consultarAcesso()
        const b = baseline.current || {}
        const ok = isIA
          ? (a?.ia_creditos ?? 0) > (b?.ia_creditos ?? 0)
          : a?.ativo === true
        if (ok) {
          clearInterval(iv)
          setPago(true)
          setTimeout(() => onPaid?.(), 1600)
        }
      } catch {}
    }, 4000)
    return () => clearInterval(iv)
  }, [pix, pago, isIA, onPaid])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pix.qr_code)
      setCopiado(true); setTimeout(() => setCopiado(false), 2000)
    } catch {}
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <button onClick={onClose} style={closeBtn} aria-label="Fechar">×</button>

        {pago ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#16A34A', margin: '10px 0 4px' }}>Pagamento confirmado!</h2>
            <p style={{ fontSize: 14, color: '#6B7280' }}>
              {isIA ? '100 créditos de IA adicionados.' : 'Acesso vitalício liberado.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 30 }}>⚡</div>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: '#1E1B4B', margin: '6px 0 2px' }}>Pague com Pix</h2>
              <p style={{ fontSize: 13, color: '#6B7280' }}>
                {isIA ? '100 usos de IA · R$ 29,90' : 'Acesso vitalício · R$ 37,00'}
              </p>
            </div>

            {erro && <p style={{ fontSize: 13, color: '#DC2626', textAlign: 'center' }}>{erro}</p>}

            {!pix && !erro && (
              <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '30px 0' }}>
                Gerando QR Code…
              </p>
            )}

            {pix && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <img
                    src={`data:image/png;base64,${pix.qr_code_base64}`}
                    alt="QR Code Pix"
                    style={{ width: 220, height: 220, borderRadius: 12, border: '1px solid #EEF0FF' }}
                  />
                </div>
                <button onClick={copiar} style={btnCopy}>
                  {copiado ? '✓ Copiado!' : '📋 Copiar código Pix'}
                </button>
                <div style={waiting}>
                  <span style={spinner} /> Aguardando pagamento…
                </div>
                <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
                  Abra o app do seu banco, escolha pagar com Pix e escaneie o QR Code (ou cole o código).
                  O acesso libera automaticamente.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(30,27,75,.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1200,
}
const modal = {
  background: 'white', borderRadius: 18, padding: '22px 20px', width: '100%', maxWidth: 360,
  position: 'relative', boxShadow: '0 20px 60px rgba(30,27,75,.3)',
}
const closeBtn = {
  position: 'absolute', top: 12, right: 16, border: 'none', background: 'none',
  fontSize: 24, color: '#9CA3AF', cursor: 'pointer', lineHeight: 1,
}
const btnCopy = {
  width: '100%', padding: 11, borderRadius: 10, border: '1.5px solid #4338CA',
  background: 'white', color: '#4338CA', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
const waiting = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  marginTop: 14, fontSize: 13, color: '#6B7280', fontWeight: 600,
}
const spinner = {
  width: 14, height: 14, borderRadius: '50%',
  border: '2px solid #E0E7FF', borderTopColor: '#4338CA',
  display: 'inline-block', animation: 'spin 1s linear infinite',
}
