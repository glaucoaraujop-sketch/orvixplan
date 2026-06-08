import { PILLARS } from '../constants/pillars.js'

// Gera um card de progresso 1080x1080 no canvas e compartilha (zero custo de IA).
// args: { pct, dateLabel, breakdown }  breakdown = { pillarId: {total, done} }
export async function shareProgressCard({ pct, dateLabel, breakdown }) {
  const S = 1080
  const canvas = document.createElement('canvas')
  canvas.width = S; canvas.height = S
  const ctx = canvas.getContext('2d')

  // Fundo gradiente
  const g = ctx.createLinearGradient(0, 0, S, S)
  g.addColorStop(0, '#4338CA'); g.addColorStop(0.6, '#6D28D9'); g.addColorStop(1, '#7C3AED')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)

  // Marca
  ctx.fillStyle = 'rgba(255,255,255,.92)'
  ctx.font = '700 44px Outfit, system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('📅 OrvixPlan', 80, 110)

  ctx.fillStyle = 'rgba(255,255,255,.7)'
  ctx.font = '500 30px Outfit, system-ui, sans-serif'
  ctx.fillText(dateLabel, 80, 165)

  // Anel de progresso
  const cx = S / 2, cy = 470, r = 165
  ctx.lineWidth = 34
  ctx.strokeStyle = 'rgba(255,255,255,.18)'
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = '#ffffff'
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct) / 100)
  ctx.stroke()

  // % no centro
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.font = '800 130px Outfit, system-ui, sans-serif'
  ctx.fillText(`${pct}%`, cx, cy - 6)
  ctx.font = '600 30px Outfit, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,.8)'
  ctx.fillText('do dia concluído', cx, cy + 78)
  ctx.textAlign = 'left'

  // Chips dos pilares (com tarefas)
  const ativos = PILLARS.filter((p) => (breakdown[p.id]?.total || 0) > 0)
  let x = 80, y = 760
  const maxW = S - 80
  ctx.font = '600 30px Outfit, system-ui, sans-serif'
  ativos.forEach((p) => {
    const { total, done } = breakdown[p.id]
    const txt = `${p.emoji} ${done}/${total}`
    const w = ctx.measureText(txt).width + 56
    if (x + w > maxW) { x = 80; y += 78 }
    roundRect(ctx, x, y, w, 58, 29)
    ctx.fillStyle = 'rgba(255,255,255,.15)'
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.fillText(txt, x + 28, y + 30)
    x += w + 16
  })

  // Rodapé
  ctx.fillStyle = 'rgba(255,255,255,.75)'
  ctx.font = '500 28px Outfit, system-ui, sans-serif'
  ctx.fillText('Organize sua vida em pilares · plan.orvixos.com.br', 80, S - 70)

  // Exporta e compartilha
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
  const file = new File([blob], 'orvixplan-progresso.png', { type: 'image/png' })

  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Meu progresso no OrvixPlan',
        text: `Fechei ${pct}% do meu dia! 🎯 Organize sua vida em pilares também: plan.orvixos.com.br`,
      })
      return
    }
  } catch (e) {
    if (e?.name === 'AbortError') return // usuário cancelou
  }

  // Fallback: baixa a imagem
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'orvixplan-progresso.png'; a.click()
  URL.revokeObjectURL(url)
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
