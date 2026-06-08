import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const STORAGE_KEY  = 'orvixplan_notify'
const VAPID_PUBLIC = 'BHprRiaNa2F61awSwUzMBvvpG4bEQti0wMRoSVAlZyKagcFxfAgyKHHp-oq_mgFIy--BRUKQVFOV7hJZw2iiEzI'

function urlB64ToUint8(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4)
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export function useNotifications() {
  const supported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window

  const [permission, setPermission] = useState(() =>
    supported ? Notification.permission : 'denied',
  )
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
  })
  const [loading, setLoading] = useState(false)

  // On mount: check if there's an active SW subscription and sync enabled state
  useEffect(() => {
    if (!supported) return
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription()
    ).then((sub) => {
      if (!sub && enabled) {
        setEnabled(false)
        try { localStorage.setItem(STORAGE_KEY, '0') } catch {}
      }
    }).catch(() => {})
  }, []) // eslint-disable-line

  const subscribe = async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8(VAPID_PUBLIC),
    })
    await supabase.functions.invoke('push-save', {
      body: { subscription: sub.toJSON(), action: 'subscribe' },
    })
    return sub
  }

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await supabase.functions.invoke('push-save', {
        body: { subscription: { endpoint: sub.endpoint }, action: 'unsubscribe' },
      })
      await sub.unsubscribe()
    }
  }

  const toggle = useCallback(async () => {
    if (!supported || loading) return
    setLoading(true)
    try {
      if (enabled) {
        await unsubscribe()
        setEnabled(false)
        try { localStorage.setItem(STORAGE_KEY, '0') } catch {}
      } else {
        let perm = permission
        if (perm !== 'granted') {
          perm = await Notification.requestPermission()
          setPermission(perm)
        }
        if (perm !== 'granted') return
        await subscribe()
        setEnabled(true)
        try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
      }
    } catch (err) {
      console.error('Push toggle error:', err)
    } finally {
      setLoading(false)
    }
  }, [enabled, permission, loading, supported]) // eslint-disable-line

  return { supported, permission, enabled, loading, toggle }
}
