// deno-lint-ignore-file no-explicit-any
// Cria um pagamento Pix no Mercado Pago. Body: { produto: 'app' | 'ia_pack' }.
// Retorna QR Code (imagem + copia-e-cola) e o id do pagamento.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

const PRODUTOS: Record<string, { valor: number; nome: string }> = {
  app:     { valor: 37.0,  nome: 'OrvixPlan — Acesso Vitalício' },
  ia_pack: { valor: 29.9,  nome: 'OrvixPlan — 100 usos de IA' },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Não autorizado' }, 401)

  // Identifica o usuário pelo JWT
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } }, db: { schema: 'orvixplan' } },
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return json({ error: 'Não autorizado' }, 401)

  const { produto = 'app' } = await req.json().catch(() => ({ produto: 'app' }))
  const p = PRODUTOS[produto] || PRODUTOS.app

  const token = Deno.env.get('MP_ACCESS_TOKEN')
  if (!token) return json({ error: 'Pix não configurado' }, 500)

  const SUPA_URL = Deno.env.get('SUPABASE_URL')!
  const idemp = crypto.randomUUID()

  const res = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idemp,
    },
    body: JSON.stringify({
      transaction_amount: p.valor,
      description: p.nome,
      payment_method_id: 'pix',
      payer: { email: user.email || `user-${user.id}@orvixplan.com` },
      external_reference: `${user.id}:${produto}`,
      notification_url: `${SUPA_URL}/functions/v1/mp-webhook`,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    console.error('[mp-pix-create] erro', JSON.stringify(data))
    return json({ error: data?.message || 'Erro ao gerar Pix' }, 500)
  }

  const tx = data?.point_of_interaction?.transaction_data || {}
  return json({
    payment_id: data.id,
    status: data.status,
    qr_code: tx.qr_code,                 // copia-e-cola
    qr_code_base64: tx.qr_code_base64,   // imagem PNG (base64)
    ticket_url: tx.ticket_url,
    valor: p.valor,
  })
})
