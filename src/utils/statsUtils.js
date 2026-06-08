import { PILLARS } from '../constants/pillars.js'

export const calcDayPct = (allTasks, checks) => {
  if (!allTasks.length) return 0
  const done = allTasks.filter((t) => checks[t.id]).length
  return Math.round((done / allTasks.length) * 100)
}

export const calcPillarBreakdown = (allTasks, checks) =>
  PILLARS.reduce((acc, p) => {
    const tasks = allTasks.filter((t) => t.pillar === p.id)
    acc[p.id] = {
      total: tasks.length,
      done: tasks.filter((t) => checks[t.id]).length,
    }
    return acc
  }, {})

export const heatmapColor = (pct) => {
  if (pct === 0)   return '#F3F4F6'
  if (pct < 50)    return '#FEF3C7'
  if (pct < 80)    return '#DBEAFE'
  return '#DCFCE7'
}
