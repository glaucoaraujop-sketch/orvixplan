import { useState, useCallback } from 'react'
import { dateKey } from '../utils/dateUtils.js'

const STORAGE_KEY = 'orvixplan_v1'

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

export function useStore() {
  const [store, setStore] = useState(load)

  const getDay = useCallback(
    (date) => store[dateKey(date)] || { tasks: [], checks: {} },
    [store],
  )

  const mutate = useCallback((date, fn) => {
    const dk = dateKey(date)
    setStore((prev) => {
      const day  = prev[dk] || { tasks: [], checks: {} }
      const next = { ...prev, [dk]: fn(day) }
      save(next)
      return next
    })
  }, [])

  const addTask = useCallback(
    (date, task) =>
      mutate(date, (day) => ({
        ...day,
        tasks: [...day.tasks, { ...task, id: `t${Date.now()}` }],
      })),
    [mutate],
  )

  const deleteTask = useCallback(
    (date, taskId) =>
      mutate(date, (day) => ({
        ...day,
        tasks: day.tasks.filter((t) => t.id !== taskId),
        checks: Object.fromEntries(
          Object.entries(day.checks).filter(([k]) => k !== taskId),
        ),
      })),
    [mutate],
  )

  const toggleCheck = useCallback(
    (date, taskId) =>
      mutate(date, (day) => ({
        ...day,
        checks: { ...day.checks, [taskId]: !day.checks[taskId] },
      })),
    [mutate],
  )

  return { store, getDay, addTask, deleteTask, toggleCheck }
}
