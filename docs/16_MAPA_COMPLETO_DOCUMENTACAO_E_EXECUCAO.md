# Mapa Completo — Documentação e Execução

## 1. Objetivo

Este documento mostra tudo que precisa existir para o projeto ficar bem guiado antes do Codex implementar.

## 2. Checklist da lista original

## 2.1 Transformar em PRD completo

Status: feito.

Arquivo:

- `01_PRD_MVP_IA_Financeira_Coletiva.md`

Conteúdo:

- visão;
- problema;
- público;
- MVP;
- escopo;
- requisitos;
- métricas;
- regras;
- roadmap.

## 2.2 Quebrar o MVP em tarefas para Codex/dev

Status: feito.

Arquivos:

- `05_ROADMAP_DE_EXECUCAO_NO_CODEX.md`
- `06_BACKLOG_TECNICO_MVP.md`
- `08_PROTOCOLO_DE_PROMPTS_PARA_CODEX.md`
- `14_ROADMAP_TECNICO_EXECUTAVEL_SPRINTS.md`

## 2.3 Montar modelo de banco PostgreSQL

Status: feito.

Arquivos:

- `09_MODELO_BANCO_POSTGRESQL_PRISMA.md`
- `02_Especificacao_Tecnica_Core_Financeiro_Ledger.md`

## 2.4 Desenhar fluxo conversacional da IA no WhatsApp

Status: feito.

Arquivo:

- `03_Fluxo_Conversacional_IA_WhatsApp.md`

## 2.5 Criar prompt/system prompt da IA financeira

Status: feito.

Arquivo:

- `10_SYSTEM_PROMPT_E_TOOLS_IA_FINANCEIRA.md`

## 2.6 Montar motor de rateio e ledger

Status: feito.

Arquivos:

- `02_Especificacao_Tecnica_Core_Financeiro_Ledger.md`
- `15_MOTOR_RATEIO_LEDGER_ESPEC_IMPLEMENTACAO.md`

## 2.7 Definir telas web mínimas

Status: feito.

Arquivos:

- `11_TELAS_WEB_MINIMAS_E_UX_MVP.md`
- `01_PRD_MVP_IA_Financeira_Coletiva.md`

## 2.8 Montar pitch, landing page, nome, copy e plano de validação

Status: feito.

Arquivo:

- `12_PITCH_NOME_LANDING_COPY_VALIDACAO.md`

## 2.9 Revisar segurança, LGPD, fraude e riscos regulatórios

Status: feito em nível inicial.

Arquivo:

- `13_SEGURANCA_LGPD_FRAUDE_REGULATORIO.md`

Observação:

- precisa de revisão jurídica antes de beta público ou qualquer integração financeira real.

## 2.10 Transformar tudo em roadmap técnico executável

Status: feito.

Arquivo:

- `14_ROADMAP_TECNICO_EXECUTAVEL_SPRINTS.md`

---

## 3. Ordem final dos documentos

Colocar tudo em `/docs`:

```txt
00_LEIA_PRIMEIRO_CONTROLE_DO_PROJETO.md
01_PRD_MVP_IA_Financeira_Coletiva.md
02_Especificacao_Tecnica_Core_Financeiro_Ledger.md
03_Fluxo_Conversacional_IA_WhatsApp.md
04_ARQUITETURA_E_DECISOES_TECNICAS.md
05_ROADMAP_DE_EXECUCAO_NO_CODEX.md
06_BACKLOG_TECNICO_MVP.md
07_CONTRATO_DE_QUALIDADE_E_ACEITE.md
08_PROTOCOLO_DE_PROMPTS_PARA_CODEX.md
09_MODELO_BANCO_POSTGRESQL_PRISMA.md
10_SYSTEM_PROMPT_E_TOOLS_IA_FINANCEIRA.md
11_TELAS_WEB_MINIMAS_E_UX_MVP.md
12_PITCH_NOME_LANDING_COPY_VALIDACAO.md
13_SEGURANCA_LGPD_FRAUDE_REGULATORIO.md
14_ROADMAP_TECNICO_EXECUTAVEL_SPRINTS.md
15_MOTOR_RATEIO_LEDGER_ESPEC_IMPLEMENTACAO.md
16_MAPA_COMPLETO_DOCUMENTACAO_E_EXECUCAO.md
escopo-ia-financeira-whatsapp.pdf
```

---

## 4. Como orientar o Codex

Sempre começar prompts com:

```txt
Antes de alterar arquivos, leia:
- docs/00_LEIA_PRIMEIRO_CONTROLE_DO_PROJETO.md
- docs/07_CONTRATO_DE_QUALIDADE_E_ACEITE.md
- docs/08_PROTOCOLO_DE_PROMPTS_PARA_CODEX.md
- e os documentos específicos da etapa.
```

## 5. Documentos por fase

## Fase Core

Ler:

- 00;
- 02;
- 04;
- 07;
- 15.

## Fase Banco

Ler:

- 00;
- 02;
- 04;
- 07;
- 09.

## Fase API

Ler:

- 00;
- 01;
- 02;
- 04;
- 06;
- 07;
- 09;
- 15.

## Fase Web

Ler:

- 00;
- 01;
- 07;
- 11.

## Fase WhatsApp

Ler:

- 00;
- 03;
- 04;
- 07;
- 10.

## Fase IA

Ler:

- 00;
- 03;
- 07;
- 10.

## Fase Validação

Ler:

- 01;
- 12;
- 14.

## Fase Segurança

Ler:

- 00;
- 07;
- 13.

---

## 6. O que ainda pode ser feito depois

Antes de beta público:

- termos de uso completo;
- política de privacidade;
- tela real de consentimentos;
- revisão jurídica;
- modelagem de custos;
- plano de suporte;
- guia de deploy;
- playbook de incidentes;
- matriz RACI;
- plano de analytics;
- design system mais bonito;
- documentação de API;
- testes E2E.

## 7. Próximo passo recomendado

Agora o projeto está documentado o suficiente para começar implementação controlada.

Próxima ação:

1. colocar todos os documentos em `/docs`;
2. abrir projeto no Codex;
3. mandar Prompt 1 do `08_PROTOCOLO_DE_PROMPTS_PARA_CODEX.md`;
4. revisar resultado;
5. só então avançar para banco.
