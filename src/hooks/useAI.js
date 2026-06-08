import { useState, useCallback } from 'react'
import { buildSystemPrompt, PROMPTS } from '../constants/prompts.js'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-haiku-4-5-20251001'  // modelo mais barato (~20x menos que Sonnet)
const MAX_TOKENS = 400                         // limite de saída — suficiente para respostas curtas
const MAX_HISTORY = 6                          // máximo de mensagens no histórico do chat

export function useAI(apiKey, settings = {}) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const getKey = () => apiKey || import.meta.env.VITE_ANTHROPIC_KEY

  const call = useCallback(
    async (messages, extraSystem = '') => {
      const key = getKey()
      if (!key) throw new Error('Chave da API Anthropic não configurada. Acesse Configurações.')

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
            model:      MODEL,
            max_tokens: MAX_TOKENS,
            system:     buildSystemPrompt(settings) + (extraSystem ? '\n' + extraSystem : ''),
            messages,
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
    [apiKey, settings],
  )

  const suggestDay  = (date, tasks)            => call([{ role: 'user', content: PROMPTS.suggestDay(date, tasks) }])
  const optimizeDay = (tasks)                  => call([{ role: 'user', content: PROMPTS.optimizeDay(tasks) }])
  const reflectDay  = (pct, done, pending)     => call([{ role: 'user', content: PROMPTS.reflectDay(pct, done, pending) }])

  const chat = async (message, dayCtx, history = []) => {
    // Limita histórico para não inflar o custo
    const trimmed = history.slice(-MAX_HISTORY)
    const prefix  = PROMPTS.chat(dayCtx)
    const messages = [
      ...trimmed.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: prefix + message },
    ]
    return call(messages)
  }

  return { loading, error, suggestDay, optimizeDay, reflectDay, chat }
}
