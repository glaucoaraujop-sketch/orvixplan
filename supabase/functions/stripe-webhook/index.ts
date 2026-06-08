// deno-lint-ignore-file no-explicit-any
// Stripe webhook → ativa/renova/cancela acesso no OrvixPlan.
// Eventos tratados: checkout.session.completed, invoice.paid,
// customer.subscription.deleted, invoice.payment_failed.
// Protegido por assinatura Stripe (STRIPE_WEBHOOK_SECRET). Idempotente via stripe_event_id.
import Stripe from 'npm:stripe@17'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { db: { schema: 'orvixplan' } },
)

const addMonths = (d: Date, n: number) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x }

// A subscription da invoice mudou de lugar entre versões da API do Stripe.
const subDaInvoice = (inv: any): string | null =>
  inv.subscription
  ?? inv.parent?.subscription_details?.subscription
  ?? inv.lines?.data?.[0]?.subscription
  ?? inv.lines?.data?.[0]?.parent?.subscription_item_details?.subscription
  ?? null

async function registrar(ev: any, userId: string | null, tipo: string, extra: Record<string, any>) {
  await supabase.from('assinaturas').insert({
    stripe_event_id: ev.id,
    user_id: userId,
    tipo,
    ...extra,
  })
}

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('No signature', { status: 400 })

  const raw = await req.text()
  let event: any
  try {
    event = await stripe.webhooks.constructEventAsync(
      raw, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET')!, undefined, cryptoProvider,
    )
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // ─── Idempotência: ignora evento já processado ──────────────────────────────
  const { data: dup } = await supabase
    .from('assinaturas').select('id').eq('stripe_event_id', event.id).maybeSingle()
  if (dup) return new Response('duplicate', { status: 200 })

  try {
    switch (event.type) {
      // ─── Compra concluída (mensal recorrente OU anual à vista) ──────────────
      case 'checkout.session.completed': {
        const s = event.data.object
        const userId = s.client_reference_id || s.metadata?.user_id || null
        if (!userId) { await registrar(event, null, 'checkout', { status: 'sem_user_id' }); break }

        // Pacote de créditos de IA (R$29,90 → +100 usos) — não mexe no plano
        if (s.metadata?.produto === 'ia_pack') {
          await supabase.rpc('adicionar_creditos_ia', { p_user_id: userId, p_qtd: 100 })
          await registrar(event, userId, 'ia_pack', {
            valor_centavos: s.amount_total ?? null, status: 'ativo',
            stripe_customer_id: s.customer ? String(s.customer) : null,
          })
          break
        }

        const ciclo = s.metadata?.ciclo || (s.mode === 'subscription' ? 'mensal' : 'vitalicio')
        let periodoFim: Date
        let subId: string | null = null

        if (s.mode === 'subscription' && s.subscription) {
          // Mensal (legado): fonte da verdade é o current_period_end da assinatura
          subId = String(s.subscription)
          const sub = await stripe.subscriptions.retrieve(subId)
          periodoFim = new Date(sub.current_period_end * 1000)
        } else if (ciclo === 'anual') {
          // Anual à vista (legado): libera 12 meses
          periodoFim = addMonths(new Date(), 12)
        } else {
          // Vitalício (pagamento único R$37): acesso para sempre
          periodoFim = addMonths(new Date(), 1200) // 100 anos
        }

        await supabase.from('users').update({
          plano: 'pro', status: 'ativo', ciclo,
          acesso_expira_em: periodoFim.toISOString(),
          stripe_customer_id: s.customer ? String(s.customer) : null,
          stripe_subscription_id: subId,
        }).eq('id', userId)

        // Bônus de 7 créditos de IA inclusos na compra do app
        await supabase.rpc('adicionar_creditos_ia', { p_user_id: userId, p_qtd: 7 })

        await registrar(event, userId, 'checkout', {
          stripe_customer_id: s.customer ? String(s.customer) : null,
          stripe_subscription_id: subId, ciclo,
          valor_centavos: s.amount_total ?? null, status: 'ativo',
          periodo_inicio: new Date().toISOString(), periodo_fim: periodoFim.toISOString(),
        })
        break
      }

      // ─── Renovação mensal paga ──────────────────────────────────────────────
      case 'invoice.paid': {
        const inv = event.data.object
        const subId = subDaInvoice(inv)
        if (!subId) { await registrar(event, null, 'renovacao', { status: 'sem_sub' }); break }
        const sub = await stripe.subscriptions.retrieve(subId)
        const periodoFim = new Date(sub.current_period_end * 1000)

        const { data: u } = await supabase.from('users')
          .select('id').eq('stripe_subscription_id', subId).maybeSingle()

        if (u) {
          await supabase.from('users').update({
            plano: 'pro', status: 'ativo',
            acesso_expira_em: periodoFim.toISOString(),
          }).eq('id', u.id)
        }
        await registrar(event, u?.id ?? null, 'renovacao', {
          stripe_subscription_id: subId,
          valor_centavos: inv.amount_paid ?? null, status: 'ativo',
          periodo_fim: periodoFim.toISOString(),
        })
        break
      }

      // ─── Falha de pagamento → inadimplente (acesso segue até expirar) ───────
      case 'invoice.payment_failed': {
        const inv = event.data.object
        const subId = subDaInvoice(inv)
        const { data: u } = subId
          ? await supabase.from('users').select('id').eq('stripe_subscription_id', subId).maybeSingle()
          : { data: null }
        if (u) await supabase.from('users').update({ status: 'inadimplente' }).eq('id', u.id)
        await registrar(event, u?.id ?? null, 'falha', {
          stripe_subscription_id: subId, status: 'inadimplente',
        })
        break
      }

      // ─── Assinatura cancelada → expira no fim do período já pago ─────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const { data: u } = await supabase.from('users')
          .select('id').eq('stripe_subscription_id', sub.id).maybeSingle()
        if (u) {
          await supabase.from('users').update({
            status: 'cancelado',
            acesso_expira_em: new Date(sub.current_period_end * 1000).toISOString(),
          }).eq('id', u.id)
        }
        await registrar(event, u?.id ?? null, 'cancelamento', {
          stripe_subscription_id: sub.id, status: 'cancelado',
          periodo_fim: new Date(sub.current_period_end * 1000).toISOString(),
        })
        break
      }

      default:
        // Evento não tratado — registra para idempotência e segue
        await registrar(event, null, 'ignorado', { status: event.type })
    }
  } catch (err: any) {
    console.error('[stripe-webhook] erro', event.type, err?.message)
    return new Response(`Handler error: ${err?.message}`, { status: 500 })
  }

  return new Response('ok', { status: 200 })
})
