import { useState } from 'react'

export function SettingsModal({ settings, onSave, onClose, onSignOut, userEmail }) {
  const [form, setForm] = useState({ ...settings })
  const [tab,  setTab]  = useState('geral')

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(30,27,75,.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 18,
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 20px 60px rgba(30,27,75,.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1E1B4B' }}>Configurações</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '12px 24px 0', gap: 4 }}>
          {['geral', 'ia', 'conta'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: tab === t ? '#EEF0FF' : 'transparent',
                color: tab === t ? '#4338CA' : '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}
            >
              {t === 'ia' ? 'IA' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {/* Geral */}
          {tab === 'geral' && (
            <>
              <label style={labelStyle}>Seu nome</label>
              <input
                value={form.userName}
                onChange={(e) => set('userName', e.target.value)}
                style={inputStyle}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Início do dia</label>
                  <input
                    type="number" min={0} max={12}
                    value={form.startHour}
                    onChange={(e) => set('startHour', Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fim do dia</label>
                  <input
                    type="number" min={18} max={23}
                    value={form.endHour}
                    onChange={(e) => set('endHour', Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </>
          )}

          {/* IA */}
          {tab === 'ia' && (
            <>
              <label style={labelStyle}>Chave Anthropic (opcional)</label>
              <input
                type="password"
                value={form.anthropicKey || ''}
                onChange={(e) => set('anthropicKey', e.target.value)}
                placeholder="sk-ant-… (ou VITE_ANTHROPIC_KEY no EasyPanel)"
                style={inputStyle}
              />
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: -10, marginBottom: 16 }}>
                Se configurado no EasyPanel, deixe em branco.
              </p>

              <label style={labelStyle}>Seu papel / profissão</label>
              <input
                value={form.aiRole || ''}
                onChange={(e) => set('aiRole', e.target.value)}
                placeholder="ex: empreendedor e desenvolvedor"
                style={inputStyle}
              />

              <label style={labelStyle}>Empresas</label>
              <input
                value={form.aiCompanies || ''}
                onChange={(e) => set('aiCompanies', e.target.value)}
                placeholder="ex: Doutor iPhone, OrvixFlow, OrvixOS"
                style={inputStyle}
              />

              <label style={labelStyle}>Família</label>
              <input
                value={form.aiFamily || ''}
                onChange={(e) => set('aiFamily', e.target.value)}
                placeholder="ex: marido da Mara e pai do Theo"
                style={inputStyle}
              />
            </>
          )}

          {/* Conta */}
          {tab === 'conta' && (
            <>
              <div
                style={{
                  padding: '14px 16px',
                  background: '#F9FAFB',
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Logado como</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1B4B' }}>{userEmail}</p>
              </div>

              <button
                onClick={onSignOut}
                style={{
                  width: '100%',
                  padding: 11,
                  borderRadius: 10,
                  border: '1.5px solid #FEE2E2',
                  background: 'white',
                  color: '#DC2626',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Sair da conta
              </button>
            </>
          )}

          {tab !== 'conta' && (
            <button
              onClick={() => { onSave(form); onClose() }}
              style={{
                width: '100%',
                padding: 11,
                background: '#4338CA',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginTop: 4,
              }}
            >
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#6B7280',
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing: '.5px',
}

const inputStyle = {
  width: '100%',
  border: '1.5px solid #E0E7FF',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  color: '#1E1B4B',
  marginBottom: 14,
  display: 'block',
}
