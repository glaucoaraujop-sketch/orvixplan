export const PILLARS = [
  {
    id: 'espiritual',
    label: 'Espiritual',
    emoji: '✝️',
    color: '#7C3AED',
    light: '#EDE9FE',
    text: '#5B21B6',
  },
  {
    id: 'familia',
    label: 'Família',
    emoji: '❤️',
    color: '#DC2626',
    light: '#FEE2E2',
    text: '#991B1B',
  },
  {
    id: 'trabalho',
    label: 'Trabalho',
    emoji: '💼',
    color: '#0284C7',
    light: '#E0F2FE',
    text: '#0369A1',
  },
  {
    id: 'saude',
    label: 'Saúde',
    emoji: '💪',
    color: '#16A34A',
    light: '#DCFCE7',
    text: '#15803D',
  },
  {
    id: 'pessoal',
    label: 'Pessoal',
    emoji: '🌟',
    color: '#D97706',
    light: '#FEF3C7',
    text: '#B45309',
  },
]

export const PILLAR_MAP = Object.fromEntries(PILLARS.map((p) => [p.id, p]))
