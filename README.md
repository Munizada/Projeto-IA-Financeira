# IA Financeira Coletiva no WhatsApp

Fundacao tecnica do produto de despesas compartilhadas por WhatsApp.

A regra central do projeto e:

> IA interpreta; core calcula, valida e registra.

Nesta etapa o foco e somente monorepo, tipos compartilhados e motor financeiro puro. Nao ha banco, API real, web real, WhatsApp, IA, Pix real ou Prisma implementados ainda.

## Stack

- TypeScript strict
- Node.js
- pnpm workspaces
- Vitest
- ESLint
- Prettier
- Zod em `packages/shared`

## Estrutura

```txt
apps/
  api/       Placeholder da API futura
  web/       Placeholder da web futura
packages/
  core/      Motor financeiro puro
  shared/    Enums, tipos e schemas Zod
  database/  Placeholder do PostgreSQL/Prisma futuro
docs/        Documentacao de produto e arquitetura
```

## Como instalar

```bash
pnpm install
```

Se `pnpm` nao estiver no PATH, use:

```bash
corepack pnpm install
```

## Comandos

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
```

Com Corepack:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm format:check
```

## Status atual

Etapa 1 implementada: monorepo TypeScript, `packages/shared`, `packages/core` e testes automatizados do core financeiro.

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
