# Protocolo de Prompts para Codex

## Objetivo

Este documento define como pedir tarefas ao Codex sem aumentar o risco de alucinação.

O projeto é grande e financeiro. O Codex deve receber prompts fechados, com escopo limitado e critérios claros.

## Regra número 1

Nunca pedir:

> “Faça o app inteiro.”

Pedir sempre:

> “Implemente esta etapa específica, usando estes documentos, com estes critérios de aceite.”

## Estrutura ideal de prompt

Todo prompt para Codex deve ter:

1. Contexto curto do produto.
2. Arquivos que ele deve ler.
3. Objetivo da execução.
4. O que implementar.
5. O que não implementar.
6. Regras técnicas.
7. Estrutura esperada.
8. Testes obrigatórios.
9. Comandos para rodar.
10. Critério de aceite.
11. Pedido explícito para corrigir erros.

## Template de prompt

```txt
Você é um engenheiro full-stack sênior trabalhando comigo no produto IA Financeira Coletiva no WhatsApp.

Antes de alterar arquivos, leia:
- docs/00_LEIA_PRIMEIRO_CONTROLE_DO_PROJETO.md
- docs/[DOCUMENTOS_RELEVANTES]

Objetivo desta execução:
[OBJETIVO CLARO]

Implemente:
- [ITEM 1]
- [ITEM 2]
- [ITEM 3]

Não implemente nesta etapa:
- [FORA DE ESCOPO 1]
- [FORA DE ESCOPO 2]

Regras obrigatórias:
- [REGRA 1]
- [REGRA 2]
- [REGRA 3]

Testes obrigatórios:
- [TESTE 1]
- [TESTE 2]

Critério de aceite:
- pnpm lint
- pnpm typecheck
- pnpm test
- [OUTRO COMANDO]

Depois de implementar:
1. Rode/corrija os comandos.
2. Liste arquivos criados/alterados.
3. Explique decisões técnicas.
4. Não pare só na análise. Faça as alterações.
```

## Prompt 1 — Monorepo + Core financeiro

Usar quando iniciar o projeto.

```txt
Você é um engenheiro full-stack sênior trabalhando comigo em um produto real chamado IA Financeira Coletiva no WhatsApp.

Antes de alterar arquivos, leia:
- docs/00_LEIA_PRIMEIRO_CONTROLE_DO_PROJETO.md
- docs/01_PRD_MVP_IA_Financeira_Coletiva.md
- docs/02_Especificacao_Tecnica_Core_Financeiro_Ledger.md
- docs/04_ARQUITETURA_E_DECISOES_TECNICAS.md
- docs/05_ROADMAP_DE_EXECUCAO_NO_CODEX.md
- docs/07_CONTRATO_DE_QUALIDADE_E_ACEITE.md

Contexto:
O produto permite criar Espaços Compartilhados, registrar despesas, calcular rateios, manter ledger, mostrar saldos, simplificar dívidas e preparar Pix manual no MVP. A IA interpreta, mas o motor financeiro calcula, valida e registra.

Objetivo desta execução:
Criar a fundação do monorepo TypeScript e implementar o pacote de core financeiro puro com testes completos.

Implemente:
1. pnpm workspace.
2. package.json raiz com scripts dev, build, test, lint, typecheck, format.
3. tsconfig.base.json.
4. ESLint.
5. Prettier.
6. apps/api vazio estruturado, sem implementar API ainda.
7. apps/web vazio estruturado, sem implementar frontend ainda.
8. packages/shared com enums, tipos e schemas base.
9. packages/core com funções:
   - createMoney
   - assertSameCurrency
   - sumMoney
   - formatMoneyBRL
   - sortMemberIdsStable
   - splitEqual
   - splitByPercentages
   - splitByShares
   - splitByFixedAmounts
   - createLedgerEntriesFromExpense
   - calculateBalances
   - simplifyDebts
   - applyPaymentToLedger
10. Testes Vitest cobrindo money, splits, ledger, balances, simplifyDebts e payment.
11. README raiz.
12. README do packages/core.

Não implemente nesta etapa:
- banco;
- Prisma;
- API NestJS real;
- Next.js real;
- WhatsApp;
- IA;
- Open Finance;
- pagamento automático.

Regras obrigatórias:
- Não usar float para dinheiro.
- Todo dinheiro deve usar amountMinor integer.
- O core não pode depender de banco, API, WhatsApp ou IA.
- Não deixar TODO em código essencial.
- Não criar placeholder crítico.
- Funções devem ser determinísticas.
- Testes devem cobrir arredondamento de centavos.

Critério de aceite:
- pnpm install funciona.
- pnpm lint passa.
- pnpm typecheck passa.
- pnpm test passa.

Depois de implementar:
1. Corrija erros encontrados.
2. Liste arquivos criados/alterados.
3. Explique decisões técnicas.
4. Não pare na análise. Faça as alterações.
```

## Prompt 2 — Database com Prisma

Usar somente depois do Prompt 1 estar aprovado.

```txt
Você é um engenheiro full-stack sênior trabalhando comigo na IA Financeira Coletiva no WhatsApp.

Antes de alterar arquivos, leia:
- docs/00_LEIA_PRIMEIRO_CONTROLE_DO_PROJETO.md
- docs/02_Especificacao_Tecnica_Core_Financeiro_Ledger.md
- docs/04_ARQUITETURA_E_DECISOES_TECNICAS.md
- docs/06_BACKLOG_TECNICO_MVP.md
- docs/07_CONTRATO_DE_QUALIDADE_E_ACEITE.md

Objetivo desta execução:
Implementar o pacote packages/database com Prisma e PostgreSQL, modelando as entidades principais do MVP.

Implemente:
1. Prisma em packages/database.
2. schema.prisma com:
   - User
   - Space
   - SpaceMember
   - Invite
   - Expense
   - ExpenseSplit
   - LedgerEntry
   - Payment
   - PaymentReceipt
   - FileObject
   - AuditLog
   - IdempotencyKey
3. Enums compatíveis com packages/shared.
4. Relações e constraints principais.
5. Seed de desenvolvimento.
6. README do database.
7. Scripts para prisma validate, generate, migrate e seed.
8. .env.example com DATABASE_URL falsa.

Não implemente:
- endpoints API;
- WhatsApp;
- IA;
- Open Finance;
- pagamento automático.

Regras obrigatórias:
- Convite deve salvar tokenHash, não token puro.
- Dinheiro deve ser amountMinor integer.
- Ledger deve ser append-only por regra de aplicação.
- Modelos financeiros devem ter createdAt.
- Operações financeiras devem ter espaço para auditoria/idempotência.
- Não salvar segredo real.

Critério de aceite:
- pnpm typecheck passa.
- pnpm test passa.
- pnpm prisma validate ou script equivalente passa.
- Seed está documentado.

Depois de implementar, corrija erros e liste arquivos criados/alterados.
```

## Prompt 3 — API NestJS base

Usar depois do banco aprovado.

```txt
Você é um engenheiro full-stack sênior trabalhando comigo na IA Financeira Coletiva no WhatsApp.

Leia:
- docs/00_LEIA_PRIMEIRO_CONTROLE_DO_PROJETO.md
- docs/01_PRD_MVP_IA_Financeira_Coletiva.md
- docs/02_Especificacao_Tecnica_Core_Financeiro_Ledger.md
- docs/04_ARQUITETURA_E_DECISOES_TECNICAS.md
- docs/06_BACKLOG_TECNICO_MVP.md
- docs/07_CONTRATO_DE_QUALIDADE_E_ACEITE.md

Objetivo:
Implementar a API NestJS base em apps/api usando packages/core, packages/shared e packages/database.

Implemente:
1. Setup NestJS.
2. Config/env validation.
3. Health endpoint.
4. Prisma service.
5. Modules:
   - users
   - spaces
   - members
   - invites
   - expenses
   - balances
   - payments
   - audit
6. DTOs com validação.
7. Services chamando core financeiro.
8. Endpoints principais de MVP:
   - criar Espaço;
   - listar Espaços;
   - gerar convite;
   - aceitar convite;
   - criar draft de despesa;
   - confirmar despesa;
   - consultar saldos;
   - gerar settlement;
   - preparar pagamento;
   - marcar pagamento;
   - contestar despesa.
9. Testes básicos de services.

Não implemente:
- WhatsApp real;
- IA real;
- Open Finance;
- pagamento automático;
- frontend.

Regras:
- API não pode duplicar regra financeira do core.
- Operações financeiras devem usar idempotência.
- Operações financeiras devem gerar audit log.
- Validar permissões por Espaço.
- Não expor dados privados indevidamente.

Critério de aceite:
- API compila.
- pnpm lint passa.
- pnpm typecheck passa.
- pnpm test passa.
```

## Prompt 4 — Web Next.js mínima

```txt
Objetivo:
Implementar a web leve do MVP em apps/web.

Leia os documentos de controle e PRD.

Implemente:
- setup Next.js;
- tela de convite;
- tela de lista de Espaços;
- tela de detalhe do Espaço;
- despesas;
- saldos;
- fechamento;
- pagamento;
- configuração de chave Pix;
- client de API;
- estados de loading/error/empty.

Não implemente:
- regra financeira no frontend;
- IA;
- WhatsApp;
- Open Finance.

Critério:
- web roda;
- typecheck passa;
- telas usam dados da API ou mocks claramente isolados.
```

## Prompt 5 — WhatsApp sem IA

```txt
Objetivo:
Implementar webhook WhatsApp Cloud API sem IA ainda.

Implemente:
- verificação de webhook;
- recebimento de mensagens;
- normalização;
- identificação por telefone;
- idempotência por message_id;
- serviço de envio;
- respostas determinísticas para:
  - oi
  - ajuda
  - meus espaços
  - saldo

Não implemente IA ainda.

Critério:
- webhook testável;
- não duplica mensagens;
- logs seguros.
```

## Prompt 6 — IA com comandos estruturados

```txt
Objetivo:
Adicionar IA para interpretar mensagens em comandos estruturados.

Leia o fluxo conversacional e contrato de qualidade.

Implemente:
- AI gateway;
- provider abstrato;
- prompt base;
- schemas Zod para intents;
- tool calling ou JSON estruturado;
- intents:
  - create_space
  - create_expense
  - query_balance
  - generate_settlement
  - prepare_payment
  - mark_payment
  - contest_item
- confirmação de operações ambíguas;
- fallback seguro.

Regras:
- IA não altera banco diretamente.
- IA não calcula saldo final.
- IA não executa pagamento.
- Toda ação passa pela API/services.
- Resistir a prompt injection.

Critério:
- testes de parse;
- testes de ambiguidade;
- testes de recusa segura.
```

## Como revisar resposta do Codex

Depois de cada execução, perguntar:

1. Quais arquivos foram alterados?
2. Quais comandos passaram?
3. Quais falharam?
4. Ele implementou algo fora do escopo?
5. Ele usou float para dinheiro?
6. Ele criou placeholder?
7. Ele deixou TODO?
8. Ele pulou teste?
9. Ele misturou IA com core?
10. Ele mudou documentação sem motivo?

## Regra final

Codex deve acelerar o desenvolvimento, não decidir o produto sozinho.

A documentação manda. O Codex executa.
