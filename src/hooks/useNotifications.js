import { useEffect, useRef, useCallback, useState } from 'react'

const STORAGE_KEY = 'orvixplan_notify'

export function useNotifications(tasks, date) {
  const supported = typeof window !== 'undefined' && 'Notification' in window

  const [permission, setPermission] = useState(() =>
    supported ? Notification.permission : 'denied',
  )
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
  })
  const timers = useRef([])
  const scheduled = useRef(0)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    scheduled.current = 0
  }

  const schedule = useCallback(() => {
    clearTimers()
    if (!enabled || permission !== 'granted') return

    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (!isToday) return

    tasks.forEach((task) => {
      if (!task.time) return
      const [h, m] = task.time.split(':').map(Number)
      const taskTime = new Date(now)
      taskTime.setHours(h, m, 0, 0)
      const ms = taskTime.getTime() - now.getTime()
      if (ms < 0) return

      const id = setTimeout(() => {
        if (Notification.permission !== 'granted') return
        navigator.serviceWorker?.ready.then((reg) => {
          reg.showNotification('OrvixPlan', {
            body: `${task.time} — ${task.label}`,
            icon: '/icons/icon.svg',
            badge: '/icons/icon.svg',
            tag: `task-${task.id}`,
            renotify: false,
          })
        }).catch(() => {
          new Notification('OrvixPlan', {
            body: `${task.time} — ${task.label}`,
            icon: '/icons/icon.svg',
            tag: `task-${task.id}`,
          })
        })
      }, ms)
      timers.current.push(id)
      scheduled.current += 1
    })
  }, [tasks, date, enabled, permission])

  const requestPermission = useCallback(async () => {
    if (!supported) return false
    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }, [supported])

  const toggle = useCallback(async () => {
    if (enabled) {
      setEnabled(false)
      try { localStorage.setItem(STORAGE_KEY, '0') } catch {}
      clearTimers()
      return
    }
    const granted = permission === 'granted' || (await requestPermission())
    if (granted) {
      setEnabled(true)
      try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    }
  }, [enabled, permission, requestPermission])

  useEffect(() => {
    schedule()
    return clearTimers
  }, [schedule])

  return {
    supported,
    permission,
    enabled,
    toggle,
    count: scheduled.current,
  }
}
