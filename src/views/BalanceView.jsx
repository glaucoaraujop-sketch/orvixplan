import { useState, useEffect, useMemo } from 'react'
import { PILLARS } from '../constants/pillars.js'
import { AIPanel } from '../components/AIPanel.jsx'
import {
  lastNDays, rangeKeys, pillarBreakdownRange, currentStreak, forgottenPillars,
} from '../utils/insightsUtils.js'

export function BalanceView({ getDay, loadDateRange, ai }) {
  const [period, setPeriod] = useState(7)
  const [review, setReview] = useState(null)

  const dates = useMemo(() => lastNDays(period), [period])

  useEffect(() => {
    loadDateRange(rangeKeys(dates))
  }, [period]) // eslint-disable-line

  const breakdown  = useMemo(() => pillarBreakdownRange(dates, getDay), [dates, getDay])
  const streak     = useMemo(() => currentStreak(getDay), [getDay])
  const forgotten  = useMemo(() => forgottenPillars(breakdown), [breakdown])

  const totalTasks = PILLARS.reduce((s, p) => s + (breakdown[p.id]?.total || 0), 0)
  const totalDone  = PILLARS.reduce((s, p) => s + (breakdown[p.id]?.done || 0), 0)
  const mediaGeral = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0

  const handleReview = async () => {
    setReview(null)
    const resumo = PILLARS
      .filter((p) => breakdown[p.id]?.total > 0)
      .map((p) => `${p.label}: ${breakdown[p.id].done}/${breakdown[p.id].total}`)
      .join('\n') + `\nMédia geral: ${mediaGeral}%`
    try {
      const txt = await ai.reviewWeek(resumo)
      if (txt) setReview(txt)
    } catch { /* créditos: o app abre o modal de compra */ }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* Período */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
        {[7, 30].map((n) => (
          <button key={n} onClick={() => setPeriod(n)} style={{
            padding: '6px 16px', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            border: `1.5px solid ${period === n ? '#4338CA' : '#E0E7FF'}`,
            background: period === n ? '#EEF0FF' : 'white',
            color: period === n ? '#4338CA' : '#6B7280',
          }}>{n} dias</button>
        ))}
      </div>

      {/* Streak + média */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ ...card, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 30 }}>🔥</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#4338CA' }}>{streak}</div>
          <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
            {streak === 1 ? 'dia de ofensiva' : 'dias de ofensiva'}
          </div>
        </div>
        <div style={{ ...card, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 30 }}>🎯</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#16A34A' }}>{mediaGeral}%</div>
          <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>conclusão no período</div>
        </div>
      </div>

      {/* Roda da Vida */}
      <div style={{ ...card, textAlign: 'center' }}>
        <p style={sectionLabel}>🛞 Roda da Vida</p>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>
          Seu equilíbrio entre as áreas nos últimos {period} dias
        </p>
        <RadarChart breakdown={breakdown} />
      </div>

      {/* Pilares esquecidos */}
      {forgotten.length > 0 && (
        <div style={{ ...card, marginTop: 14 }}>
          <p style={sectionLabel}>💡 Áreas esquecidas</p>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 10px', lineHeight: 1.5 }}>
            Você não registrou nada nestes pilares nos últimos {period} dias. Que tal incluir algo?
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {forgotten.map((p) => (
              <span key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                borderRadius: 20, background: p.light, color: p.text, fontSize: 13, fontWeight: 600,
              }}>{p.emoji} {p.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Revisão semanal por IA */}
      <div style={{ ...card, marginTop: 14 }}>
        <p style={sectionLabel}>✨ Revisão da semana por IA</p>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 12px', lineHeight: 1.5 }}>
          A IA analisa seu período e escreve uma reflexão + sugestões pra você equilibrar melhor. Usa 1 crédito de IA.
        </p>
        <button
          onClick={handleReview}
          disabled={ai.loading || totalTasks === 0}
          style={{
            width: '100%', padding: 12, borderRadius: 10, border: 'none',
            background: totalTasks === 0 ? '#E0E7FF' : '#4338CA',
            color: totalTasks === 0 ? '#9CA3AF' : 'white',
            fontSize: 14, fontWeight: 700, cursor: totalTasks === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {ai.loading ? 'Analisando…' : totalTasks === 0 ? 'Sem dados suficientes' : 'Gerar revisão da semana'}
        </button>
        <AIPanel content={review} loading={ai.loading} error={ai.error} onClose={() => setReview(null)} />
      </div>
    </div>
  )
}

// ─── Radar SVG (Roda da Vida) ────────────────────────────────────────────────
function RadarChart({ breakdown }) {
  const size = 280, cx = size / 2, cy = size / 2, R = 105
  const n = PILLARS.length
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const point = (i, v) => [cx + Math.cos(angle(i)) * R * (v / 100), cy + Math.sin(angle(i)) * R * (v / 100)]

  const poly = PILLARS.map((p, i) => point(i, breakdown[p.id]?.pct || 0).join(',')).join(' ')
  const grid = [25, 50, 75, 100].map((lvl) =>
    PILLARS.map((_, i) => point(i, lvl).join(',')).join(' '))

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: '100%' }}>
      {/* Grades */}
      {grid.map((g, idx) => (
        <polygon key={idx} points={g} fill="none" stroke="#EEF0FF" strokeWidth="1" />
      ))}
      {/* Eixos */}
      {PILLARS.map((_, i) => {
        const [x, y] = point(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#EEF0FF" strokeWidth="1" />
      })}
      {/* Área de dados */}
      <polygon points={poly} fill="rgba(67,56,202,.22)" stroke="#4338CA" strokeWidth="2" strokeLinejoin="round" />
      {/* Vértices + emojis */}
      {PILLARS.map((p, i) => {
        const [vx, vy] = point(i, breakdown[p.id]?.pct || 0)
        const [lx, ly] = point(i, 122)
        return (
          <g key={p.id}>
            <circle cx={vx} cy={vy} r="3" fill="#4338CA" />
            <text x={lx} y={ly} fontSize="16" textAnchor="middle" dominantBaseline="middle">{p.emoji}</text>
          </g>
        )
      })}
    </svg>
  )
}

const card = {
  background: 'white', borderRadius: 14, padding: '16px 14px', border: '1px solid #EEF0FF',
}
const sectionLabel = {
  fontSize: 12, fontWeight: 600, color: '#6B7280',
  textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 0,
}
