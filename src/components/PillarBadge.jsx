import { PILLAR_MAP } from '../constants/pillars.js'

export function PillarBadge({ pillarId, small }) {
  const p = PILLAR_MAP[pillarId]
  if (!p) return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: small ? '2px 7px' : '3px 10px',
        borderRadius: 20,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        background: p.light,
        color: p.text,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: small ? 10 : 12 }}>{p.emoji}</span>
      {p.label}
    </span>
  )
}
