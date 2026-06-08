import { useState, useCallback } from 'react'
import { buildSystemPrompt, PROMPTS } from '../constants/prompts.js'

const API_URL = 'https://api.anthropic.com/v1/messages'

export function useAI(apiKey) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const call = useCallback(
    async (userMessage, userConfig = {}) => {
      const key = apiKey || import.meta.env.VITE_ANTHROPIC_KEY
      if (!key) {
        throw new Error('Chave da API Anthropic não configurada. Acesse Configurações.')
      }
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 1024,
            system: buildSystemPrompt(userConfig),
            messages: [{ role: 'user', content: userMessage }],
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error?.message || `Erro ${res.status}`)
        }
        const data = await res.json()
        return data.content[0].text
      } catch (e) {
        setError(e.message)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [apiKey],
  )

  const suggestDay  = (date, ctx)               => call(PROMPTS.suggestDay(date, ctx))
  const optimizeDay = (tasks)                    => call(PROMPTS.optimizeDay(tasks))
  const reflectDay  = (pct, done, pending)       => call(PROMPTS.reflectDay(pct, done, pending))
  const chat        = (message, dayCtx, history = []) => {
    const key = apiKey || import.meta.env.VITE_ANTHROPIC_KEY
    if (!key) return Promise.reject(new Error('Chave da API não configurada.'))
    setLoading(true)
    setError(null)
    return fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: buildSystemPrompt(),
        messages: [
          ...history.map((h) => ({ role: h.role, content: h.content })),
          { role: 'user', content: PROMPTS.chat(dayCtx) + '\n\n' + message },
        ],
      }),
    })
      .then((r) => r.json())
      .then((d) => d.content[0].text)
      .catch((e) => { setError(e.message); throw e })
      .finally(() => setLoading(false))
  }

  return { loading, error, suggestDay, optimizeDay, reflectDay, chat }
}
