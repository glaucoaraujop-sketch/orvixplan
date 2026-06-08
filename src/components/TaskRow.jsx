import { PILLAR_MAP } from '../constants/pillars.js'
import { PillarBadge } from './PillarBadge.jsx'

export function TaskRow({ task, checked, onToggle, onDelete }) {
  const pillar = PILLAR_MAP[task.pillar]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 10,
        background: checked ? '#F9FAFB' : 'white',
        border: `1px solid ${checked ? '#E5E7EB' : '#EEF0FF'}`,
        marginBottom: 6,
        transition: 'all .15s',
        borderLeft: pillar ? `3px solid ${pillar.color}` : undefined,
        userSelect: 'none',
      }}
    >
      {/* Checkbox — 44×44px touch area */}
      <button
        onClick={onToggle}
        aria-label={checked ? 'Desmarcar tarefa' : 'Marcar tarefa'}
        style={{
          minWidth: 44,
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
          marginLeft: -6,
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            border: `2px solid ${checked ? '#4338CA' : '#D1D5DB'}`,
            background: checked ? '#4338CA' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all .15s',
            flexShrink: 0,
          }}
        >
          {checked && (
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
              <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </button>

      <span
        style={{
          fontSize: 13,
          color: '#94A3B8',
          fontWeight: 500,
          minWidth: 38,
          flexShrink: 0,
        }}
      >
        {task.time}
      </span>

      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 500,
          color: checked ? '#9CA3AF' : '#1E1B4B',
          textDecoration: checked ? 'line-through' : 'none',
          minWidth: 0,
          wordBreak: 'break-word',
        }}
      >
        {task.label}
      </span>

      <PillarBadge pillarId={task.pillar} small />

      {!task.fixed && (
        <button
          onClick={onDelete}
          aria-label="Remover tarefa"
          style={{
            minWidth: 36,
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#D1D5DB',
            fontSize: 18,
            flexShrink: 0,
            borderRadius: 6,
            marginRight: -6,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
