import { useState, useCallback } from 'react'
import { buildSystemPrompt, PROMPTS } from '../constants/prompts.js'
import { supabase } from '../lib/supabase.js'

const MODEL      = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 400
const MAX_HISTORY = 6

export function useAI(settings = {}) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const call = useCallback(
    async (messages, extraSystem = '') => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: fnError } = await supabase.functions.invoke('anthropic-proxy', {
          body: {
            model:      MODEL,
            max_tokens: MAX_TOKENS,
            system:     buildSystemPrompt(settings) + (extraSystem ? '\n' + extraSystem : ''),
            messages,
          },
        })

        if (fnError) throw new Error(fnError.message || 'Erro ao chamar IA')
        if (data?.error) throw new Error(data.error)

        return data.content[0].text
      } catch (e) {
        setError(e.message)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [settings],
  )

  const suggestDay  = (date, tasks)        => call([{ role: 'user', content: PROMPTS.suggestDay(date, tasks) }])
  const optimizeDay = (tasks)              => call([{ role: 'user', content: PROMPTS.optimizeDay(tasks) }])
  const reflectDay  = (pct, done, pending) => call([{ role: 'user', content: PROMPTS.reflectDay(pct, done, pending) }])

  const chat = async (message, dayCtx, history = []) => {
    const trimmed  = history.slice(-MAX_HISTORY)
    const prefix   = PROMPTS.chat(dayCtx)
    const messages = [
      ...trimmed.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: prefix + message },
    ]
    return call(messages)
  }

  return { loading, error, suggestDay, optimizeDay, reflectDay, chat }
}
