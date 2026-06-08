import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(false)
      }
    })

    const fallback = setTimeout(() => setLoading(false), 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [])

  // Sem emailRedirectTo → Supabase envia código OTP (não magic link)
  const signIn = (email) =>
    supabase.auth.signInWithOtp({ email })

  // Verifica o código — cria sessão no contexto atual (PWA ou browser)
  const verifyOtp = (email, token) =>
    supabase.auth.verifyOtp({ email, token, type: 'email' })

  const signOut = () => supabase.auth.signOut()

  return { user, loading, signIn, verifyOtp, signOut }
}
