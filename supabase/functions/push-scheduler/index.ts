// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  webpush.setVapidDetails(
    'mailto:glaucoaraujop@gmail.com',
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!,
  )

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { db: { schema: 'orvixplan' } },
  )

  // Current time in Brazil (UTC-3)
  const now = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const hh  = String(now.getUTCHours()).padStart(2, '0')
  const mm  = String(now.getUTCMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`
  const today   = now.toISOString().slice(0, 10)

  // Tasks due right now (fixed + day)
  const [{ data: fixed }, { data: daily }] = await Promise.all([
    supabase.from('fixed_tasks').select('user_id, label')
      .eq('active', true).like('time_of_day', `${timeStr}%`),
    supabase.from('day_tasks').select('user_id, label')
      .eq('date', today).like('time_of_day', `${timeStr}%`),
  ])

  const due = [...(fixed ?? []), ...(daily ?? [])]
  if (!due.length) return new Response(`Nenhuma tarefa às ${timeStr}`, { status: 200 })

  // Group labels by user
  const byUser: Record<string, string[]> = {}
  for (const t of due) {
    if (!byUser[t.user_id]) byUser[t.user_id] = []
    byUser[t.user_id].push(t.label)
  }

  // Fetch push subscriptions for affected users
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', Object.keys(byUser))

  if (!subs?.length) return new Response('Sem inscrições', { status: 200 })

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      const labels = byUser[sub.user_id] ?? []
      const body = labels.length === 1
        ? `⏰ ${timeStr} — ${labels[0]}`
        : `⏰ ${labels.length} tarefas: ${labels.join(', ')}`

      try {
        await (webpush as any).sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: 'OrvixPlan', body }),
        )
      } catch (err: any) {
        // Remove expired/invalid subscriptions
        if (err?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
        throw err
      }
    }),
  )

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  return new Response(`Enviadas: ${sent}, falhas: ${failed}`, { status: 200 })
})
