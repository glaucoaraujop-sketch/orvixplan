import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

// Lê o estado de acesso/plano do usuário (RPC orvixplan.meu_acesso).
// Retorna: { ativo, plano, status, ciclo, diasRestantes, iaUsadas, iaLimite, loading, refresh }
export function useAccess(userId) {
  const [acesso, setAcesso] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) { setAcesso(null); setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.rpc('meu_acesso')
    if (!error && data) setAcesso(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  return {
    loading,
    ativo:      acesso?.ativo ?? false,
    plano:      acesso?.plano ?? null,
    status:     acesso?.status ?? null,
    ciclo:      acesso?.ciclo ?? null,
    iaCreditos: acesso?.ia_creditos ?? 0,
    refresh,
  }
}

// Abre o checkout do Stripe (cartão). produto: 'app' (R$37) | 'ia_pack' (R$29,90).
export async function irParaCheckout(produto = 'app') {
  const { data, error } = await supabase.functions.invoke('stripe-checkout', { body: { produto } })
  if (error || !data?.url) throw new Error(data?.error || 'Erro ao abrir checkout')
  window.location.href = data.url
}

// Cria um pagamento Pix no Mercado Pago → retorna QR Code.
export async function criarPix(produto = 'app') {
  const { data, error } = await supabase.functions.invoke('mp-pix-create', { body: { produto } })
  if (error || data?.error) throw new Error(data?.error || 'Erro ao gerar Pix')
  return data
}

// Lê o acesso atual (pra detectar quando o Pix for confirmado).
export async function consultarAcesso() {
  const { data } = await supabase.rpc('meu_acesso')
  return data
}
