import { useEffect } from 'react'
import { PILLARS } from '../constants/pillars.js'
import { calcDayPct, heatmapColor } from '../utils/statsUtils.js'
import { getWeekDays, DAYS_PT, isSameDay, dateKey } from '../utils/dateUtils.js'

export function WeeklyView({ date, getDay, loadDateRange, onSelectDate }) {
  const days  = getWeekDays(date)
  const today = new Date()

  useEffect(() => {
    loadDateRange(days.map(dateKey))
  }, [date]) // eslint-disable-line

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
        }}
      >
        {days.map((d) => {
          const { tasks: allTasks, checks } = getDay(d)
          const pct = calcDayPct(allTasks, checks)
          const isToday = isSameDay(d, today)
          const isSelected = isSameDay(d, date)

          return (
            <div
              key={dateKey(d)}
              onClick={() => onSelectDate(d)}
              style={{
                background: isSelected ? '#EEF0FF' : 'white',
                border: `2px solid ${isSelected ? '#4338CA' : isToday ? '#C7D2FE' : '#EEF0FF'}`,
                borderRadius: 14,
                padding: '14px 10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>
                {DAYS_PT[d.getDay()]}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: isSelected ? '#4338CA' : '#1E1B4B', marginBottom: 10 }}>
                {d.getDate()}
              </div>

              {/* Heatmap circle */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: heatmapColor(pct),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: pct >= 80 ? '#15803D' : pct >= 50 ? '#1D4ED8' : pct > 0 ? '#92400E' : '#9CA3AF',
                }}
              >
                {pct > 0 ? `${pct}%` : '—'}
              </div>

              {/* Pillar dots */}
              <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                {PILLARS.map((p) => {
                  const tasksInPillar = allTasks.filter((t) => t.pillar === p.id)
                  if (!tasksInPillar.length) return null
                  return (
                    <div
                      key={p.id}
                      title={p.label}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: p.color,
                        opacity: .7,
                      }}
                    />
                  )
                })}
              </div>

              {allTasks.length > 0 && (
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 5 }}>
                  {allTasks.filter((t) => checks[t.id]).length}/{allTasks.length}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary row */}
      <div
        style={{
          marginTop: 16,
          background: 'white',
          borderRadius: 14,
          padding: '16px 18px',
          border: '1px solid #EEF0FF',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
          Resumo da semana
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {PILLARS.map((p) => {
            let total = 0, done = 0
            days.forEach((d) => {
              const { tasks: dt, checks: dc } = getDay(d)
              const all = dt.filter((t) => t.pillar === p.id)
              total += all.length
              done  += all.filter((t) => dc[t.id]).length
            })
            return (
              <div
                key={p.id}
                style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  background: p.light,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 2 }}>{p.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: p.text }}>{done}/{total}</div>
                <div style={{ fontSize: 10, color: p.text, opacity: .7 }}>{p.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
