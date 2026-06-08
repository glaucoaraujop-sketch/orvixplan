import { PILLARS } from '../constants/pillars.js'

// Landing page de vendas. CTA → onStart (abre login/cadastro).
export function LandingView({ onStart }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F0F1FF', color: '#1E1B4B' }}>

      {/* Nav */}
      <header style={nav}>
        <div style={navInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={logo}>📅</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>OrvixPlan</span>
          </div>
          <button onClick={onStart} style={navBtn}>Entrar</button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ ...section, paddingTop: 48, textAlign: 'center' }}>
        <span style={pill}>🎁 7 dias grátis · depois R$ 37 pagamento único</span>
        <h1 style={h1}>
          Organize sua vida em pilares<br />e <span style={{ color: '#4338CA' }}>conquiste seu dia</span>
        </h1>
        <p style={lead}>
          Planeje tarefas por área da vida, receba lembretes automáticos no horário certo
          e use IA pra montar seu dia. Tudo num app que cabe no seu bolso.
        </p>
        <button onClick={onStart} style={ctaBig}>Começar grátis →</button>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 10 }}>
          Sem cartão pra testar · pague uma vez, use pra sempre
        </p>

        {/* Mockup de pilares */}
        <div style={pillarsWrap}>
          {PILLARS.map((p) => (
            <div key={p.id} style={{ ...pillarChip, background: p.light, color: p.text }}>
              <span>{p.emoji}</span><span>{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section style={section}>
        <h2 style={h2}>Tudo que você precisa pra se organizar</h2>
        <div style={grid}>
          {FEATURES.map((f) => (
            <div key={f.title} style={featureCard}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preço */}
      <section style={{ ...section, textAlign: 'center' }}>
        <h2 style={h2}>Um preço justo. Pra sempre.</h2>
        <div style={priceCard}>
          <span style={priceBadge}>PAGAMENTO ÚNICO</span>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 5, marginTop: 8 }}>
            <span style={{ fontSize: 16, color: '#9CA3AF' }}>R$</span>
            <span style={{ fontWeight: 800, fontSize: 56, color: '#4338CA', lineHeight: 1 }}>37</span>
          </div>
          <p style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, margin: '6px 0 18px' }}>
            ✓ Acesso vitalício · sem mensalidade
          </p>
          <ul style={beneficios}>
            <li>✓ Planejamento diário, semanal e mensal</li>
            <li>✓ 9 categorias de vida</li>
            <li>✓ Lembretes push automáticos</li>
            <li>✓ Assistente de IA</li>
            <li>✓ Diário e progresso</li>
            <li>✓ Todas as atualizações futuras</li>
          </ul>
          <button onClick={onStart} style={ctaBig}>Quero começar grátis →</button>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 10 }}>
            Teste 7 dias grátis. Só paga se gostar.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ ...section, textAlign: 'center', paddingBottom: 60 }}>
        <h2 style={{ ...h2, marginBottom: 10 }}>Pronto pra organizar sua vida?</h2>
        <button onClick={onStart} style={ctaBig}>Começar agora →</button>
      </section>

      <footer style={footer}>
        <span>📅 OrvixPlan</span>
        <span style={{ color: '#9CA3AF' }}>Planeje com propósito. Viva com equilíbrio.</span>
      </footer>
    </div>
  )
}

const FEATURES = [
  { icon: '🎯', title: 'Pilares de vida', desc: 'Separe suas tarefas por área: espiritual, família, trabalho, saúde, finanças e mais.' },
  { icon: '🔔', title: 'Lembretes automáticos', desc: 'Receba uma notificação no horário exato de cada tarefa, mesmo com o app fechado.' },
  { icon: '✨', title: 'IA assistente', desc: 'Peça pra IA sugerir seu dia, otimizar a agenda ou refletir sobre o que foi feito.' },
  { icon: '📊', title: 'Progresso visual', desc: 'Veja seu percentual do dia e o equilíbrio entre as áreas da sua vida.' },
  { icon: '📝', title: 'Diário do dia', desc: 'Registre como foi seu dia — aprendizados, dificuldades e vitórias.' },
  { icon: '📱', title: 'Funciona offline', desc: 'Instale na tela inicial e use como um app nativo, no celular ou no computador.' },
]

// ─── estilos ──────────────────────────────────────────────────────────────────
const nav = { background: 'white', borderBottom: '1px solid #EEF0FF', position: 'sticky', top: 0, zIndex: 50 }
const navInner = { maxWidth: 960, margin: '0 auto', padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const logo = { width: 32, height: 32, borderRadius: 8, background: '#4338CA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }
const navBtn = { padding: '7px 16px', borderRadius: 8, border: '1.5px solid #4338CA', background: 'white', color: '#4338CA', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const section = { maxWidth: 960, margin: '0 auto', padding: '40px 20px' }
const pill = { display: 'inline-block', background: '#EEF0FF', color: '#4338CA', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 99, marginBottom: 20 }
const h1 = { fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }
const h2 = { fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }
const lead = { fontSize: 16, color: '#6B7280', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 26px' }
const ctaBig = { padding: '14px 28px', borderRadius: 11, border: 'none', background: '#4338CA', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(67,56,202,.3)' }
const pillarsWrap = { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 40 }
const pillarChip = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }
const featureCard = { background: 'white', borderRadius: 14, padding: 20, border: '1px solid #EEF0FF' }
const priceCard = { background: 'white', borderRadius: 18, padding: '28px 22px', maxWidth: 360, margin: '0 auto', border: '2px solid #4338CA', position: 'relative', boxShadow: '0 12px 40px rgba(67,56,202,.15)' }
const priceBadge = { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#4338CA', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99, letterSpacing: '.5px', whiteSpace: 'nowrap' }
const beneficios = { listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14, color: '#374151', textAlign: 'left' }
const footer = { maxWidth: 960, margin: '0 auto', padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, borderTop: '1px solid #EEF0FF' }
