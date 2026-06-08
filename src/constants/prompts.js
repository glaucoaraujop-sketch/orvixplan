// System prompt compacto — menos tokens = menos custo
export const buildSystemPrompt = (cfg = {}) => {
  const name      = cfg.name      || 'Glauco'
  const role      = cfg.aiRole    || 'empreendedor e desenvolvedor'
  const family    = cfg.aiFamily  || 'casado com Mara, pai do Theo'
  const companies = cfg.aiCompanies || 'Doutor iPhone, OrvixFlow, OrvixOS'

  return `Assistente pessoal do ${name} (TJ, ${family}). Empresas: ${companies}. Papel: ${role}.
Pilares: Espiritual, Família, Trabalho, Saúde, Pessoal.
Responda em PT-BR, direto e encorajador. Máx 200 palavras.`
}

export const PROMPTS = {
  suggestDay: (date, tasks = '') =>
    `Sugira um plano para ${date}. Tarefas fixas: Bíblia 06h, Oração 07h, Mara 22h.${tasks ? `\nTarefas já adicionadas: ${tasks}` : ''}
Formato: "HH:MM — Tarefa [Pilar]". Distribua nos 5 pilares.`,

  optimizeDay: (tasks) =>
    `Meu plano:\n${tasks}\nSugira 2-3 ajustes objetivos de horário ou equilíbrio entre pilares.`,

  reflectDay: (pct, done, pending) =>
    `Concluí ${pct}% hoje. Feito: ${done || 'nenhum'}. Pendente: ${pending || 'nenhum'}.
Reflexão curta: 1 ponto positivo, 1 melhoria, 1 ação para amanhã.`,

  chat: (ctx) => ctx ? `Contexto do meu dia: ${ctx}\n` : '',
}
