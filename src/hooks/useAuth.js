import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange dispara INITIAL_SESSION ao inicializar —
    // cobre tanto sessão nova quanto sessão restaurada do localStorage.
    // Não usamos getSession() separado para evitar race condition.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(false)
      }
    })

    // Segurança: se o evento nunca disparar, desbloqueia em 4s
    const fallback = setTimeout(() => setLoading(false), 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [])

  const signIn = (email) =>
    supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

  const signOut = () => supabase.auth.signOut()

  return { user, loading, signIn, signOut }
}
