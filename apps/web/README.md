# Web

`@ia-financeira/web` e a web leve do MVP. Ela apoia o fluxo principal do WhatsApp com paginas para revisar espacos, despesas, saldos e acerto final.

## Rotas

- `/`
- `/spaces`
- `/spaces/[spaceId]`
- `/spaces/[spaceId]/expenses`
- `/spaces/[spaceId]/balances`
- `/spaces/[spaceId]/settlement`

## Como rodar

```bash
corepack pnpm --filter @ia-financeira/web dev
corepack pnpm --filter @ia-financeira/web test
corepack pnpm --filter @ia-financeira/web typecheck
corepack pnpm --filter @ia-financeira/web build
```

## Ambiente

Use `NEXT_PUBLIC_API_BASE_URL` para apontar para a API NestJS:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3333/api/v1"
```

Se a variavel nao existir, se a API estiver offline ou se os testes estiverem rodando, a web usa fallback automatico para `src/lib/mock-data.ts`.

## O que ja esta implementado

- App Router com layout global;
- landing page simples;
- lista de espacos;
- detalhe do espaco;
- pagina de despesas;
- pagina de saldos;
- pagina de acerto;
- componentes base reutilizaveis;
- client API com fallback para mocks;
- testes de money, mock data e api client.

## O que ainda nao esta implementado

- login real;
- formularios completos;
- WhatsApp;
- IA;
- Pix automatico;
- Open Finance.
