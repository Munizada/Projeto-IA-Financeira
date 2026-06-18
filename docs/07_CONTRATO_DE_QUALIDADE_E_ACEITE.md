# Contrato de Qualidade e Aceite

## Objetivo

Este documento define o padrão mínimo de qualidade para qualquer código gerado no projeto.

Nada deve ser considerado pronto apenas porque “parece funcionar”.

## Regra geral

Código aceito precisa ser:

- funcional;
- tipado;
- testado;
- coerente com documentação;
- sem placeholders essenciais;
- seguro para dados financeiros;
- organizado;
- legível;
- fácil de continuar.

## Critérios globais

Antes de concluir qualquer etapa, verificar:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Se algum comando falhar, a entrega não está pronta.

## Dinheiro

Obrigatório:

- usar `amountMinor`;
- usar integer;
- validar moeda;
- validar centavos;
- não usar float;
- testar arredondamento;
- garantir soma final.

Não aceito:

```ts
const value = 10.5;
```

Aceito:

```ts
const amountMinor = 1050;
```

## Core financeiro

O core só é aceito se:

- não importar NestJS;
- não importar Prisma;
- não importar WhatsApp;
- não chamar IA;
- não acessar banco;
- não depender de variáveis de ambiente;
- tiver testes;
- for determinístico.

## Banco

O banco só é aceito se:

- tiver migrations;
- tiver schema validado;
- tiver relações corretas;
- tiver constraints;
- preservar auditoria;
- não salvar tokens sensíveis em texto puro;
- convite salvar hash, não token puro.

## API

A API só é aceita se:

- validar DTOs;
- validar permissões;
- tratar erros;
- não duplicar regra financeira do core;
- gerar audit log para operação financeira;
- usar idempotência onde necessário;
- não expor stack trace para usuário final.

## Web

A web só é aceita se:

- não calcular regra financeira crítica;
- consumir API;
- mostrar dados com clareza;
- não expor dados privados;
- tratar loading/error/empty states básicos;
- ser simples e funcional.

## WhatsApp

O WhatsApp só é aceito se:

- webhook tiver verificação;
- mensagens duplicadas não duplicarem operação;
- usuário for identificado por número normalizado;
- erros não registrarem despesa acidentalmente;
- resposta financeira for clara.

## IA

A IA só é aceita se:

- usar prompt controlado;
- retornar JSON/schema;
- passar por validação;
- não alterar banco diretamente;
- não calcular saldo final sozinha;
- pedir confirmação quando necessário;
- recusar ações perigosas;
- não obedecer prompt injection.

## Pix

Pix manual só é aceito se:

- deixar claro que o usuário paga no banco;
- mostrar valor;
- mostrar recebedor;
- mostrar Espaço;
- não dizer que pagou automaticamente;
- permitir comprovante;
- permitir confirmação pelo recebedor.

## Auditoria

Toda operação financeira precisa registrar:

- ator;
- ação;
- objeto;
- antes/depois quando aplicável;
- horário;
- origem;
- request_id ou equivalente.

## Idempotência

Obrigatória para:

- criar despesa;
- confirmar despesa;
- preparar pagamento;
- marcar pagamento;
- aceitar convite;
- processar webhook;
- confirmar pagamento.

## Segurança

Não aceitar código que:

- loga segredo;
- salva senha bancária;
- pede CVV;
- pede token;
- expõe dados privados;
- usa token de convite puro salvo no banco;
- ignora autorização por Espaço.

## Testes mínimos por etapa

### Core

- money;
- splits;
- ledger;
- balances;
- simplify debts;
- payment application;
- errors.

### Database

- relations;
- constraints;
- enums;
- seed.

### API

- services;
- permissions;
- validation;
- idempotency;
- financial flows.

### IA

- parse correto;
- baixa confiança;
- ambiguidade;
- prompt injection;
- recusa segura.

### WhatsApp

- duplicate message;
- unknown user;
- help;
- create expense flow;
- confirmation flow.

## Revisão manual obrigatória

Depois de cada execução do Codex, revisar:

1. Ele criou arquivo demais?
2. Ele inventou escopo?
3. Ele duplicou regra financeira?
4. Ele usou float?
5. Ele deixou TODO?
6. Ele quebrou documentação?
7. Ele removeu algo importante?
8. Ele misturou IA com core?
9. Ele salvou segredo?
10. Os testes cobrem os casos importantes?

## Checklist de aceite rápido

Uma entrega está pronta quando:

- [ ] comandos passam;
- [ ] código essencial não tem TODO;
- [ ] não tem placeholder crítico;
- [ ] dinheiro usa integer;
- [ ] core está isolado;
- [ ] testes principais existem;
- [ ] README foi atualizado;
- [ ] não houve escopo fora do MVP;
- [ ] erros são tratados;
- [ ] documentação continua coerente.

## Regra final

Se a entrega parecer “grande demais e mágica demais”, provavelmente está errada.

O projeto deve evoluir por camadas sólidas.
