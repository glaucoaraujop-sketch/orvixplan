// deno-lint-ignore-file no-explicit-any
// Cria sessão de Checkout do Stripe. Body: { ciclo: 'mensal' | 'anual' }.
// Mensal = assinatura recorrente R$19,90. Anual = pagamento único R$219,00.
import Stripe from 'npm:stripe@17'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

const APP_URL = Deno.env.get('APP_URL') ?? 'https://plan.orvixos.com.br'

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

  const { ciclo } = await req.json().catch(() => ({ ciclo: 'mensal' }))

  // Reaproveita o customer do Stripe se já existir
  const { data: perfil } = await supabase
    .from('users').select('stripe_customer_id, email').eq('id', user.id).maybeSingle()

  const common = {
    client_reference_id: user.id,
    customer: perfil?.stripe_customer_id || undefined,
    customer_email: perfil?.stripe_customer_id ? undefined : (perfil?.email || user.email),
    metadata: { user_id: user.id, ciclo },
    success_url: `${APP_URL}/?checkout=sucesso`,
    cancel_url: `${APP_URL}/?checkout=cancelado`,
    allow_promotion_codes: true,
  }

  let session
  try {
    if (ciclo === 'anual') {
      // Pagamento único — R$ 219,00 libera 12 meses
      session = await stripe.checkout.sessions.create({
        ...common,
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'brl',
            unit_amount: 21900,
            product_data: { name: 'OrvixPlan Pro — Anual (12 meses)' },
          },
          quantity: 1,
        }],
      })
    } else {
      // Assinatura recorrente — R$ 19,90/mês
      session = await stripe.checkout.sessions.create({
        ...common,
        mode: 'subscription',
        line_items: [{
          price_data: {
            currency: 'brl',
            unit_amount: 1990,
            recurring: { interval: 'month' },
            product_data: { name: 'OrvixPlan Pro — Mensal' },
          },
          quantity: 1,
        }],
      })
    }
  } catch (err: any) {
    return json({ error: err?.message ?? 'Erro ao criar checkout' }, 500)
  }

  return json({ url: session.url })
})
