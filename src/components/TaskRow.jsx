import { PILLAR_MAP } from '../constants/pillars.js'
import { PillarBadge } from './PillarBadge.jsx'

export function TaskRow({ task, checked, onToggle, onDelete }) {
  const pillar = PILLAR_MAP[task.pillar]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 10,
        background: checked ? '#F9FAFB' : 'white',
        border: `1px solid ${checked ? '#E5E7EB' : '#EEF0FF'}`,
        marginBottom: 6,
        transition: 'all .15s',
        borderLeft: pillar ? `3px solid ${pillar.color}` : undefined,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${checked ? '#4338CA' : '#D1D5DB'}`,
          background: checked ? '#4338CA' : 'white',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .15s',
        }}
      >
        {checked && (
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span
        style={{
          fontSize: 13,
          color: '#94A3B8',
          fontWeight: 500,
          minWidth: 40,
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
        }}
      >
        {task.label}
      </span>

      <PillarBadge pillarId={task.pillar} small />

      {!task.fixed && (
        <button
          onClick={onDelete}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#D1D5DB',
            fontSize: 16,
            lineHeight: 1,
            padding: '0 2px',
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
