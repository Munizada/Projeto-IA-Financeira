# IA Financeira Coletiva no WhatsApp

Fundacao tecnica do produto de despesas compartilhadas por WhatsApp.

A regra central do projeto e:

> IA interpreta; core calcula, valida e registra.

Nesta fase o projeto ja tem o monorepo, o core financeiro puro, o pacote de banco com Prisma, a API base em NestJS e a web base em Next.js. Ainda nao ha WhatsApp, IA, Open Finance ou Pix real.

## Stack

- TypeScript strict
- Node.js
- pnpm workspaces
- Vitest
- ESLint
- Prettier
- Zod
- Prisma
- NestJS

## Estrutura

```txt
apps/
  api/       API NestJS base
  web/       Web base Next.js
packages/
  core/      Motor financeiro puro
  shared/    Enums, tipos e schemas Zod
  database/  Schema PostgreSQL/Prisma
docs/        Documentacao de produto e arquitetura
```

## Como instalar

```bash
corepack pnpm install
```

## Comandos Principais

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm format:check
```

## Comandos Da API

```bash
corepack pnpm --filter @ia-financeira/api dev
corepack pnpm --filter @ia-financeira/api test
corepack pnpm --filter @ia-financeira/api typecheck
corepack pnpm --filter @ia-financeira/api build
```

## Comandos Da Web

```bash
corepack pnpm --filter @ia-financeira/web dev
corepack pnpm --filter @ia-financeira/web test
corepack pnpm --filter @ia-financeira/web typecheck
corepack pnpm --filter @ia-financeira/web build
```

## Status Atual

- Etapa 1 implementada: monorepo, `packages/shared` e `packages/core`;
- Etapa 2 implementada: `packages/database` com Prisma, migration e seed;
- Etapa 3 implementada: API base em NestJS com endpoints de health, spaces, members, expenses, balances, settlement e payments.
- Etapa 4 implementada: web base em Next.js com landing, espacos, detalhe, despesas, saldos e acerto.

## Regra Financeira

O core financeiro cobre:

- dinheiro com `amountMinor` inteiro;
- divisao igual;
- divisao percentual;
- divisao por cotas;
- divisao por valores fixos;
- ledger de despesas confirmadas;
- calculo de saldos;
- simplificacao de dividas;
- pagamento confirmado como lancamento reverso no ledger.

A API usa `packages/core` para calculos financeiros e `packages/database` para persistencia. Ela nao duplica regra critica de dinheiro.
