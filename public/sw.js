self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()))
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', () => {})

self.addEventListener('push', (e) => {
  let title = 'OrvixPlan'
  let body = ''
  try {
    const d = e.data?.json()
    if (d) { title = d.title ?? title; body = d.body ?? body }
  } catch (_) {}
  e.waitUntil(self.registration.showNotification(title, { body }))
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      const w = wins.find((w) => w.url.startsWith(self.location.origin))
      return w ? w.focus() : clients.openWindow('/')
    })
  )
})
