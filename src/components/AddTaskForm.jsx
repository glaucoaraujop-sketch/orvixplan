import { useState } from 'react'
import { PILLARS } from '../constants/pillars.js'
import { TASK_SUGGESTIONS } from '../constants/defaults.js'

export function AddTaskForm({ onAdd, onClose }) {
  const [label,  setLabel]  = useState('')
  const [pillar, setPillar] = useState('trabalho')
  const [time,   setTime]   = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!label.trim()) return
    onAdd({ label: label.trim(), pillar, time: time || '08:00', fixed: false })
    onClose()
  }

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #EEF0FF',
        borderRadius: 14,
        padding: 18,
        marginBottom: 12,
        boxShadow: '0 4px 20px rgba(67,56,202,.08)',
      }}
    >
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nome da tarefa…"
            style={{
              width: '100%',
              border: '1.5px solid #E0E7FF',
              borderRadius: 8,
              padding: '9px 12px',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
              color: '#1E1B4B',
            }}
          />
        </div>

        {/* Suggestions */}
        {TASK_SUGGESTIONS[pillar] && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {TASK_SUGGESTIONS[pillar].slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setLabel(s)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 20,
                  border: '1px solid #E0E7FF',
                  background: label === s ? '#4338CA' : '#F5F3FF',
                  color: label === s ? 'white' : '#4338CA',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{
              border: '1.5px solid #E0E7FF',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              width: 110,
              color: '#1E1B4B',
            }}
          />

          <select
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
            style={{
              flex: 1,
              border: '1.5px solid #E0E7FF',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              background: 'white',
              color: '#1E1B4B',
            }}
          >
            {PILLARS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: 8,
              border: 'none',
              background: '#4338CA',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: 'white',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              color: '#6B7280',
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
