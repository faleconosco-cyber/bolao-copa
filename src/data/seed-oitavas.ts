import type { Game } from '../lib/types'

// Estrutura oficial da Copa 2026 (fase final), conforme a tabela do bolão.
// Rodada de 32 (jogos 73-88) → Oitavas (89-96) → Quartas (97-100) →
// Semis (101-102) → 3º lugar (103) → Final (104).
// Os times da rodada de 32 já são reais; as fases seguintes preenchem
// automaticamente pelo chaveamento (vencedor do jogo X).
export const SEED_GAMES: Game[] = [
  // ── Rodada de 32 ──
  { id: 'G73', phase: 'rodada32', order: 1,  date: '2026-06-28', homeTeam: 'África do Sul', awayTeam: 'Canadá',   homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G74', phase: 'rodada32', order: 2,  date: '2026-06-29', homeTeam: 'Alemanha',      awayTeam: 'Paraguai', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G75', phase: 'rodada32', order: 3,  date: '2026-06-29', homeTeam: 'Holanda',       awayTeam: 'Marrocos', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G76', phase: 'rodada32', order: 4,  date: '2026-06-29', homeTeam: 'Brasil',        awayTeam: 'Japão',    homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G77', phase: 'rodada32', order: 5,  date: '2026-06-30', homeTeam: 'França',        awayTeam: 'Suécia',   homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G78', phase: 'rodada32', order: 6,  date: '2026-06-30', homeTeam: 'Costa do Marfim', awayTeam: 'Noruega', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G79', phase: 'rodada32', order: 7,  date: '2026-06-30', homeTeam: 'México',        awayTeam: 'Equador',  homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G80', phase: 'rodada32', order: 8,  date: '2026-07-01', homeTeam: 'Inglaterra',    awayTeam: 'RD Congo', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G81', phase: 'rodada32', order: 9,  date: '2026-07-01', homeTeam: 'EUA',           awayTeam: 'Bósnia',   homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G82', phase: 'rodada32', order: 10, date: '2026-07-01', homeTeam: 'Bélgica',       awayTeam: 'Senegal',  homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G83', phase: 'rodada32', order: 11, date: '2026-07-02', homeTeam: 'Portugal',      awayTeam: 'Croácia',  homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G84', phase: 'rodada32', order: 12, date: '2026-07-02', homeTeam: 'Espanha',       awayTeam: 'Áustria',  homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G85', phase: 'rodada32', order: 13, date: '2026-07-02', homeTeam: 'Suíça',         awayTeam: 'Argélia',  homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G86', phase: 'rodada32', order: 14, date: '2026-07-03', homeTeam: 'Argentina',     awayTeam: 'Cabo Verde', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G87', phase: 'rodada32', order: 15, date: '2026-07-03', homeTeam: 'Colômbia',      awayTeam: 'Gana',     homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G88', phase: 'rodada32', order: 16, date: '2026-07-03', homeTeam: 'Austrália',     awayTeam: 'Egito',    homeSourceGameId: null, awaySourceGameId: null },

  // ── Oitavas de final ──
  { id: 'G89', phase: 'oitavas', order: 1, date: '2026-07-04', homeTeam: null, awayTeam: null, homeSourceGameId: 'G74', awaySourceGameId: 'G77' },
  { id: 'G90', phase: 'oitavas', order: 2, date: '2026-07-04', homeTeam: null, awayTeam: null, homeSourceGameId: 'G73', awaySourceGameId: 'G75' },
  { id: 'G91', phase: 'oitavas', order: 3, date: '2026-07-05', homeTeam: null, awayTeam: null, homeSourceGameId: 'G76', awaySourceGameId: 'G78' },
  { id: 'G92', phase: 'oitavas', order: 4, date: '2026-07-05', homeTeam: null, awayTeam: null, homeSourceGameId: 'G79', awaySourceGameId: 'G80' },
  { id: 'G93', phase: 'oitavas', order: 5, date: '2026-07-06', homeTeam: null, awayTeam: null, homeSourceGameId: 'G83', awaySourceGameId: 'G84' },
  { id: 'G94', phase: 'oitavas', order: 6, date: '2026-07-06', homeTeam: null, awayTeam: null, homeSourceGameId: 'G81', awaySourceGameId: 'G82' },
  { id: 'G95', phase: 'oitavas', order: 7, date: '2026-07-07', homeTeam: null, awayTeam: null, homeSourceGameId: 'G86', awaySourceGameId: 'G88' },
  { id: 'G96', phase: 'oitavas', order: 8, date: '2026-07-07', homeTeam: null, awayTeam: null, homeSourceGameId: 'G85', awaySourceGameId: 'G87' },

  // ── Quartas de final ──
  { id: 'G97',  phase: 'quartas', order: 1, date: '2026-07-09', homeTeam: null, awayTeam: null, homeSourceGameId: 'G89', awaySourceGameId: 'G90' },
  { id: 'G98',  phase: 'quartas', order: 2, date: '2026-07-10', homeTeam: null, awayTeam: null, homeSourceGameId: 'G93', awaySourceGameId: 'G94' },
  { id: 'G99',  phase: 'quartas', order: 3, date: '2026-07-12', homeTeam: null, awayTeam: null, homeSourceGameId: 'G91', awaySourceGameId: 'G92' },
  { id: 'G100', phase: 'quartas', order: 4, date: '2026-07-12', homeTeam: null, awayTeam: null, homeSourceGameId: 'G95', awaySourceGameId: 'G96' },

  // ── Semifinais ──
  { id: 'G101', phase: 'semis', order: 1, date: '2026-07-14', homeTeam: null, awayTeam: null, homeSourceGameId: 'G97', awaySourceGameId: 'G98' },
  { id: 'G102', phase: 'semis', order: 2, date: '2026-07-15', homeTeam: null, awayTeam: null, homeSourceGameId: 'G99', awaySourceGameId: 'G100' },

  // ── Disputa de 3º lugar (perdedores das semis; tratado na UI) ──
  { id: 'G103', phase: 'terceiro', order: 1, date: '2026-07-18', homeTeam: null, awayTeam: null, homeSourceGameId: null, awaySourceGameId: null },

  // ── Final ──
  { id: 'G104', phase: 'final', order: 1, date: '2026-07-19', homeTeam: null, awayTeam: null, homeSourceGameId: 'G101', awaySourceGameId: 'G102' },
]
