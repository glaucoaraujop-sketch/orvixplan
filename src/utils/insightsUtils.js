import { PILLARS } from '../constants/pillars.js'
import { dateKey, addDays } from './dateUtils.js'

// Lista de datas (objetos Date) dos últimos N dias terminando em `end` (incluso).
export function lastNDays(n, end = new Date()) {
  const out = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i))
  return out
}

// Agrega tarefas/concluídas por pilar ao longo de um período.
// getDay(date) → { tasks, checks }
export function pillarBreakdownRange(dates, getDay) {
  const acc = {}
  PILLARS.forEach((p) => { acc[p.id] = { total: 0, done: 0 } })
  dates.forEach((d) => {
    const { tasks, checks } = getDay(d)
    tasks.forEach((t) => {
      if (!acc[t.pillar]) return
      acc[t.pillar].total += 1
      if (checks[t.id]) acc[t.pillar].done += 1
    })
  })
  // adiciona pct
  Object.keys(acc).forEach((k) => {
    const { total, done } = acc[k]
    acc[k].pct = total ? Math.round((done / total) * 100) : 0
  })
  return acc
}

// % do dia (concluídas / total)
export function dayPct(date, getDay) {
  const { tasks, checks } = getDay(date)
  if (!tasks.length) return 0
  const done = tasks.filter((t) => checks[t.id]).length
  return Math.round((done / tasks.length) * 100)
}

// Sequência (streak) de dias consecutivos com ao menos 1 tarefa concluída.
// Conta de hoje pra trás; se hoje ainda está zerado, começa de ontem (não quebra a ofensiva).
export function currentStreak(getDay, end = new Date()) {
  let streak = 0
  let start = 0
  // Se hoje ainda não tem conclusão, não penaliza — começa de ontem.
  if (dayPct(end, getDay) === 0) start = 1
  for (let i = start; i < 400; i++) {
    const d = addDays(end, -i)
    if (dayPct(d, getDay) > 0) streak += 1
    else break
  }
  return streak
}

// Pilares "esquecidos": sem nenhuma tarefa no período.
export function forgottenPillars(breakdown) {
  return PILLARS.filter((p) => (breakdown[p.id]?.total || 0) === 0)
}

// Dias desde a última tarefa de um pilar (pra nudge). Retorna null se nunca.
export function daysSincePillar(pillarId, getDay, end = new Date(), maxLookback = 60) {
  for (let i = 0; i < maxLookback; i++) {
    const { tasks } = getDay(addDays(end, -i))
    if (tasks.some((t) => t.pillar === pillarId)) return i
  }
  return null
}

// Todas as chaves de data de um período (pra carregar do banco de uma vez).
export function rangeKeys(dates) {
  return dates.map((d) => dateKey(d))
}
