# Roadmap de Execução no Codex

## Objetivo

Este documento define a ordem exata para construir a IA Financeira Coletiva usando Codex sem gerar bagunça, alucinação ou retrabalho.

O projeto é grande. A regra é construir em blocos.

## Princípio de execução

Cada etapa deve:

1. ter objetivo claro;
2. alterar um conjunto limitado de arquivos;
3. ter critérios de aceite;
4. ter comandos de teste;
5. ser revisada antes da próxima etapa.

Não pedir para o Codex fazer “tudo” de uma vez.

## Fase 0 — Preparação

### Objetivo

Garantir que documentação e estrutura inicial estejam disponíveis.

### Entradas

- PDF original do escopo;
- PRD MVP;
- especificação técnica do core;
- fluxo conversacional;
- documentos de controle.

### Saída esperada

Pasta do projeto com:

```txt
docs/
  00_LEIA_PRIMEIRO_CONTROLE_DO_PROJETO.md
  01_PRD_MVP_IA_Financeira_Coletiva.md
  02_Especificacao_Tecnica_Core_Financeiro_Ledger.md
  03_Fluxo_Conversacional_IA_WhatsApp.md
  04_ARQUITETURA_E_DECISOES_TECNICAS.md
  05_ROADMAP_DE_EXECUCAO_NO_CODEX.md
  06_BACKLOG_TECNICO_MVP.md
  07_CONTRATO_DE_QUALIDADE_E_ACEITE.md
  08_PROTOCOLO_DE_PROMPTS_PARA_CODEX.md
```

## Fase 1 — Monorepo + Core financeiro

### Objetivo

Criar base do projeto e motor financeiro puro.

### O que implementar

- pnpm workspace;
- TypeScript;
- ESLint;
- Prettier;
- Vitest;
- packages/shared;
- packages/core;
- testes de dinheiro, rateio, ledger, saldos e simplificação.

### Não implementar ainda

- banco;
- API;
- web;
- WhatsApp;
- IA;
- Pix real.

### Critério de aceite

Comandos devem passar:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

## Fase 2 — Database com Prisma

### Objetivo

Criar modelo persistente do MVP.

### O que implementar

- packages/database;
- Prisma schema;
- models:
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
  - IdempotencyKey;
- migrations;
- seed básico;
- README do banco.

### Não implementar ainda

- endpoints;
- WhatsApp;
- IA.

### Critério de aceite

- `prisma validate` passa;
- migration gera sem erro;
- seed cria dados de exemplo;
- constraints básicas existem.

## Fase 3 — API base NestJS

### Objetivo

Criar backend HTTP com módulos principais.

### O que implementar

Módulos:

- health;
- users;
- spaces;
- members;
- invites;
- expenses;
- balances;
- payments;
- audit.

Endpoints mínimos:

- criar Espaço;
- listar Espaços do usuário;
- aceitar convite;
- registrar despesa por payload estruturado;
- confirmar despesa;
- consultar saldo;
- gerar fechamento;
- preparar pagamento;
- marcar pagamento;
- contestar despesa.

### Não implementar ainda

- IA interpretando mensagem;
- WhatsApp real;
- Open Finance.

### Critério de aceite

- API sobe;
- Swagger/OpenAPI, se configurado;
- testes básicos de service;
- endpoints principais funcionam com dados mock/dev.

## Fase 4 — Web leve Next.js

### Objetivo

Criar interface mínima para apoiar WhatsApp.

### Telas

- convite;
- login simples/dev;
- lista de Espaços;
- detalhe do Espaço;
- membros;
- despesas;
- saldos;
- fechamento;
- pagamento;
- configuração de chave Pix.

### Critério de aceite

- web roda;
- conecta na API;
- fluxo básico visível;
- sem regra financeira duplicada no frontend.

## Fase 5 — WhatsApp Cloud API

### Objetivo

Conectar recebimento e envio de mensagens.

### O que implementar

- webhook verification;
- receive message;
- normalize message;
- identify user by phone;
- send text response;
- logs de webhook;
- retries básicos;
- idempotência por message_id.

### Ainda sem IA

Nesta fase, pode responder comandos simples determinísticos:

- “oi”;
- “ajuda”;
- “meus espaços”;
- “saldo”.

### Critério de aceite

- recebe webhook;
- responde mensagem;
- não duplica processamento.

## Fase 6 — IA com tool calling

### Objetivo

Adicionar interpretação por IA com comandos estruturados.

### O que implementar

- ai gateway;
- provider;
- schemas;
- prompt base;
- tool definitions;
- parse de intenção;
- validação de confiança;
- fluxo de confirmação;
- fallback quando IA falha.

### Regras

A IA não altera banco diretamente.  
A IA não calcula saldo final.  
A IA retorna comando.  
API valida e executa.

### Critério de aceite

Mensagens como estas funcionam:

- “Cria uma viagem pra Floripa com Ana e Bruno.”
- “Paguei R$ 480 no Airbnb pra todo mundo.”
- “Quanto eu devo?”
- “Fecha a viagem.”
- “Gera o Pix.”
- “Paguei a Ana.”
- “Eu não participei desse mercado.”

## Fase 7 — Pix manual

### Objetivo

Preparar pagamentos sem movimentar dinheiro.

### O que implementar

- cadastro de chave Pix;
- geração de payload Pix, se viável;
- QR Code;
- instrução de pagamento;
- status do pagamento;
- comprovante;
- confirmação pelo recebedor.

### Critério de aceite

- pagamento preparado;
- usuário entende que precisa pagar no banco;
- sistema não promete liquidação automática.

## Fase 8 — Arquivos e comprovantes

### Objetivo

Permitir envio e gestão de comprovantes/recibos.

### O que implementar

- upload;
- storage;
- metadados;
- vínculo com pagamento/despesa;
- URL temporária;
- validação de MIME;
- limite de tamanho.

### Critério de aceite

- comprovante anexado;
- pagamento pode ser revisado;
- arquivo não fica público.

## Fase 9 — Qualidade, segurança e observabilidade

### Objetivo

Deixar MVP privado seguro para testes reais.

### O que implementar

- logs estruturados;
- request_id;
- rate limit;
- validação de permissões;
- auditoria visível;
- erros amigáveis;
- mascaramento de dados;
- `.env.example`;
- guia de deploy.

## Fase 10 — MVP privado

### Objetivo

Rodar com usuários reais controlados.

### Escopo

- amigos;
- viagens pequenas;
- casas compartilhadas;
- grupos de até 8 pessoas inicialmente.

### Medir

- Espaços criados;
- convites aceitos;
- primeira despesa em 24h;
- despesas por Espaço;
- pagamentos marcados;
- tempo até fechamento;
- erros de IA;
- contestações;
- feedback qualitativo.

## O que deixar para depois

- Open Finance leitura;
- iniciação Pix;
- Groups API;
- OCR avançado;
- áudio avançado;
- multimoeda;
- app mobile;
- assinatura real;
- billing;
- parcerias fintech.

## Regra de ouro

Não avance para a próxima fase enquanto a fase atual não estiver testada e entendida.
