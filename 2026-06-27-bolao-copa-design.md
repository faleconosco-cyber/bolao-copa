# Bolão Copa 2026 — Especificação do site (fase final)

**Data:** 27/06/2026
**Status:** desenho aprovado nas conversas, aguardando revisão final da Cláudia

---

## 1. O que é

Site para o bolão da Copa do Mundo 2026, cobrindo **a partir das oitavas de final** (a fase de 32 já terá acontecido). As pessoas cadastram palpites de placar de cada jogo e podem **editar até as 23h59 da véspera** de cada jogo; quando vira o dia do jogo, o palpite trava. A classificação é calculada automaticamente.

Grupo **fechado e pequeno** (≈ 10 a 50 pessoas). Administração só da Cláudia.

## 2. Fases cobertas

Oitavas de final → Quartas de final → Semifinais → **Disputa de 3º lugar** → Final.

- Oitavas: 8 jogos (os 16 times já são conhecidos, pois a fase de 32 já passou).
- Quartas: 4 jogos.
- Semifinais: 2 jogos.
- 3º lugar: 1 jogo.
- Final: 1 jogo.

## 3. Como o apostador usa

1. **Entrar:** digita o nome + o **código/PIN** pessoal que a Cláudia entregou.
2. **Meus palpites:** lista dos jogos. Em cada jogo, sem digitar:
   - Os dois times aparecem (nas oitavas já vêm prontos; nas fases seguintes vêm preenchidos automaticamente conforme quem a própria pessoa marcou pra avançar).
   - Define o **placar** em botões/setas de número dos dois lados.
   - Se marcar **empate**, é obrigada a escolher na **setinha** qual time avança (serve só para montar os jogos seguintes dela; **não vale pontos**).
   - Jogos cuja véspera já chegou aparecem **travados** (cadeado), só leitura.
3. **Artilheiro:** escolhe o artilheiro da Copa (trava junto com o 1º jogo das oitavas).
4. **Classificação:** tabela com todos, pontos, posição e a divisão do prêmio em R$.

## 4. Como a Cláudia (admin) usa

1. Entra com senha de administrador.
2. **Cadastra apostadores** (nome → o sistema gera o PIN de cada um).
3. **Lança resultados** conforme os jogos acontecem: placar real e quem avançou; no fim, o artilheiro da Copa. A classificação recalcula sozinha.

## 5. Pontuação (degraus — vale sempre o maior que se encaixa, não soma)

Considera **só o placar do tempo normal**.

| Situação | Pontos |
|---|---|
| Placar exato (os dois números) | **12** |
| Acertou quem venceu + acertou o número de um dos times | **8** |
| Acertou só quem venceu (nenhum número certo) | **6** |
| Errou quem venceu, mas acertou o número de um dos times | **2** |
| Errou tudo | **0** |
| Acertou o Artilheiro da Copa (uma vez no torneio) | **+20** |

- Em jogo que termina **empatado** (vai a pênaltis): a pontuação sai do placar do tempo normal. Apostar "empate" e dar empate = degrau do empate (12 se exato, 6 se empate sem número certo, etc.). **Quem avança não pontua** — só serve pra montar as próximas fases do palpite da pessoa.

## 6. Trava (regra de prazo)

- Cada jogo tem uma **data**. O palpite daquele jogo pode ser editado até as **23h59 da véspera**; quando vira o dia do jogo, trava (só leitura).
- O palpite de **artilheiro** trava junto com o **primeiro jogo das oitavas**.
- Trava automática pelo relógio — admin não precisa fazer nada.

## 7. Premiação

- **Inscrição: R$ 50,00 por pessoa.** O bolo é calculado automaticamente: nº de apostadores × R$ 50.
- Dividido entre os **5 primeiros**: **50% / 20% / 15% / 10% / 5%**.
- **Empate em pontos:** quem empatou ocupa a mesma posição e **divide** a soma dos prêmios das posições ocupadas.
  - Ex.: dois empatados em 1º dividem (prêmio 1º + 2º) ÷ 2 cada.
- A divisão do prêmio aparece **para todos** na classificação.

## 8. Como o "quem avança" flui entre as fases

- Nas **oitavas**, os 16 times são fixos e conhecidos.
- O time que a pessoa marca para avançar em cada jogo (pelo placar; ou pela setinha quando for empate) **preenche automaticamente** o confronto da fase seguinte do palpite dela (chaveamento em cascata).
- Assim ela nunca digita time — sempre vê os dois lados já montados a partir das próprias escolhas.

## 9. Tecnologia

Mesma "receita" dos outros sistemas da Cláudia:

- **Front-end:** React (interface do apostador + painel admin).
- **Banco/back-end:** Supabase (apostadores, jogos, palpites, resultados, configuração).
- **Hospedagem:** Vercel.

### Estrutura de dados (resumo)

- **apostadores:** id, nome, pin.
- **jogos:** id, fase, ordem, data, time_casa, time_fora (e/ou referência "vencedor do jogo X"), placar_real_casa, placar_real_fora, time_que_avancou_real.
- **palpites:** apostador_id, jogo_id, placar_casa, placar_fora, time_avanca_escolhido.
- **palpite_artilheiro:** apostador_id, jogador.
- **config:** valor_inscricao (R$ 50), artilheiro_real.

A pontuação e a divisão de prêmio são **calculadas**, não digitadas.

## 10. Fora de escopo (por enquanto)

- Fase de grupos e fase de 32 (já aconteceram).
- Pagamento online da inscrição (o R$ 50 é controlado por fora).
- Cadastro aberto ao público / login por e-mail.
