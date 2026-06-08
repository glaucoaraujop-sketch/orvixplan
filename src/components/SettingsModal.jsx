import { useState } from 'react'

export function SettingsModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({ ...settings })

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
          padding: 28,
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 20px 60px rgba(30,27,75,.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E1B4B' }}>Configurações</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>

        <label style={labelStyle}>Seu nome</label>
        <input
          value={form.userName}
          onChange={(e) => set('userName', e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Chave da API Anthropic</label>
        <input
          type="password"
          value={form.anthropicKey}
          onChange={(e) => set('anthropicKey', e.target.value)}
          placeholder="sk-ant-… (ou configure VITE_ANTHROPIC_KEY)"
          style={inputStyle}
        />
        <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14, marginTop: -10 }}>
          Necessária para usar a IA. Armazenada localmente.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Início do dia</label>
            <input
              type="number"
              min={0}
              max={12}
              value={form.startHour}
              onChange={(e) => set('startHour', Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Fim do dia</label>
            <input
              type="number"
              min={18}
              max={23}
              value={form.endHour}
              onChange={(e) => set('endHour', Number(e.target.value))}
              style={inputStyle}
            />
          </div>
        </div>

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
          }}
        >
          Salvar
        </button>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
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
