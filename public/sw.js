self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()))
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', () => {})

// Real background push notifications (Push API)
self.addEventListener('push', (e) => {
  const data = e.data?.json?.() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'OrvixPlan', {
      body:    data.body ?? '',
      icon:    '/icons/icon.svg',
      badge:   '/icons/icon.svg',
      vibrate: [200, 100, 200],
      data:    { url: '/' },
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      const existing = wins.find((w) => w.url.startsWith(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow('/')
    })
  )
})
