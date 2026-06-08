import { useEffect } from 'react'
import { getMonthDays, DAYS_PT, dateKey, isSameDay } from '../utils/dateUtils.js'
import { calcDayPct, heatmapColor } from '../utils/statsUtils.js'

export function MonthlyView({ date, getDay, loadDateRange, onSelectDate }) {
  const days  = getMonthDays(date)
  const today = new Date()

  useEffect(() => {
    loadDateRange(days.filter(Boolean).map(dateKey))
  }, [date]) // eslint-disable-line

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div
        style={{
          background: 'white',
          borderRadius: 14,
          padding: '18px',
          border: '1px solid #EEF0FF',
        }}
      >
        {/* Day-of-week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {DAYS_PT.map((d) => (
            <div
              key={d}
              style={{
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '.5px',
                padding: '4px 0',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />

            const { tasks: allTasks, checks } = getDay(d)
            const pct = calcDayPct(allTasks, checks)
            const isToday    = isSameDay(d, today)
            const isSelected = isSameDay(d, date)
            const isFuture   = d > today

            return (
              <div
                key={dateKey(d)}
                onClick={() => onSelectDate(d)}
                style={{
                  borderRadius: 10,
                  padding: '8px 4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: isSelected ? '#4338CA' : isFuture ? 'transparent' : heatmapColor(pct),
                  border: `2px solid ${isToday && !isSelected ? '#4338CA' : 'transparent'}`,
                  transition: 'all .15s',
                  minHeight: 52,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: isToday || isSelected ? 700 : 500,
                    color: isSelected ? 'white' : isToday ? '#4338CA' : isFuture ? '#D1D5DB' : '#1E1B4B',
                  }}
                >
                  {d.getDate()}
                </span>
                {!isFuture && allTasks.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: isSelected ? 'rgba(255,255,255,.8)' : '#6B7280',
                      marginTop: 2,
                    }}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { color: '#F3F4F6', label: 'Sem tarefas' },
            { color: '#FEF3C7', label: '< 50%' },
            { color: '#DBEAFE', label: '50–79%' },
            { color: '#DCFCE7', label: '≥ 80%' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: '1px solid #E5E7EB' }} />
              <span style={{ fontSize: 11, color: '#6B7280' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
