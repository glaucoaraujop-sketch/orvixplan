import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './hooks/useAuth.js'
import { useSupabaseStore } from './hooks/useSupabaseStore.js'
import { useAI } from './hooks/useAI.js'
import { useAccess } from './hooks/useAccess.js'
import { DailyView } from './views/DailyView.jsx'
import { WeeklyView } from './views/WeeklyView.jsx'
import { MonthlyView } from './views/MonthlyView.jsx'
import { LoginView } from './views/LoginView.jsx'
import { LandingView } from './views/LandingView.jsx'
import { SettingsModal } from './components/SettingsModal.jsx'
import { PricingModal } from './components/PricingModal.jsx'
import { DEFAULT_SETTINGS } from './constants/defaults.js'
import { MONTHS_PT, formatDateFull, addDays, getWeekDays, dateKey } from './utils/dateUtils.js'

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
  const { user, loading: authLoading, signIn, verifyOtp, signOut } = useAuth()
  const [date,         setDate]         = useState(new Date())
  const [view,         setView]         = useState('daily')
  const [settings,     setSettings]     = useState(loadSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [showPricing,  setShowPricing]  = useState(false)
  const [showLogin,    setShowLogin]    = useState(false)
  const [showIAPack,   setShowIAPack]   = useState(false)

  const { loading: storeLoading, getDay, loadDate, loadDateRange, addTask, deleteTask, toggleCheck, saveJournal, fixedTasks, addFixedTask, removeFixedTask } =
    useSupabaseStore(user?.id)

  const access = useAccess(user?.id)
  const ai = useAI(settings)

  // IA sem créditos → abre o modal de compra do pacote
  useEffect(() => { if (ai.limiteIA) setShowIAPack(true) }, [ai.limiteIA])

  // Retorno do checkout do Stripe: revalida acesso (webhook pode levar 1–2s) e limpa a URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'sucesso') {
      const t = setTimeout(() => access.refresh(), 2000)
      window.history.replaceState({}, '', window.location.pathname)
      return () => clearTimeout(t)
    }
    if (params.get('checkout') === 'cancelado') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, []) // eslint-disable-line

  // Load today on mount
  useEffect(() => {
    if (user) loadDate(date)
  }, [user]) // eslint-disable-line

  // Load date when it changes (daily view)
  useEffect(() => {
    if (user && view === 'daily') loadDate(date)
  }, [date, user]) // eslint-disable-line

  const saveSettings = useCallback((s) => {
    setSettings(s)
    localStorage.setItem('orvixplan_settings', JSON.stringify(s))
  }, [])

  const navigate = (dir) => {
    if (view === 'daily')   setDate((d) => addDays(d, dir))
    if (view === 'weekly')  setDate((d) => addDays(d, dir * 7))
    if (view === 'monthly') setDate((d) => {
      const n = new Date(d)
      n.setMonth(n.getMonth() + dir)
      return n
    })
  }

  const titleLabel = () => {
    if (view === 'daily')  return formatDateFull(date)
    if (view === 'weekly') {
      const days = getWeekDays(date)
      return `${days[0].getDate()}–${days[6].getDate()} de ${MONTHS_PT[date.getMonth()]} ${date.getFullYear()}`
    }
    return `${MONTHS_PT[date.getMonth()]} ${date.getFullYear()}`
  }

  // Auth loading
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F1FF' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
          <p style={{ color: '#6B7280', fontSize: 14 }}>Carregando…</p>
        </div>
      </div>
    )
  }

  // Not authenticated → landing de vendas; CTA abre o login
  if (!user) {
    return showLogin
      ? <LoginView onSignIn={signIn} onVerifyOtp={verifyOtp} onBack={() => setShowLogin(false)} />
      : <LandingView onStart={() => setShowLogin(true)} />
  }

  // Sem acesso ao app → paywall bloqueante R$37 (pagamento único pra entrar)
  if (!access.loading && !access.ativo) {
    return (
      <PricingModal
        bloqueante
        modo="app"
        motivo="Pague uma vez e use o OrvixPlan para sempre — sem mensalidade."
        onSignOut={signOut}
      />
    )
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
                width: 32, height: 32,
                borderRadius: 8,
                background: '#4338CA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}
            >
              📅
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1E1B4B' }}>OrvixPlan</span>
          </div>

          {/* View switcher */}
          <div style={{ display: 'flex', background: '#F0F1FF', borderRadius: 8, padding: 3, gap: 2 }}>
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
              width: 36, height: 36,
              borderRadius: 8,
              border: '1.5px solid #E0E7FF',
              background: 'white',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Saldo de créditos de IA */}
      {!access.loading && (
        <div style={bannerStyle(access.iaCreditos > 0 ? '#EEF0FF' : '#FEF2F2', access.iaCreditos > 0 ? '#4338CA' : '#DC2626')}>
          <span>🤖 {access.iaCreditos} {access.iaCreditos === 1 ? 'uso de IA' : 'usos de IA'} {access.iaCreditos === 0 ? '— acabaram' : 'restantes'}</span>
          <button onClick={() => setShowIAPack(true)} style={bannerBtn}>Comprar 100 · R$ 29,90</button>
        </div>
      )}

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
            fontSize: 15, fontWeight: 600, color: '#1E1B4B',
            textAlign: 'center', textTransform: 'capitalize',
            flex: 1, maxWidth: 380,
          }}
        >
          {titleLabel()}
        </span>
        <button onClick={() => setDate(new Date())} style={{ ...navBtnStyle, fontSize: 12, padding: '6px 10px' }}>
          Hoje
        </button>
        <button onClick={() => navigate(1)} style={navBtnStyle}>→</button>
      </div>

      {/* Store loading indicator */}
      {storeLoading && (
        <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 12, color: '#9CA3AF' }}>
          Sincronizando…
        </div>
      )}

      {/* Main content */}
      <main style={{ padding: '14px 20px 40px' }}>
        {view === 'daily' && (
          <DailyView
            date={date}
            getDay={getDay}
            addTask={addTask}
            deleteTask={deleteTask}
            toggleCheck={toggleCheck}
            saveJournal={saveJournal}
            ai={ai}
            settings={settings}
          />
        )}
        {view === 'weekly' && (
          <WeeklyView
            date={date}
            getDay={getDay}
            loadDateRange={loadDateRange}
            onSelectDate={(d) => { setDate(d); setView('daily') }}
          />
        )}
        {view === 'monthly' && (
          <MonthlyView
            date={date}
            getDay={getDay}
            loadDateRange={loadDateRange}
            onSelectDate={(d) => { setDate(d); setView('daily') }}
          />
        )}
      </main>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
          onSignOut={signOut}
          userEmail={user.email}
          fixedTasks={fixedTasks}
          addFixedTask={addFixedTask}
          removeFixedTask={removeFixedTask}
        />
      )}

      {showPricing && (
        <PricingModal modo="app" onClose={() => setShowPricing(false)} />
      )}

      {showIAPack && (
        <PricingModal
          modo="ia"
          onClose={() => { setShowIAPack(false); ai.clearLimiteIA(); access.refresh() }}
        />
      )}
    </div>
  )
}

const bannerStyle = (bg, color) => ({
  background: bg, color,
  padding: '8px 20px', fontSize: 13, fontWeight: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
  flexWrap: 'wrap',
})
const bannerBtn = {
  padding: '4px 14px', borderRadius: 7, border: 'none',
  background: '#4338CA', color: 'white', fontSize: 12, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
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
