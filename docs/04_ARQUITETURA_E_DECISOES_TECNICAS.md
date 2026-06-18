# Arquitetura e Decisões Técnicas

## 1. Objetivo

Este documento define a arquitetura técnica da IA Financeira Coletiva no WhatsApp.

A intenção é manter o projeto organizado, escalável e seguro desde o início, sem complicar o MVP desnecessariamente.

## 2. Decisão principal

Usar TypeScript como linguagem principal.

Motivos:

- uma linguagem para backend, frontend, workers e pacotes compartilhados;
- boa integração com APIs, IA, WhatsApp e web;
- tipagem forte para regras financeiras;
- ecossistema maduro;
- produtividade alta para MVP;
- facilidade para o Codex gerar e manter código;
- boa compatibilidade com Prisma, NestJS, Next.js, Zod e Vitest.

## 3. Arquitetura de alto nível

Fluxo principal:

1. Usuário envia mensagem no WhatsApp.
2. WhatsApp Cloud API envia webhook para o backend.
3. Backend identifica usuário e contexto.
4. Orquestrador decide se precisa chamar IA.
5. IA interpreta a mensagem e retorna comando estruturado.
6. Backend valida o comando.
7. Core financeiro calcula e gera resultado.
8. Banco registra entidades, ledger e auditoria.
9. Backend responde ao usuário pelo WhatsApp.
10. Web mostra histórico, saldos, convites e fechamento.

## 4. Regra de separação

O sistema deve ser separado em camadas.

### 4.1 Core financeiro

Local: `packages/core`

Responsabilidade:

- dinheiro;
- rateio;
- ledger;
- saldos;
- simplificação de dívidas;
- aplicação de pagamentos;
- regras determinísticas.

Não pode depender de:

- NestJS;
- Next.js;
- Prisma;
- banco;
- WhatsApp;
- IA;
- Redis;
- HTTP.

### 4.2 Shared

Local: `packages/shared`

Responsabilidade:

- tipos;
- enums;
- schemas Zod;
- DTOs compartilhados;
- utilitários comuns sem dependência de infraestrutura.

### 4.3 Database

Local: `packages/database`

Responsabilidade:

- Prisma schema;
- migrations;
- Prisma client;
- seed de desenvolvimento;
- helpers de banco.

Não deve conter regra financeira complexa. O banco persiste o que o core/API calculam.

### 4.4 API

Local: `apps/api`

Responsabilidade:

- autenticação;
- autorização;
- endpoints HTTP;
- webhooks;
- serviços de aplicação;
- integração com WhatsApp;
- integração com IA;
- integração com storage;
- chamadas ao database;
- orquestração.

A API pode chamar o core, mas não deve duplicar regra financeira.

### 4.5 Web

Local: `apps/web`

Responsabilidade:

- aceitar convite;
- visualizar Espaço;
- visualizar despesas;
- visualizar saldos;
- revisar fechamento;
- configurar chave Pix;
- anexar comprovante.

A web não deve conter regra financeira própria. Ela consome a API.

### 4.6 Worker

Local futuro: `apps/worker`

Responsabilidade:

- jobs assíncronos;
- OCR;
- áudio;
- notificações;
- relatórios;
- conciliação futura.

## 5. Estrutura recomendada do monorepo

```txt
.
├── apps/
│   ├── api/
│   ├── web/
│   └── worker/
├── packages/
│   ├── core/
│   ├── shared/
│   └── database/
├── docs/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .env.example
├── .gitignore
└── README.md
```

## 6. Banco de dados

Banco recomendado: PostgreSQL.

Motivos:

- confiável;
- relacional;
- transacional;
- ótimo para auditoria;
- ótimo para constraints;
- suporta JSONB para metadados;
- compatível com Prisma;
- maduro para produto financeiro.

## 7. ORM

ORM recomendado: Prisma.

Motivos:

- bom com TypeScript;
- schema claro;
- migrations;
- client tipado;
- facilita início do projeto.

## 8. Filas

Para MVP:

- Redis + BullMQ.

Usos:

- enviar mensagens WhatsApp;
- processar comprovantes;
- gerar relatórios;
- executar jobs futuros;
- controlar retries.

Em escala futura, pode migrar para:

- RabbitMQ;
- SQS;
- Pub/Sub;
- Kafka.

## 9. IA

A IA deve ficar atrás de uma camada abstrata.

Recomendação:

```txt
apps/api/src/modules/ai/
  ai.gateway.ts
  ai.types.ts
  providers/
    openai.provider.ts
    gemini.provider.ts
```

O sistema não deve espalhar chamadas diretas para fornecedor de IA no código inteiro.

## 10. Tool calling

A IA não deve alterar banco diretamente.

Ela deve retornar comandos estruturados como:

- create_space_draft;
- create_expense_draft;
- query_balance;
- prepare_payment;
- contest_expense;
- update_split_rule.

A API valida e executa.

## 11. WhatsApp

Usar WhatsApp Cloud API.

MVP:

- conversas privadas conectadas ao mesmo Espaço;
- webhook para receber mensagens;
- endpoint/serviço para enviar respostas;
- templates apenas quando necessário;
- sem depender de grupos nativos.

Groups API fica fora do MVP inicial.

## 12. Pix

MVP:

- Pix Copia e Cola;
- QR Code;
- status manual;
- comprovante;
- confirmação pelo recebedor.

Futuro:

- parceiro regulado;
- iniciação Pix via Open Finance;
- webhooks de liquidação;
- estados reais de processamento.

## 13. Open Finance

Fora do MVP.

Futuro:

- somente leitura primeiro;
- consentimento individual;
- sugestão privada de transações;
- conciliação assistida;
- nunca compartilhar extrato completo com grupo.

## 14. Segurança

Obrigatório:

- validação de entrada;
- autenticação;
- autorização por Espaço;
- logs de auditoria;
- idempotência em operações financeiras;
- proteção contra duplicidade;
- mascaramento de dados sensíveis;
- não salvar segredos no código;
- `.env.example` sem valores reais.

## 15. Idempotência

Toda operação financeira deve ter idempotência.

Exemplos:

- criar despesa;
- confirmar despesa;
- preparar pagamento;
- marcar pagamento;
- confirmar pagamento;
- aceitar convite.

Persistir chaves de idempotência no banco, não apenas em Redis.

## 16. Observabilidade

Desde cedo, registrar:

- request_id;
- webhook_id;
- user_id;
- space_id;
- action;
- success/failure;
- erro;
- duração;
- provider externo usado.

Não registrar:

- senha;
- token;
- CVV;
- código bancário;
- segredos;
- conteúdo sensível sem necessidade.

## 17. Testes

Prioridade dos testes:

1. Core financeiro.
2. Database constraints.
3. API services.
4. Webhooks.
5. Fluxos de conversa.
6. Web.

## 18. Decisões arquiteturais aprovadas

### ADR-001 — TypeScript como linguagem principal

Aprovado.

### ADR-002 — Core financeiro puro

Aprovado.

### ADR-003 — PostgreSQL como banco principal

Aprovado.

### ADR-004 — Prisma como ORM inicial

Aprovado.

### ADR-005 — WhatsApp privado no MVP

Aprovado.

### ADR-006 — Sem Open Finance no MVP

Aprovado.

### ADR-007 — Sem pagamento automático no MVP

Aprovado.

### ADR-008 — Web leve como apoio

Aprovado.

### ADR-009 — IA com tool calling e schemas rígidos

Aprovado.

## 19. Decisões ainda abertas

Essas decisões podem ser fechadas depois:

- fornecedor principal de IA;
- provedor de storage;
- plataforma de deploy;
- provedor de WhatsApp caso use intermediário;
- biblioteca exata de QR Code Pix;
- estratégia de autenticação web;
- estratégia de multi-tenant futura;
- design system da interface web.

## 20. Arquitetura de MVP em uma frase

O MVP é um sistema TypeScript com core financeiro puro, API NestJS, banco PostgreSQL, web Next.js e WhatsApp Cloud API, onde a IA apenas interpreta mensagens e o backend executa regras financeiras determinísticas.
