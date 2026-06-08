import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Não autorizado' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } }, db: { schema: 'orvixplan' } },
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return json({ error: 'Não autorizado' }, 401)

  const { subscription, action } = await req.json()

  if (action === 'unsubscribe') {
    await supabase.from('push_subscriptions').delete().eq('user_id', user.id).eq('endpoint', subscription.endpoint)
    return json({ ok: true })
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id:  user.id,
      endpoint: subscription.endpoint,
      p256dh:   subscription.keys.p256dh,
      auth:     subscription.keys.auth,
    },
    { onConflict: 'user_id,endpoint' },
  )

  if (error) return json({ error: error.message }, 500)
  return json({ ok: true })
})
