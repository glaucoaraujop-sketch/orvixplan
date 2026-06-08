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
    ativo:         acesso?.ativo ?? false,
    plano:         acesso?.plano ?? null,
    status:        acesso?.status ?? null,
    ciclo:         acesso?.ciclo ?? null,
    diasRestantes: acesso?.dias_restantes ?? 0,
    iaUsadas:      acesso?.ia_usadas ?? 0,
    iaLimite:      acesso?.ia_limite ?? 0,
    refresh,
  }
}

// Abre o checkout do Stripe (mensal ou anual) e redireciona.
export async function irParaCheckout(ciclo) {
  const { data, error } = await supabase.functions.invoke('stripe-checkout', { body: { ciclo } })
  if (error || !data?.url) throw new Error(data?.error || 'Erro ao abrir checkout')
  window.location.href = data.url
}
