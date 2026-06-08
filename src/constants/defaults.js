export const DEFAULT_FIXED_TASKS = [
  { id: 'f1', time: '06:00', label: 'Leitura da Bíblia', pillar: 'espiritual', fixed: true },
  { id: 'f2', time: '07:00', label: 'Oração em família',  pillar: 'espiritual', fixed: true },
  { id: 'f3', time: '22:00', label: 'Tempo com a Mara',   pillar: 'familia',    fixed: true },
]

export const TASK_SUGGESTIONS = {
  espiritual: ['Leitura da Bíblia', 'Oração pessoal', 'Reunião de congregação', 'Pregação de campo', 'Estudo bíblico pessoal'],
  familia:    ['Tempo com a Mara', 'Brincar com o Theo', 'Estudo bíblico em família', 'Jantar em família', 'Atividade com o Theo'],
  trabalho:   ['Atendimento Doutor iPhone', 'Desenvolvimento OrvixFlow', 'Desenvolvimento OrvixOS', 'Reunião com parceiro', 'Análise de ordens de serviço'],
  saude:      ['Exercício físico', 'Caminhada', 'Alimentação saudável', 'Descanso / Sono', 'Consulta médica'],
  pessoal:    ['Leitura', 'Curso / Estudo técnico', 'Tempo de lazer', 'Reflexão pessoal', 'Atualização profissional'],
}

export const DEFAULT_SETTINGS = {
  userName: 'Glauco',
  startHour: 6,
  endHour: 23,
  defaultView: 'daily',
  anthropicKey: '',
}
