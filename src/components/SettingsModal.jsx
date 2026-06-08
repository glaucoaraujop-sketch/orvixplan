import { useState } from 'react'
import { PILLARS } from '../constants/pillars.js'

export function SettingsModal({ settings, onSave, onClose, onSignOut, userEmail, fixedTasks, addFixedTask, removeFixedTask }) {
  const [form,       setForm]       = useState({ ...settings })
  const [tab,        setTab]        = useState('geral')
  const [newLabel,   setNewLabel]   = useState('')
  const [newPillar,  setNewPillar]  = useState('trabalho')
  const [newTime,    setNewTime]    = useState('')
  const [adding,     setAdding]     = useState(false)

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleAddFixed = async () => {
    if (!newLabel.trim()) return
    setAdding(true)
    await addFixedTask({ label: newLabel.trim(), pillar: newPillar, time: newTime || null })
    setNewLabel('')
    setNewTime('')
    setAdding(false)
  }

  const TABS = [
    { id: 'geral',    label: 'Geral'    },
    { id: 'rotina',   label: 'Rotina'   },
    { id: 'ia',       label: 'IA'       },
    { id: 'instalar', label: 'Instalar' },
    { id: 'conta',    label: 'Conta'    },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(30,27,75,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'white', borderRadius: 18, width: '100%', maxWidth: 460,
          boxShadow: '0 20px 60px rgba(30,27,75,.2)', overflow: 'hidden',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1E1B4B' }}>Configurações</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '12px 24px 0', gap: 4, flexShrink: 0, overflowX: 'auto' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', whiteSpace: 'nowrap',
                background: tab === t.id ? '#EEF0FF' : 'transparent',
                color: tab === t.id ? '#4338CA' : '#6B7280',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content (scrollable) */}
        <div style={{ padding: '16px 24px 24px', overflowY: 'auto' }}>

          {/* Geral */}
          {tab === 'geral' && (
            <>
              <label style={labelStyle}>Seu nome</label>
              <input value={form.userName} onChange={(e) => set('userName', e.target.value)} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Início do dia</label>
                  <input type="number" min={0} max={12} value={form.startHour}
                    onChange={(e) => set('startHour', Number(e.target.value))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Fim do dia</label>
                  <input type="number" min={18} max={23} value={form.endHour}
                    onChange={(e) => set('endHour', Number(e.target.value))} style={inputStyle} />
                </div>
              </div>
            </>
          )}

          {/* Rotina — tarefas fixas */}
          {tab === 'rotina' && (
            <>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
                Tarefas que aparecem em todos os dias automaticamente.
              </p>

              {(fixedTasks || []).length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '16px 0 20px' }}>
                  Nenhuma tarefa fixa ainda.
                </p>
              )}

              {(fixedTasks || []).map((t) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', borderRadius: 10, border: '1px solid #EEF0FF',
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 12, color: '#94A3B8', minWidth: 38 }}>{t.time}</span>
                  <span style={{ flex: 1, fontSize: 14, color: '#1E1B4B', fontWeight: 500 }}>{t.label}</span>
                  <button
                    onClick={() => removeFixedTask(t.id)}
                    style={{
                      minWidth: 32, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', fontSize: 18,
                    }}
                  >×</button>
                </div>
              ))}

              {/* Add form */}
              <div style={{ borderTop: '1px solid #EEF0FF', paddingTop: 14, marginTop: 6 }}>
                <label style={labelStyle}>Nova tarefa fixa</label>
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Nome da tarefa…"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFixed()}
                  style={{ ...inputStyle, marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    type="time" value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0, width: 110, flexShrink: 0 }}
                  />
                  <select
                    value={newPillar}
                    onChange={(e) => setNewPillar(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                  >
                    {PILLARS.map((p) => (
                      <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddFixed}
                  disabled={adding || !newLabel.trim()}
                  style={{
                    width: '100%', padding: 10, borderRadius: 10, border: 'none',
                    background: newLabel.trim() ? '#4338CA' : '#E0E7FF',
                    color: newLabel.trim() ? 'white' : '#9CA3AF',
                    fontSize: 13, fontWeight: 600, cursor: newLabel.trim() ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                  }}
                >
                  {adding ? 'Adicionando…' : '+ Adicionar tarefa fixa'}
                </button>
              </div>
            </>
          )}

          {/* IA */}
          {tab === 'ia' && (
            <>
              <label style={labelStyle}>Seu papel / profissão</label>
              <input value={form.aiRole || ''} onChange={(e) => set('aiRole', e.target.value)}
                placeholder="ex: empreendedor e desenvolvedor" style={inputStyle} />
              <label style={labelStyle}>Empresas</label>
              <input value={form.aiCompanies || ''} onChange={(e) => set('aiCompanies', e.target.value)}
                placeholder="ex: Doutor iPhone, OrvixFlow, OrvixOS" style={inputStyle} />
              <label style={labelStyle}>Família</label>
              <input value={form.aiFamily || ''} onChange={(e) => set('aiFamily', e.target.value)}
                placeholder="ex: casado, pai de dois filhos" style={inputStyle} />
            </>
          )}

          {/* Instalar como app (PWA) */}
          {tab === 'instalar' && (
            <>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 16 }}>
                Instale o OrvixPlan na tela inicial pra abrir como um app de verdade —
                em tela cheia e <strong>recebendo as notificações de lembrete</strong>.
              </p>

              <div style={installCard}>
                <div style={installTitle}> iPhone / iPad (Safari)</div>
                <ol style={installList}>
                  <li>Abra o site no <strong>Safari</strong></li>
                  <li>Toque no botão <strong>Compartilhar</strong> <span style={{ fontSize: 15 }}>􀈂</span> (quadrado com seta pra cima)</li>
                  <li>Role e toque em <strong>“Adicionar à Tela de Início”</strong></li>
                  <li>Toque em <strong>“Adicionar”</strong> no canto superior</li>
                </ol>
                <p style={installNote}>⚠️ No iPhone, as notificações só funcionam depois de instalar por aqui.</p>
              </div>

              <div style={installCard}>
                <div style={installTitle}>🤖 Android (Chrome)</div>
                <ol style={installList}>
                  <li>Abra o site no <strong>Chrome</strong></li>
                  <li>Toque no menu <strong>⋮</strong> (três pontos, canto superior)</li>
                  <li>Toque em <strong>“Instalar app”</strong> ou <strong>“Adicionar à tela inicial”</strong></li>
                  <li>Confirme em <strong>“Instalar”</strong></li>
                </ol>
                <p style={installNote}>💡 Às vezes aparece um banner “Instalar” automático — é só tocar.</p>
              </div>
            </>
          )}

          {/* Conta */}
          {tab === 'conta' && (
            <>
              <div style={{ padding: '14px 16px', background: '#F9FAFB', borderRadius: 10, marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Logado como</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1B4B' }}>{userEmail}</p>
              </div>
              <button
                onClick={onSignOut}
                style={{
                  width: '100%', padding: 11, borderRadius: 10,
                  border: '1.5px solid #FEE2E2', background: 'white',
                  color: '#DC2626', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Sair da conta
              </button>
            </>
          )}

          {/* Save button — only for geral + ia */}
          {(tab === 'geral' || tab === 'ia') && (
            <button
              onClick={() => { onSave(form); onClose() }}
              style={{
                width: '100%', padding: 11, background: '#4338CA', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
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
  display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px',
}

const inputStyle = {
  width: '100%', border: '1.5px solid #E0E7FF', borderRadius: 8,
  padding: '9px 12px', fontFamily: 'inherit', outline: 'none',
  color: '#1E1B4B', marginBottom: 14, display: 'block',
}

const installCard = {
  border: '1px solid #EEF0FF', borderRadius: 12, padding: '14px 16px', marginBottom: 12,
}
const installTitle = {
  fontSize: 14, fontWeight: 700, color: '#1E1B4B', marginBottom: 8,
}
const installList = {
  margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6,
  fontSize: 13, color: '#374151', lineHeight: 1.4,
}
const installNote = {
  fontSize: 12, color: '#6B7280', marginTop: 10,
  background: '#F9FAFB', borderRadius: 8, padding: '7px 10px',
}
