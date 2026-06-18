# Database

`@ia-financeira/database` concentra o schema PostgreSQL/Prisma do MVP.

Este pacote persiste entidades, ledger, auditoria, idempotencia, arquivos e eventos de conversa. Ele nao implementa API, frontend, WhatsApp, IA, Pix real, Open Finance ou regra financeira complexa. O banco guarda o que o core/API calculam e validam.

## Models Principais

- `User`
- `UserConsent`
- `Space`
- `SpaceMember`
- `Invite`
- `Expense`
- `ExpenseSplit`
- `LedgerEntry`
- `Payment`
- `PaymentReceipt`
- `FileObject`
- `AuditLog`
- `IdempotencyKey`
- `ConversationEvent`

## Regras Financeiras E De Seguranca

Dinheiro sempre usa `amountMinor Int` mais `currency`. O schema nao usa `Float` para valores financeiros.

Convites salvam somente `tokenHash String @unique`. Token puro nao deve ser salvo no banco.

O ledger e append-only por regra de aplicacao: correcoes futuras devem criar eventos compensatorios, ajustes ou cancelamentos logicos com auditoria.

## Configuracao

Crie um `.env` local fora do Git com:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ia_financeira_whatsapp?schema=public"
```

O arquivo `.env.example` ja contem uma URL falsa de desenvolvimento.

## Comandos

Na raiz do projeto:

```bash
corepack pnpm --filter @ia-financeira/database prisma:validate
corepack pnpm --filter @ia-financeira/database prisma:generate
corepack pnpm --filter @ia-financeira/database prisma:migrate
corepack pnpm --filter @ia-financeira/database prisma:seed
```

Aliases da raiz:

```bash
corepack pnpm db:validate
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:seed
```

## Seed

O seed cria dados fake e repetiveis:

- usuarios Arthur, Ana, Bruno e Caio;
- Espaco `Floripa MVP`;
- membros ativos;
- despesa `Airbnb` de R$ 480,00 paga por Arthur;
- splits de R$ 120,00 para cada membro;
- ledger entries de Ana, Bruno e Caio devendo R$ 120,00 para Arthur;
- audit log basico;
- conversation event basico.

Use:

```bash
corepack pnpm --filter @ia-financeira/database prisma:seed
```

## Migration

A migration inicial fica em:

```txt
packages/database/prisma/migrations/000001_init/migration.sql
```

Ela pode ser aplicada com `prisma:migrate` quando houver PostgreSQL local configurado em `DATABASE_URL`.

## Ainda Nao Implementado

- API NestJS;
- Next.js;
- WhatsApp;
- IA;
- Pix real;
- Open Finance;
- storage real;
- Docker;
- politicas de RLS.
