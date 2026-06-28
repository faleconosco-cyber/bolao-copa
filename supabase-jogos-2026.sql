-- Recria todos os jogos da fase final da Copa 2026 com os confrontos reais.
-- Roda isto no SQL Editor do Supabase (substitui os jogos antigos "Time A".."Time P").

delete from predictions;
delete from games;

insert into games (id, phase, ordering, game_date, home_team, away_team, home_source_game_id, away_source_game_id) values
-- Rodada de 32
('G73', 'rodada32', 1,  '2026-06-28', 'África do Sul',   'Canadá',     null,  null),
('G74', 'rodada32', 2,  '2026-06-29', 'Alemanha',        'Paraguai',   null,  null),
('G75', 'rodada32', 3,  '2026-06-29', 'Holanda',         'Marrocos',   null,  null),
('G76', 'rodada32', 4,  '2026-06-29', 'Brasil',          'Japão',      null,  null),
('G77', 'rodada32', 5,  '2026-06-30', 'França',          'Suécia',     null,  null),
('G78', 'rodada32', 6,  '2026-06-30', 'Costa do Marfim', 'Noruega',    null,  null),
('G79', 'rodada32', 7,  '2026-06-30', 'México',          'Equador',    null,  null),
('G80', 'rodada32', 8,  '2026-07-01', 'Inglaterra',      'RD Congo',   null,  null),
('G81', 'rodada32', 9,  '2026-07-01', 'EUA',             'Bósnia',     null,  null),
('G82', 'rodada32', 10, '2026-07-01', 'Bélgica',         'Senegal',    null,  null),
('G83', 'rodada32', 11, '2026-07-02', 'Portugal',        'Croácia',    null,  null),
('G84', 'rodada32', 12, '2026-07-02', 'Espanha',         '2º J',       null,  null),
('G85', 'rodada32', 13, '2026-07-02', 'Suíça',           '3º EFGIJ',   null,  null),
('G86', 'rodada32', 14, '2026-07-03', 'Argentina',       'Cabo Verde', null,  null),
('G87', 'rodada32', 15, '2026-07-03', 'Colômbia',        'Gana',       null,  null),
('G88', 'rodada32', 16, '2026-07-03', 'Austrália',       'Egito',      null,  null),
-- Oitavas de final
('G89', 'oitavas', 1, '2026-07-04', null, null, 'G74', 'G77'),
('G90', 'oitavas', 2, '2026-07-04', null, null, 'G73', 'G75'),
('G91', 'oitavas', 3, '2026-07-05', null, null, 'G76', 'G78'),
('G92', 'oitavas', 4, '2026-07-05', null, null, 'G79', 'G80'),
('G93', 'oitavas', 5, '2026-07-06', null, null, 'G83', 'G84'),
('G94', 'oitavas', 6, '2026-07-06', null, null, 'G81', 'G82'),
('G95', 'oitavas', 7, '2026-07-07', null, null, 'G86', 'G88'),
('G96', 'oitavas', 8, '2026-07-07', null, null, 'G85', 'G87'),
-- Quartas de final
('G97',  'quartas', 1, '2026-07-09', null, null, 'G89', 'G90'),
('G98',  'quartas', 2, '2026-07-10', null, null, 'G93', 'G94'),
('G99',  'quartas', 3, '2026-07-12', null, null, 'G91', 'G92'),
('G100', 'quartas', 4, '2026-07-12', null, null, 'G95', 'G96'),
-- Semifinais
('G101', 'semis', 1, '2026-07-14', null, null, 'G97', 'G98'),
('G102', 'semis', 2, '2026-07-15', null, null, 'G99', 'G100'),
-- Disputa de 3º lugar (perdedores das semis; escolhido na tela)
('G103', 'terceiro', 1, '2026-07-18', null, null, null, null),
-- Final
('G104', 'final', 1, '2026-07-19', null, null, 'G101', 'G102');
