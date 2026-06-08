// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const te = new TextEncoder()

function b64u(s: string): Uint8Array {
  const b = s.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b + '='.repeat((4 - b.length % 4) % 4)), (c) => c.charCodeAt(0))
}

function u8b64(a: Uint8Array): string {
  return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function cat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let i = 0
  for (const p of parts) { out.set(p, i); i += p.length }
  return out
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8))
}

// ─── VAPID JWT (RFC 8292) ─────────────────────────────────────────────────────
async function vapidJWT(endpoint: string, subject: string, pubKey: string, privKey: string): Promise<string> {
  const { protocol, host } = new URL(endpoint)
  const aud = `${protocol}//${host}`
  const pub = b64u(pubKey)
  const ecKey = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', d: privKey, x: u8b64(pub.slice(1, 33)), y: u8b64(pub.slice(33, 65)), ext: true },
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'],
  )
  const hdr = u8b64(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const pay = u8b64(te.encode(JSON.stringify({ aud, sub: subject, exp: Math.floor(Date.now() / 1000) + 43200 })))
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, ecKey, te.encode(`${hdr}.${pay}`)))
  return `${hdr}.${pay}.${u8b64(sig)}`
}

// ─── RFC 8291 aes128gcm Payload Encryption ───────────────────────────────────
async function encryptPayload(payload: string, p256dhB64: string, authB64: string): Promise<Uint8Array> {
  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey))
  const uaKey = await crypto.subtle.importKey('raw', b64u(p256dhB64), { name: 'ECDH', namedCurve: 'P-256' }, false, [])
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, pair.privateKey, 256))
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // RFC 8291 §3.3 key derivation
  const ikm   = await hkdf(b64u(authB64), ecdhSecret, cat(te.encode('WebPush: info\0'), b64u(p256dhB64), asPub), 32)
  const cek   = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12)

  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const ct = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    cat(te.encode(payload), new Uint8Array([0x02])), // 0x02 = last-record delimiter
  ))

  // RFC 8291 content: salt(16) | rs(uint32be) | idlen(1) | keyid(65) | ciphertext
  const rs = new Uint8Array(4)
  new DataView(rs.buffer).setUint32(0, 4096, false)
  return cat(salt, rs, new Uint8Array([asPub.length]), asPub, ct)
}

// ─── Send single push ─────────────────────────────────────────────────────────
async function sendPush(
  endpoint: string, p256dh: string, auth: string,
  payload: string, subject: string, vapidPublic: string, vapidPrivate: string,
): Promise<void> {
  const [jwt, body] = await Promise.all([
    vapidJWT(endpoint, subject, vapidPublic, vapidPrivate),
    encryptPayload(payload, p256dh, auth),
  ])
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt},k=${vapidPublic}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
    },
    body,
  })
  if (res.status !== 201) {
    const text = await res.text().catch(() => '')
    throw Object.assign(new Error(`HTTP ${res.status}: ${text}`), { statusCode: res.status, body: text })
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!
  const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!
  const SUBJECT       = 'mailto:glaucoaraujop@gmail.com'

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { db: { schema: 'orvixplan' } },
  )

  const now   = new Date(Date.now() - 3 * 60 * 60 * 1000) // UTC-3 (Brazil)
  const hh    = String(now.getUTCHours()).padStart(2, '0')
  const mm    = String(now.getUTCMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`
  const today   = now.toISOString().slice(0, 10)

  // Range match on the time column (LIKE fails on `time` type — operator doesn't exist).
  const fromT = `${timeStr}:00`
  const toT   = `${timeStr}:59`
  const [{ data: fixed, error: ef }, { data: daily, error: ed }] = await Promise.all([
    supabase.from('fixed_tasks').select('user_id, label').eq('active', true).gte('time_of_day', fromT).lte('time_of_day', toT),
    supabase.from('day_tasks').select('user_id, label').eq('date', today).gte('time_of_day', fromT).lte('time_of_day', toT),
  ])
  if (ef || ed) console.error('[push] query error', ef?.message, ed?.message)

  const due = [...(fixed ?? []), ...(daily ?? [])]
  if (!due.length) return new Response(`Nenhuma tarefa às ${timeStr}`, { status: 200 })

  const byUser: Record<string, string[]> = {}
  for (const t of due) {
    if (!byUser[t.user_id]) byUser[t.user_id] = []
    byUser[t.user_id].push(t.label)
  }

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', Object.keys(byUser))

  if (!subs?.length) return new Response('Sem inscrições', { status: 200 })

  const results = await Promise.allSettled(
    subs.map(async (sub: any) => {
      const labels = byUser[sub.user_id] ?? []
      const body   = labels.length === 1
        ? `⏰ ${timeStr} — ${labels[0]}`
        : `⏰ ${labels.length} tarefas: ${labels.join(', ')}`
      try {
        await sendPush(sub.endpoint, sub.p256dh, sub.auth, JSON.stringify({ title: 'OrvixPlan', body }), SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
        console.log(`[push] ok ${sub.user_id}: ${body}`)
      } catch (err: any) {
        const code = err?.statusCode ?? -1
        console.error(`[push] FAIL ${sub.user_id} code=${code}: ${String(err?.body ?? err?.message ?? err)}`)
        // Remove expired/invalid subscriptions
        if (code === 404 || code === 410) await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        throw err
      }
    }),
  )

  const sent   = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  return new Response(`Enviadas: ${sent}, falhas: ${failed}`, { status: 200 })
})
