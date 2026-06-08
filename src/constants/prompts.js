// System prompt compacto — menos tokens = menos custo
export const buildSystemPrompt = (cfg = {}) => {
  const name      = cfg.userName    || cfg.name || 'você'
  const role      = cfg.aiRole      || 'empreendedor'
  const family    = cfg.aiFamily    || ''
  const companies = cfg.aiCompanies || ''

  const ctx = [role, family, companies].filter(Boolean).join('. ')
  return `Assistente pessoal de planejamento para ${name}. ${ctx ? ctx + '.' : ''}
Pilares de vida: Espiritual, Família, Trabalho, Saúde, Pessoal.
Responda em PT-BR, direto e encorajador. Máx 200 palavras.`
}

export const PROMPTS = {
  suggestDay: (date, tasks = '') =>
    `Sugira um plano equilibrado para ${date}.${tasks ? `\nTarefas já adicionadas: ${tasks}` : ''}
Formato: "HH:MM — Tarefa [Pilar]". Distribua nos 5 pilares ao longo do dia.`,

  optimizeDay: (tasks) =>
    `Meu plano:\n${tasks}\nSugira 2-3 ajustes objetivos de horário ou equilíbrio entre pilares.`,

  reflectDay: (pct, done, pending) =>
    `Concluí ${pct}% hoje. Feito: ${done || 'nenhum'}. Pendente: ${pending || 'nenhum'}.
Reflexão curta: 1 ponto positivo, 1 melhoria, 1 ação para amanhã.`,

  chat: (ctx) => ctx ? `Contexto do meu dia: ${ctx}\n` : '',
}
