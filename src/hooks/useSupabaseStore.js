import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import { dateKey } from '../utils/dateUtils.js'

const toTask = (t, fixed = false) => ({
  id:         t.id,
  time:       t.time_of_day ? t.time_of_day.slice(0, 5) : '',
  label:      t.label,
  pillar:     t.pillar_key,
  fixed,
  notes:      t.notes || '',
  sort_order: t.sort_order || 0,
})

export function useSupabaseStore(userId) {
  const [fixedTasks, setFixedTasks] = useState([])
  const [dayData,    setDayData]    = useState({})
  const [loading,    setLoading]    = useState(true)
  const loadedDates = useRef(new Set())

  // Load fixed tasks once
  useEffect(() => {
    if (!userId) return
    supabase
      .from('fixed_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('time_of_day')
      .then(({ data }) => {
        if (data) setFixedTasks(data.map((t) => toTask(t, true)))
        setLoading(false)
      })
  }, [userId])

  // Load data for a list of date strings ('YYYY-MM-DD')
  const loadDateRange = useCallback(
    async (dateKeys) => {
      if (!userId) return
      const fresh = dateKeys.filter((dk) => !loadedDates.current.has(dk))
      if (!fresh.length) return
      fresh.forEach((dk) => loadedDates.current.add(dk))

      const [tasksRes, checksRes, journalRes] = await Promise.all([
        supabase.from('day_tasks').select('*').eq('user_id', userId).in('date', fresh),
        supabase.from('day_checks').select('*').eq('user_id', userId).in('date', fresh),
        supabase.from('day_journal').select('*').eq('user_id', userId).in('date', fresh),
      ])

      const patch = {}
      fresh.forEach((dk) => { patch[dk] = { tasks: [], checks: {}, notes: '' } })

      ;(tasksRes.data || []).forEach((t) => {
        if (patch[t.date]) patch[t.date].tasks.push(toTask(t, false))
      })
      ;(checksRes.data || []).forEach((c) => {
        const id = c.task_id || c.fixed_task_id
        if (patch[c.date] && id) patch[c.date].checks[id] = c.completed
      })
      ;(journalRes.data || []).forEach((j) => {
        if (patch[j.date]) patch[j.date].notes = j.notes || ''
      })

      setDayData((prev) => ({ ...prev, ...patch }))
    },
    [userId],
  )

  const loadDate = useCallback(
    (date) => loadDateRange([dateKey(date)]),
    [loadDateRange],
  )

  // Returns merged (fixed + day) tasks sorted by time, plus checks map
  const getDay = useCallback(
    (date) => {
      const dk = dateKey(date)
      const dd = dayData[dk] || { tasks: [], checks: {}, notes: '' }
      const tasks = [...fixedTasks, ...dd.tasks].sort(
        (a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'),
      )
      return { tasks, checks: dd.checks, notes: dd.notes }
    },
    [fixedTasks, dayData],
  )

  const saveJournal = useCallback(
    async (date, notes) => {
      const dk = dateKey(date)
      setDayData((prev) => ({
        ...prev,
        [dk]: { ...(prev[dk] || { tasks: [], checks: {} }), notes },
      }))
      await supabase.from('day_journal').upsert(
        { user_id: userId, date: dk, notes, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,date' },
      )
    },
    [userId],
  )

  const addTask = useCallback(
    async (date, task) => {
      const dk = dateKey(date)
      const { data, error } = await supabase
        .from('day_tasks')
        .insert({
          user_id:    userId,
          date:       dk,
          label:      task.label,
          pillar_key: task.pillar,
          time_of_day: task.time || null,
        })
        .select()
        .single()
      if (!error && data) {
        setDayData((prev) => ({
          ...prev,
          [dk]: {
            tasks:  [...(prev[dk]?.tasks || []), toTask(data, false)],
            checks: prev[dk]?.checks || {},
          },
        }))
      }
    },
    [userId],
  )

  const deleteTask = useCallback(
    async (date, taskId) => {
      const dk = dateKey(date)
      await supabase.from('day_tasks').delete().eq('id', taskId).eq('user_id', userId)
      setDayData((prev) => ({
        ...prev,
        [dk]: {
          tasks:  (prev[dk]?.tasks || []).filter((t) => t.id !== taskId),
          checks: Object.fromEntries(
            Object.entries(prev[dk]?.checks || {}).filter(([k]) => k !== taskId),
          ),
        },
      }))
    },
    [userId],
  )

  const toggleCheck = useCallback(
    async (date, taskId, isFixed = false) => {
      const dk      = dateKey(date)
      const current = !!dayData[dk]?.checks[taskId]

      // Optimistic update
      setDayData((prev) => ({
        ...prev,
        [dk]: {
          ...prev[dk],
          checks: { ...(prev[dk]?.checks || {}), [taskId]: !current },
        },
      }))

      try {
        if (current) {
          const field = isFixed ? 'fixed_task_id' : 'task_id'
          await supabase
            .from('day_checks')
            .delete()
            .eq('user_id', userId)
            .eq('date', dk)
            .eq(field, taskId)
        } else {
          await supabase.from('day_checks').upsert({
            user_id:   userId,
            date:      dk,
            completed: true,
            ...(isFixed ? { fixed_task_id: taskId } : { task_id: taskId }),
          })
        }
      } catch {
        // Revert on error
        setDayData((prev) => ({
          ...prev,
          [dk]: {
            ...prev[dk],
            checks: { ...(prev[dk]?.checks || {}), [taskId]: current },
          },
        }))
      }
    },
    [userId, dayData],
  )

  return { loading, fixedTasks, getDay, loadDate, loadDateRange, addTask, deleteTask, toggleCheck, saveJournal }
}
