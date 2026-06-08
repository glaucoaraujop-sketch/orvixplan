import { useState, useCallback } from 'react'
import { useStore } from './hooks/useStore.js'
import { useAI } from './hooks/useAI.js'
import { DailyView } from './views/DailyView.jsx'
import { WeeklyView } from './views/WeeklyView.jsx'
import { MonthlyView } from './views/MonthlyView.jsx'
import { SettingsModal } from './components/SettingsModal.jsx'
import { DEFAULT_SETTINGS } from './constants/defaults.js'
import { MONTHS_PT, formatDateFull, addDays, getWeekDays } from './utils/dateUtils.js'

const loadSettings = () => {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('orvixplan_settings') || '{}') } }
  catch { return DEFAULT_SETTINGS }
}

const VIEWS = [
  { id: 'daily',   label: 'Diário'  },
  { id: 'weekly',  label: 'Semanal' },
  { id: 'monthly', label: 'Mensal'  },
]

export default function App() {
  const [date,        setDate]        = useState(new Date())
  const [view,        setView]        = useState('daily')
  const [settings,    setSettings]    = useState(loadSettings)
  const [showSettings,setShowSettings]= useState(false)

  const { store, getDay, addTask, deleteTask, toggleCheck } = useStore()
  const ai = useAI(settings.anthropicKey)

  const saveSettings = useCallback((s) => {
    setSettings(s)
    localStorage.setItem('orvixplan_settings', JSON.stringify(s))
  }, [])

  const navigate = (dir) => {
    if (view === 'daily')   setDate((d) => addDays(d, dir))
    if (view === 'weekly')  setDate((d) => addDays(d, dir * 7))
    if (view === 'monthly') {
      setDate((d) => {
        const n = new Date(d)
        n.setMonth(n.getMonth() + dir)
        return n
      })
    }
  }

  const titleLabel = () => {
    if (view === 'daily')  return formatDateFull(date)
    if (view === 'weekly') {
      const days = getWeekDays(date)
      return `${days[0].getDate()}–${days[6].getDate()} de ${MONTHS_PT[date.getMonth()]} ${date.getFullYear()}`
    }
    return `${MONTHS_PT[date.getMonth()]} ${date.getFullYear()}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F1FF' }}>
      {/* Top bar */}
      <header
        style={{
          background: 'white',
          borderBottom: '1px solid #EEF0FF',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 8px rgba(67,56,202,.06)',
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 58,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#4338CA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              📅
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1E1B4B' }}>OrvixPlan</span>
          </div>

          {/* View switcher */}
          <div
            style={{
              display: 'flex',
              background: '#F0F1FF',
              borderRadius: 8,
              padding: 3,
              gap: 2,
            }}
          >
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: view === v.id ? 'white' : 'transparent',
                  color: view === v.id ? '#4338CA' : '#6B7280',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: view === v.id ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1.5px solid #E0E7FF',
              background: 'white',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Date navigation */}
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '14px 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: 'center',
        }}
      >
        <button onClick={() => navigate(-1)} style={navBtnStyle}>←</button>

        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1E1B4B',
            textAlign: 'center',
            textTransform: 'capitalize',
            flex: 1,
            maxWidth: 380,
          }}
        >
          {titleLabel()}
        </span>

        <button
          onClick={() => setDate(new Date())}
          style={{ ...navBtnStyle, fontSize: 12, padding: '6px 10px' }}
        >
          Hoje
        </button>

        <button onClick={() => navigate(1)} style={navBtnStyle}>→</button>
      </div>

      {/* Main content */}
      <main style={{ padding: '14px 20px 40px' }}>
        {view === 'daily' && (
          <DailyView
            date={date}
            getDay={getDay}
            addTask={addTask}
            deleteTask={deleteTask}
            toggleCheck={toggleCheck}
            ai={ai}
            settings={settings}
          />
        )}
        {view === 'weekly' && (
          <WeeklyView
            date={date}
            store={store}
            getDay={getDay}
            onSelectDate={(d) => { setDate(d); setView('daily') }}
          />
        )}
        {view === 'monthly' && (
          <MonthlyView
            date={date}
            getDay={getDay}
            onSelectDate={(d) => { setDate(d); setView('daily') }}
          />
        )}
      </main>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

const navBtnStyle = {
  padding: '6px 12px',
  borderRadius: 8,
  border: '1.5px solid #E0E7FF',
  background: 'white',
  cursor: 'pointer',
  fontSize: 14,
  color: '#4338CA',
  fontWeight: 600,
  fontFamily: 'inherit',
}
