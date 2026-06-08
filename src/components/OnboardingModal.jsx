import { useState } from 'react'

const STEPS = [
  {
    emoji: '👋',
    title: 'Bem-vindo ao OrvixPlan!',
    text: 'Em 30 segundos você aprende a organizar seu dia com propósito. Vamos lá?',
  },
  {
    emoji: '🎯',
    title: 'Organize por pilares da vida',
    text: 'Cada tarefa pertence a uma área: espiritual, família, trabalho, saúde, finanças, estudos e mais. Assim você equilibra todas as partes da sua vida.',
  },
  {
    emoji: '➕',
    title: 'Adicione suas tarefas',
    text: 'Toque em “+ Adicionar” na seção de Tarefas pra criar uma tarefa, escolher o pilar e definir um horário.',
  },
  {
    emoji: '🔔',
    title: 'Receba lembretes na hora certa',
    text: 'Toque no sino 🔔 pra ativar. Você recebe uma notificação no horário de cada tarefa — mesmo com o app fechado.',
  },
  {
    emoji: '✨',
    title: 'Deixe a IA te ajudar',
    text: 'Na seção IA Assistente, peça pra sugerir seu dia, otimizar a agenda, refletir ou conversar. É seu copiloto de produtividade.',
  },
  {
    emoji: '📝',
    title: 'Registre seu dia',
    text: 'Use o Diário pra anotar como foi seu dia — aprendizados, dificuldades e vitórias. Ele salva sozinho.',
  },
  {
    emoji: '📲',
    title: 'Instale na tela inicial',
    text: 'Pra abrir como app e receber notificações, instale o OrvixPlan: vá em ⚙️ Configurações → aba “Instalar”. Tem o passo a passo pra iPhone e Android.',
  },
]

export function OnboardingModal({ onFinish }) {
  const [i, setI] = useState(0)
  const last = i === STEPS.length - 1
  const step = STEPS[i]

  return (
    <div style={overlay}>
      <div style={modal}>
        <button onClick={onFinish} style={skip}>Pular</button>

        <div style={{ fontSize: 56, marginBottom: 8 }}>{step.emoji}</div>
        <h2 style={{ fontSize: 21, fontWeight: 800, color: '#1E1B4B', marginBottom: 10 }}>{step.title}</h2>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.55, minHeight: 88 }}>{step.text}</p>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '18px 0 20px' }}>
          {STEPS.map((_, idx) => (
            <span key={idx} style={{
              width: idx === i ? 22 : 7, height: 7, borderRadius: 99,
              background: idx === i ? '#4338CA' : '#E0E7FF', transition: 'all .2s',
            }} />
          ))}
        </div>

        <button
          onClick={() => last ? onFinish() : setI(i + 1)}
          style={btnPrimary}
        >
          {last ? 'Começar a usar 🚀' : 'Próximo'}
        </button>
        {i > 0 && !last && (
          <button onClick={() => setI(i - 1)} style={btnBack}>Voltar</button>
        )}
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(30,27,75,.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20, zIndex: 1100,
}
const modal = {
  background: 'white', borderRadius: 20, padding: '32px 26px 24px',
  width: '100%', maxWidth: 380, textAlign: 'center', position: 'relative',
  boxShadow: '0 20px 60px rgba(30,27,75,.3)',
}
const skip = {
  position: 'absolute', top: 16, right: 18, border: 'none', background: 'none',
  color: '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const btnPrimary = {
  width: '100%', padding: '13px', borderRadius: 11, border: 'none',
  background: '#4338CA', color: 'white', fontSize: 15, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
const btnBack = {
  width: '100%', padding: '10px', borderRadius: 11, border: 'none',
  background: 'none', color: '#9CA3AF', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', marginTop: 6,
}
