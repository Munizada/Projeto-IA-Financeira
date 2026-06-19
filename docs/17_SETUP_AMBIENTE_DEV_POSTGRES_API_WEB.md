# Setup de ambiente dev: Postgres, API e Web

## Objetivo

Este guia prepara o projeto para rodar contra um PostgreSQL real de desenvolvimento usando `DATABASE_URL`.

Docker nao e obrigatorio. Neste PC, nao instale Docker nem PostgreSQL direto no Windows para este fluxo.

## 1. Obter uma DATABASE_URL de desenvolvimento

Use um PostgreSQL de desenvolvimento hospedado ou um PostgreSQL local ja existente em outro ambiente.

A URL deve seguir este formato:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Use credenciais apenas de desenvolvimento. Nao use banco de producao para `migrate dev` ou `seed`.

## 2. Criar o .env local

Na raiz do projeto, copie `.env.example` para `.env` e substitua `DATABASE_URL` pela URL real do banco de desenvolvimento:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3333/api/v1"
API_PORT="3333"
NODE_ENV="development"
```

O arquivo `.env` e local e nunca deve ser commitado. Ele esta no `.gitignore`.

## 3. Instalar dependencias

```bash
corepack pnpm install
```

## 4. Validar Prisma

Estes comandos validam o schema e geram o Prisma Client:

```bash
corepack pnpm db:validate
corepack pnpm db:generate
```

## 5. Rodar migrate e seed

Rode estes comandos somente depois de configurar uma `DATABASE_URL` real no `.env` ou no ambiente do shell:

```bash
corepack pnpm db:migrate
corepack pnpm db:seed
```

Sem `DATABASE_URL` explicita, os scripts recusam `migrate` e `seed`.

## 6. Rodar API

```bash
corepack pnpm --filter @ia-financeira/api dev
```

Atalho equivalente:

```bash
corepack pnpm api:dev
```

Teste a API:

```txt
GET http://localhost:3333/api/v1/health
```

Resposta esperada:

```json
{
  "service": "ia-financeira-api",
  "status": "ok"
}
```

## 7. Rodar Web

```bash
corepack pnpm --filter @ia-financeira/web dev
```

Atalho equivalente:

```bash
corepack pnpm web:dev
```

Abra:

```txt
http://localhost:3000
```

## 8. Confirmar Web usando API real

Com a API rodando em `http://localhost:3333/api/v1` e `NEXT_PUBLIC_API_BASE_URL` configurado, a Web tenta buscar dados reais da API.

Para confirmar:

- mantenha a API ligada;
- abra a Web em `http://localhost:3000`;
- confira as respostas da API no terminal da API ou no Network do navegador;
- desligue a API e recarregue a Web para confirmar o fallback.

## 9. Voltar para mocks

A Web volta automaticamente para mocks quando:

- `NEXT_PUBLIC_API_BASE_URL` nao esta configurado;
- a API esta offline;
- a resposta da API falha ou vem em formato invalido;
- os testes estao rodando.

Para forcar mocks em desenvolvimento, remova `NEXT_PUBLIC_API_BASE_URL` do `.env` local ou pare a API.

## 10. Checklist de seguranca

Antes de commitar:

```bash
git status --short
git check-ignore -v .env
git check-ignore -v .env.local
```

Nao commite:

- `.env`;
- `.env.local`;
- credenciais reais;
- `node_modules/`;
- `.next/`;
- `dist/`;
- logs ou caches.
