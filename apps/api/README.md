# API

`@ia-financeira/api` expoe a API base do MVP em NestJS.

Ela cobre a camada HTTP para Spaces, Members, Expenses, Balances, Settlement e Payments. A API nao calcula dinheiro diretamente: rateio, ledger, saldos e liquidacao usam `@ia-financeira/core`.

## Endpoints

- `GET /api/v1/health`
- `POST /api/v1/spaces`
- `GET /api/v1/spaces/:spaceId`
- `POST /api/v1/spaces/:spaceId/members`
- `GET /api/v1/spaces/:spaceId/members`
- `POST /api/v1/spaces/:spaceId/expenses`
- `GET /api/v1/spaces/:spaceId/expenses`
- `GET /api/v1/spaces/:spaceId/expenses/:expenseId`
- `GET /api/v1/spaces/:spaceId/balances`
- `GET /api/v1/spaces/:spaceId/settlement`
- `POST /api/v1/spaces/:spaceId/payments/confirm`

## O Que Ja Esta Implementado

- bootstrap NestJS com prefixo `/api/v1`;
- validacao com Zod;
- filtro global de erro sem stack trace na resposta;
- `DatabaseService` unico para acesso ao Prisma;
- criacao de Space e criacao automatica do membro organizador;
- membros por espaco;
- criacao de despesa confirmada com splits e ledger;
- calculo de saldos e settlement pelo core;
- confirmacao de pagamento com lancamento reverso no ledger;
- testes da API com mocks, sem PostgreSQL real.

## O Que Ainda Nao Esta Implementado

- autenticacao real;
- permissao fina por usuario autenticado;
- WhatsApp;
- IA;
- Pix real;
- Open Finance;
- frontend real;
- fluxo completo de convites;
- idempotencia via header HTTP dedicado.

## Regra Financeira

A API nao implementa calculo financeiro critico por conta propria.

- `splitEqual`, `createLedgerEntriesFromExpense` vem de `@ia-financeira/core`;
- `calculateBalances` vem de `@ia-financeira/core`;
- `simplifyDebts` vem de `@ia-financeira/core`;
- `applyPaymentToLedger` vem de `@ia-financeira/core`.

## Como Rodar

```bash
corepack pnpm --filter @ia-financeira/api dev
corepack pnpm --filter @ia-financeira/api test
corepack pnpm --filter @ia-financeira/api typecheck
corepack pnpm --filter @ia-financeira/api build
```
