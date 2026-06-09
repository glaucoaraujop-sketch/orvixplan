// deno-lint-ignore-file no-explicit-any
// Webhook do Mercado Pago. Recebe notificação de pagamento Pix,
// busca o pagamento real na API (fonte da verdade) e, se aprovado,
// ativa o app (R$37 → vitalício + 50 créditos) ou credita IA (R$29,90 → +100).
// Idempotente via assinaturas.stripe_event_id = 'mp:<payment_id>'.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { db: { schema: 'orvixplan' } },
)

Deno.serve(async (req) => {
  // O id do pagamento pode vir na query ou no corpo
  const url = new URL(req.url)
  let type = url.searchParams.get('type') || url.searchParams.get('topic')
  let paymentId = url.searchParams.get('data.id') || url.searchParams.get('id')

  if (!paymentId) {
    const body = await req.json().catch(() => ({} as any))
    type = type || body?.type || body?.action
    paymentId = body?.data?.id
  }

  // Só tratamos notificações de pagamento
  if (!paymentId || (type && !String(type).includes('payment'))) {
    return new Response('ignored', { status: 200 })
  }

  const token = Deno.env.get('MP_ACCESS_TOKEN')!

  // Busca o pagamento real (não confiamos no payload)
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return new Response('payment not found', { status: 200 })
  const pay = await res.json()

  if (pay.status !== 'approved') {
    return new Response(`status ${pay.status}`, { status: 200 })
  }

  const [userId, produto] = String(pay.external_reference || '').split(':')
  if (!userId) return new Response('sem external_reference', { status: 200 })

  // Idempotência
  const eventId = `mp:${pay.id}`
  const { data: dup } = await supabase
    .from('assinaturas').select('id').eq('stripe_event_id', eventId).maybeSingle()
  if (dup) return new Response('duplicate', { status: 200 })

  const centavos = Math.round((pay.transaction_amount || 0) * 100)

  try {
    if (produto === 'ia_pack') {
      await supabase.rpc('adicionar_creditos_ia', { p_user_id: userId, p_qtd: 100 })
      await supabase.from('assinaturas').insert({
        stripe_event_id: eventId, user_id: userId, tipo: 'ia_pack',
        valor_centavos: centavos, status: 'ativo',
      })
    } else {
      const expira = new Date(); expira.setFullYear(expira.getFullYear() + 100)
      await supabase.from('users').update({
        plano: 'pro', status: 'ativo', ciclo: 'vitalicio',
        acesso_expira_em: expira.toISOString(),
      }).eq('id', userId)
      await supabase.rpc('adicionar_creditos_ia', { p_user_id: userId, p_qtd: 50 })
      await supabase.from('assinaturas').insert({
        stripe_event_id: eventId, user_id: userId, tipo: 'checkout', ciclo: 'vitalicio',
        valor_centavos: centavos, status: 'ativo',
        periodo_inicio: new Date().toISOString(), periodo_fim: expira.toISOString(),
      })
    }
  } catch (err: any) {
    console.error('[mp-webhook] erro', err?.message)
    return new Response('handler error', { status: 500 })
  }

  return new Response('ok', { status: 200 })
})
