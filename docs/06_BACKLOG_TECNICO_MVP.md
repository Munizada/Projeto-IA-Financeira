# Backlog Técnico do MVP

## Objetivo

Este backlog organiza o MVP em épicos, histórias e tarefas técnicas.

Ele deve orientar o Codex e o desenvolvimento humano.

## Épico 1 — Fundação do projeto

### História 1.1 — Monorepo

Como dev, quero um monorepo organizado para separar API, web, core, shared e database.

Tarefas:

- criar pnpm workspace;
- criar package.json raiz;
- criar tsconfig.base.json;
- criar apps/api;
- criar apps/web;
- criar packages/core;
- criar packages/shared;
- criar packages/database;
- configurar scripts globais.

Aceite:

- workspace reconhece todos os pacotes;
- scripts rodam do root.

### História 1.2 — Qualidade base

Tarefas:

- ESLint;
- Prettier;
- TypeScript strict;
- Vitest;
- .gitignore;
- README;
- .env.example.

Aceite:

- lint passa;
- typecheck passa;
- test passa.

## Épico 2 — Shared

### História 2.1 — Enums e tipos

Tarefas:

- SpaceType;
- SpaceStatus;
- MemberRole;
- MemberStatus;
- SplitRule;
- ExpenseStatus;
- PaymentStatus;
- Money;
- Member;
- ExpenseInput;
- ExpenseSplit;
- LedgerEntry;
- Balance;
- SettlementPayment.

Aceite:

- tipos exportados;
- core consome shared;
- sem dependência circular.

### História 2.2 — Schemas

Tarefas:

- Zod para Money;
- Zod para ExpenseInput;
- Zod para Split;
- Zod para Payment;
- Zod para IDs.

Aceite:

- schemas validam entradas;
- testes cobrem casos inválidos principais.

## Épico 3 — Core financeiro

### História 3.1 — Money

Tarefas:

- createMoney;
- formatMoneyBRL;
- assertSameCurrency;
- sumMoney.

Aceite:

- não aceita float;
- não aceita negativo;
- formata BRL;
- soma corretamente.

### História 3.2 — Rateio igual

Tarefas:

- splitEqual;
- distribuição determinística de centavos;
- testes.

Aceite:

- R$100/2 correto;
- R$100/3 correto;
- soma bate.

### História 3.3 — Rateio percentual

Tarefas:

- splitByPercentages;
- validar soma 100;
- rejeitar percentual negativo;
- arredondar centavos.

Aceite:

- 70/30 funciona;
- soma 99/101 falha;
- negativo falha.

### História 3.4 — Rateio por cotas

Tarefas:

- splitByShares;
- validar cotas positivas;
- arredondar.

Aceite:

- 2/1/1 funciona;
- zero falha;
- negativo falha.

### História 3.5 — Rateio fixo

Tarefas:

- splitByFixedAmounts;
- validar soma;
- rejeitar negativo.

Aceite:

- soma correta aceita;
- soma errada falha.

### História 3.6 — Ledger

Tarefas:

- createLedgerEntriesFromExpense;
- não gerar dívida do pagador para si;
- eventType expense_confirmed.

Aceite:

- ledger correto;
- total bate;
- determinístico.

### História 3.7 — Saldos

Tarefas:

- calculateBalances;
- créditos;
- débitos;
- saldo líquido.

Aceite:

- soma dos saldos é zero;
- positivo recebe;
- negativo paga.

### História 3.8 — Simplificação

Tarefas:

- simplifyDebts;
- devedores;
- credores;
- algoritmo determinístico.

Aceite:

- gera pagamentos mínimos razoáveis;
- quita todos os saldos;
- ignora saldo zero.

### História 3.9 — Pagamento aplicado ao ledger

Tarefas:

- applyPaymentToLedger;
- validar moeda;
- validar valor;
- reduzir obrigação.

Aceite:

- pagamento reduz dívida;
- moeda diferente falha;
- negativo falha.

## Épico 4 — Banco de dados

### História 4.1 — Prisma base

Tarefas:

- instalar Prisma;
- configurar PostgreSQL;
- criar schema;
- gerar client.

Aceite:

- prisma validate passa.

### História 4.2 — Models principais

Tarefas:

- User;
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
- IdempotencyKey.

Aceite:

- relações corretas;
- enums corretos;
- constraints básicas.

### História 4.3 — Seed

Tarefas:

- criar usuários exemplo;
- criar Espaço exemplo;
- criar membros;
- criar despesas;
- criar ledger.

Aceite:

- seed roda;
- dados aparecem.

## Épico 5 — API

### História 5.1 — Setup NestJS

Tarefas:

- criar app;
- config module;
- health endpoint;
- validation pipe;
- error filter;
- logger.

Aceite:

- API sobe;
- health funciona.

### História 5.2 — Spaces

Endpoints:

- POST /spaces;
- GET /spaces;
- GET /spaces/:id;
- PATCH /spaces/:id;
- POST /spaces/:id/close.

Aceite:

- cria Espaço;
- lista Espaços;
- valida permissões.

### História 5.3 — Invites

Endpoints:

- POST /spaces/:id/invites;
- GET /invites/:token;
- POST /invites/:token/accept;
- POST /invites/:id/revoke.

Aceite:

- convite expira;
- convite é uso único;
- token salvo como hash.

### História 5.4 — Expenses

Endpoints:

- POST /spaces/:id/expenses/draft;
- POST /spaces/:id/expenses/:expenseId/confirm;
- GET /spaces/:id/expenses;
- POST /spaces/:id/expenses/:expenseId/contest;
- POST /spaces/:id/expenses/:expenseId/cancel.

Aceite:

- cria draft;
- confirma;
- gera ledger;
- recalcula saldo.

### História 5.5 — Balances

Endpoints:

- GET /spaces/:id/balances;
- GET /spaces/:id/settlement.

Aceite:

- retorna saldos;
- retorna pagamentos simplificados.

### História 5.6 — Payments

Endpoints:

- POST /spaces/:id/payments/prepare;
- POST /spaces/:id/payments/:paymentId/mark-paid;
- POST /spaces/:id/payments/:paymentId/confirm;
- POST /spaces/:id/payments/:paymentId/contest.

Aceite:

- prepara pagamento;
- marca como pago;
- recebedor confirma;
- contestação funciona.

## Épico 6 — Web

### História 6.1 — Layout base

Tarefas:

- Next.js;
- design simples;
- navegação;
- conexão API.

### História 6.2 — Convite

Tarefas:

- tela de convite;
- aceitar convite;
- mostrar privacidade;
- confirmar número.

### História 6.3 — Espaço

Tarefas:

- tela de Espaço;
- membros;
- despesas;
- saldos;
- fechamento.

### História 6.4 — Pagamento

Tarefas:

- ver Pix;
- marcar pago;
- anexar comprovante;
- confirmar recebimento.

## Épico 7 — WhatsApp

### História 7.1 — Webhook

Tarefas:

- verificação;
- recebimento;
- normalização;
- logs;
- idempotência.

### História 7.2 — Envio

Tarefas:

- serviço de envio;
- templates/config;
- retries;
- mensagens simples.

### História 7.3 — Comandos determinísticos

Tarefas:

- oi;
- ajuda;
- meus espaços;
- saldo.

## Épico 8 — IA

### História 8.1 — Gateway

Tarefas:

- interface;
- provider;
- prompt;
- schemas;
- logs.

### História 8.2 — Parse de intenções

Intenções:

- create_space;
- create_expense;
- query_balance;
- generate_settlement;
- prepare_payment;
- mark_payment;
- contest_item.

### História 8.3 — Confirmação

Tarefas:

- pendências;
- respostas de sim/não;
- correção;
- cancelamento.

## Épico 9 — Pix manual

Tarefas:

- chave Pix;
- payload;
- QR Code;
- status;
- comprovante.

## Épico 10 — Segurança e auditoria

Tarefas:

- permissões;
- audit logs;
- rate limit;
- mascaramento;
- idempotência;
- logs seguros.

## Priorização inicial

Prioridade máxima:

1. Core financeiro.
2. Testes.
3. Banco.
4. API.
5. Web mínima.
6. WhatsApp.
7. IA.

Não inverter.
