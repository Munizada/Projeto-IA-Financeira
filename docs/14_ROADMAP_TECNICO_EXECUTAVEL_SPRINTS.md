# Roadmap Técnico Executável — Sprints do MVP

## 1. Objetivo

Este roadmap transforma o projeto em execução prática.

Ele organiza o desenvolvimento em sprints com entregáveis claros, dependências e critérios de aceite.

## 2. Premissa

O produto é grande, mas o MVP não precisa ser gigante.

MVP = WhatsApp + Espaços + despesas + ledger + saldos + Pix manual + web leve.

Fora do MVP:

- Open Finance;
- iniciação Pix;
- Groups API;
- OCR avançado;
- áudio avançado;
- app mobile;
- conta digital.

---

## Sprint 0 — Preparação e docs

Duração: 0,5 a 1 dia.

Objetivo:

- organizar repositório;
- colocar documentação;
- definir stack;
- preparar Codex.

Entregáveis:

- pasta `docs`;
- PDF original;
- PRD;
- arquitetura;
- backlog;
- contrato de qualidade;
- prompts do Codex.

Critério de aceite:

- Codex consegue ler documentos;
- escopo do MVP está fechado.

---

## Sprint 1 — Fundação + core financeiro

Duração: 1 a 2 dias com Codex bem guiado.

Objetivo:

- criar monorepo;
- implementar motor financeiro puro.

Entregáveis:

- pnpm workspace;
- TypeScript strict;
- packages/shared;
- packages/core;
- Vitest;
- README;
- testes.

Funções:

- createMoney;
- splitEqual;
- splitByPercentages;
- splitByShares;
- splitByFixedAmounts;
- createLedgerEntriesFromExpense;
- calculateBalances;
- simplifyDebts;
- applyPaymentToLedger.

Critério de aceite:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

Checklist:

- [ ] Sem float.
- [ ] Core isolado.
- [ ] Testes de centavos.
- [ ] Ledger determinístico.
- [ ] Saldos somam zero.

---

## Sprint 2 — Banco PostgreSQL + Prisma

Duração: 1 a 2 dias.

Objetivo:

- persistir dados do MVP.

Entregáveis:

- packages/database;
- Prisma schema;
- migrations;
- seed;
- `.env.example`;
- README database.

Models:

- User;
- UserConsent;
- Space;
- SpaceMember;
- Invite;
- Expense;
- ExpenseSplit;
- LedgerEntry;
- Payment;
- PaymentReceipt;
- FileObject;
- AuditLog;
- IdempotencyKey;
- ConversationEvent.

Critério de aceite:

```bash
pnpm typecheck
pnpm --filter database prisma validate
pnpm --filter database prisma generate
pnpm --filter database prisma migrate dev
pnpm --filter database seed
```

Checklist:

- [ ] Convite salva hash.
- [ ] AmountMinor inteiro.
- [ ] Relações corretas.
- [ ] Índices principais.
- [ ] Seed funcional.

---

## Sprint 3 — API NestJS base

Duração: 2 a 4 dias.

Objetivo:

- expor operações estruturadas do MVP.

Entregáveis:

- apps/api;
- NestJS;
- config/env;
- Prisma service;
- health endpoint;
- modules principais;
- DTOs;
- validation;
- error filter;
- audit service;
- idempotency service.

Módulos:

- users;
- spaces;
- members;
- invites;
- expenses;
- balances;
- payments;
- audit.

Endpoints mínimos:

- POST /spaces
- GET /spaces
- GET /spaces/:id
- POST /spaces/:id/invites
- POST /invites/:token/accept
- POST /spaces/:id/expenses/draft
- POST /spaces/:id/expenses/:expenseId/confirm
- GET /spaces/:id/expenses
- GET /spaces/:id/balances
- GET /spaces/:id/settlement
- POST /spaces/:id/payments/prepare
- POST /spaces/:id/payments/:paymentId/mark-paid
- POST /spaces/:id/payments/:paymentId/confirm
- POST /spaces/:id/expenses/:expenseId/contest

Critério de aceite:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter api start:dev
```

Checklist:

- [ ] API chama core, não duplica cálculo.
- [ ] Operações financeiras têm audit log.
- [ ] Permissão por Espaço.
- [ ] Idempotência.
- [ ] Erros tratados.

---

## Sprint 4 — Web Next.js mínima

Duração: 2 a 4 dias.

Objetivo:

- criar interface de apoio.

Entregáveis:

- apps/web;
- layout;
- client API;
- telas P0.

Telas:

- landing simples;
- convite;
- lista de Espaços;
- detalhe do Espaço;
- despesas;
- saldos;
- fechamento;
- pagamento;
- configuração Pix.

Critério de aceite:

```bash
pnpm lint
pnpm typecheck
pnpm --filter web dev
```

Checklist:

- [ ] Front não calcula saldo crítico.
- [ ] Mostra estados vazios.
- [ ] Mostra erro/loading.
- [ ] CTA para WhatsApp.
- [ ] Pix manual com aviso.

---

## Sprint 5 — WhatsApp sem IA

Duração: 1 a 3 dias.

Objetivo:

- conectar canal principal sem depender de IA.

Entregáveis:

- webhook verification;
- receive message;
- normalize message;
- identify user;
- send message;
- idempotency por message_id;
- logs.

Comandos determinísticos:

- oi;
- ajuda;
- meus espaços;
- saldo;
- link para web.

Critério de aceite:

- webhook recebe teste;
- resposta enviada;
- mensagem duplicada não duplica ação;
- logs seguros.

Checklist:

- [ ] Webhook protegido.
- [ ] ID do WhatsApp salvo.
- [ ] Número normalizado.
- [ ] Retry seguro.
- [ ] Nenhum segredo em log.

---

## Sprint 6 — IA com schemas

Duração: 2 a 5 dias.

Objetivo:

- permitir linguagem natural.

Entregáveis:

- AI gateway;
- provider abstrato;
- prompt base;
- schemas Zod;
- intent parser;
- confidence;
- flow de confirmação;
- testes de prompt injection.

Intents:

- create_space;
- create_expense;
- query_balance;
- generate_settlement;
- prepare_payment;
- mark_payment;
- contest_item;
- help;
- unknown.

Critério de aceite:

- mensagens principais viram comandos;
- ambiguidade pergunta;
- IA não altera banco diretamente;
- saldo vem do backend;
- Pix não é automático.

Checklist:

- [ ] System prompt aplicado.
- [ ] JSON validado.
- [ ] Baixa confiança tratada.
- [ ] Prompt injection recusado.
- [ ] Tools não bypassam permissão.

---

## Sprint 7 — Pix manual e comprovantes

Duração: 1 a 3 dias.

Objetivo:

- fechar ciclo de pagamento manual.

Entregáveis:

- chave Pix;
- preparar Pix;
- QR Code, se viável;
- marcar como pago;
- upload comprovante;
- confirmar recebimento;
- contestar pagamento.

Critério de aceite:

- usuário vê valor e recebedor;
- usuário entende que paga no banco;
- status funciona;
- comprovante privado.

Checklist:

- [ ] Não dizer “pago” antes de confirmação.
- [ ] Não prometer liquidação.
- [ ] Recebedor confirma.
- [ ] Status separados.
- [ ] Comprovante privado.

---

## Sprint 8 — Polimento do MVP privado

Duração: 2 a 5 dias.

Objetivo:

- preparar teste com amigos.

Entregáveis:

- mensagens melhores;
- dashboard limpo;
- tratamento de erro;
- logs;
- seed realista;
- deploy dev;
- checklist LGPD mínimo;
- política/termos temporários;
- backup.

Critério de aceite:

- 5 Espaços reais conseguem testar;
- despesas registradas;
- fechamento funciona;
- Pix manual funciona;
- erros são rastreáveis.

---

## Sprint 9 — Validação real

Duração: 1 a 3 semanas.

Objetivo:

- testar dor e comportamento.

Meta:

- 5 a 20 Espaços;
- 30 a 100 despesas;
- 2 a 8 membros por Espaço;
- pelo menos 3 fechamentos completos.

Métricas:

- convite aceito;
- primeira despesa em 24h;
- despesas por Espaço;
- correções;
- contestações;
- pagamentos marcados;
- feedback.

Perguntas pós-teste:

1. Isso reduziu confusão?
2. Você usaria de novo?
3. Qual parte deu medo?
4. Qual parte foi mágica?
5. Você pagaria?
6. Preferiria WhatsApp ou app?
7. O que faltou?

---

## Sprint 10 — Decisão pós-MVP

Caminhos:

## Se funcionou

- melhorar IA;
- OCR;
- áudio;
- recorrências;
- relatórios;
- cobrança por Espaço;
- Open Finance leitura com parceiro.

## Se quase funcionou

- corrigir UX;
- simplificar convite;
- melhorar explicação de saldo;
- reduzir etapas.

## Se não funcionou

- revisar segmento;
- testar só viagem;
- testar só casa;
- testar landing/copy;
- fazer concierge MVP.

---

## Ordem final resumida

1. Docs.
2. Core.
3. Banco.
4. API.
5. Web.
6. WhatsApp.
7. IA.
8. Pix manual.
9. Segurança.
10. Beta.

Não inverter essa ordem.
