import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Não autorizado' }, 401)

    // Cliente com JWT do usuário (resolve auth.uid() nas RPCs de orvixplan)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } }, db: { schema: 'orvixplan' } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Não autorizado' }, 401)

    // ─── Gate: app ativo + saldo de créditos de IA ───────────────────────────
    const { data: acesso } = await supabase.rpc('meu_acesso')
    if (!acesso?.ativo) {
      return json({ error: 'Acesso inativo', code: 'PLANO_INATIVO' }, 402)
    }
    if ((acesso.ia_creditos ?? 0) <= 0) {
      return json({
        error: 'Seus créditos de IA acabaram',
        code: 'LIMITE_IA',
        ia_creditos: 0,
      }, 429)
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_KEY')
    if (!anthropicKey) return json({ error: 'IA não configurada' }, 500)

    const body = await req.json()

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    // ─── Gasta 1 crédito só quando a chamada deu certo ───────────────────────
    if (res.ok) {
      const svc = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        { db: { schema: 'orvixplan' } },
      )
      await svc.rpc('consumir_credito_ia', { p_user_id: user.id })
    }

    return json(data, res.status)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
})

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
