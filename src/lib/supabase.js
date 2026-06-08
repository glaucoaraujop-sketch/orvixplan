import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://mxccbtwlolwwppvsbrlw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Y2NidHdsb2x3d3BwdnNicmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzI4NzcsImV4cCI6MjA5MTk0ODg3N30.wQtgD8tOZQ-6aC491lvfcBW1tAM0x4bCyR_Ka4MPkec'
const COOKIE_MAX_AGE    = 365 * 24 * 60 * 60 // 1 ano em segundos

// Cookies são compartilhados entre Safari e PWA no mesmo domínio.
// localStorage não é — por isso salvamos nos dois lugares.
// Quando o link de email abre no Safari, a sessão vai pro cookie.
// Quando o PWA abre de volta, lê o cookie e está logado.
const sharedStorage = {
  getItem(key) {
    try {
      const local = localStorage.getItem(key)
      if (local) return local
    } catch {}
    const match = document.cookie.match(new RegExp(`(?:^|; )${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value) } catch {}
    const secure = location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${key}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax${secure}`
  },
  removeItem(key) {
    try { localStorage.removeItem(key) } catch {}
    document.cookie = `${key}=; max-age=0; path=/`
  },
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'orvixplan' },
  auth: {
    flowType: 'implicit',
    persistSession: true,
    autoRefreshToken: true,
    storage: sharedStorage,
  },
})
