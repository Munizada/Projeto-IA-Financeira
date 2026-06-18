# PRD — MVP da IA Financeira Coletiva no WhatsApp

**Produto:** IA financeira coletiva para despesas compartilhadas  
**Versão:** 1.0  
**Status:** Documento de produto para orientar desenvolvimento do MVP privado  
**Canal principal:** WhatsApp  
**Interface de apoio:** Web leve  
**Mercado inicial:** Brasil  
**Fonte-base:** PDF “Estratégia de Produto — IA financeira coletiva no WhatsApp”, versão revisada de 18 de junho de 2026.

---

## 1. Visão do produto

A IA Financeira Coletiva é um produto para grupos que dividem despesas no dia a dia, principalmente por WhatsApp. O usuário manda o gasto em linguagem natural, a IA entende o contexto, o sistema calcula a divisão, registra o histórico financeiro do grupo e facilita a quitação por Pix.

A proposta central é:

> **Mande o gasto. A IA divide. O Pix quita.**

O produto não deve nascer como “mais um app de rateio”. Ele deve nascer como uma camada financeira conversacional para grupos que já existem no WhatsApp: viagens, apartamentos, repúblicas, casais, churrascos, restaurantes, eventos pequenos e combinações recorrentes entre pessoas.

O objetivo do MVP é validar se grupos realmente aceitam registrar, acompanhar e quitar despesas compartilhadas conversando com uma IA, sem precisar instalar um aplicativo para todos os participantes.

---

## 2. Decisão estratégica do MVP

A decisão recomendada é construir primeiro um produto orientado ao WhatsApp, sem aplicativo próprio no início.

A interface web existirá apenas como apoio para ações que exigem mais clareza visual ou segurança, como:

- aceitar convite;
- revisar membros do Espaço;
- ver histórico;
- ver saldos;
- configurar regras básicas;
- anexar ou visualizar comprovantes;
- revisar fechamento.

O WhatsApp será o canal principal para:

- criar Espaços;
- registrar despesas;
- perguntar saldos;
- receber notificações;
- confirmar lançamentos;
- gerar Pix Copia e Cola;
- acompanhar pagamentos.

O MVP não deve depender da API de grupos do WhatsApp. A experiência inicial será baseada em conversas privadas conectadas ao mesmo Espaço Compartilhado.

---

## 3. Definição do produto

### 3.1 Nome conceitual

O nome interno pode ser “IA Financeira Coletiva”, mas para o usuário a entidade principal deve ser chamada de:

- **Espaço Compartilhado**;
- **Conta Compartilhada**;
- **Grupo de Despesas**.

Recomendação de produto: usar **Espaço** como termo principal.

Exemplos:

- “Viagem Floripa 2027”;
- “Apartamento Pinheiros”;
- “Casa Ana + Bruno”;
- “Churrasco do Léo”;
- “Restaurante Sexta”.

O termo “token” deve ficar apenas no nível técnico, ligado a convite, autenticação e identificação segura.

---

## 4. Problema que o produto resolve

Dividir despesas em grupo é um problema simples na teoria, mas chato na prática.

As dores principais são:

1. **Fricção de entrada:** ninguém quer instalar mais um app só para uma viagem ou churrasco.
2. **Bagunça de mensagens:** os gastos ficam espalhados no grupo do WhatsApp.
3. **Cobrança constrangedora:** cobrar amigo, parceiro ou colega de casa gera desconforto.
4. **Falta de memória:** depois de alguns dias, ninguém lembra quem pagou o quê.
5. **Erro de cálculo:** planilhas e contas manuais geram confusão.
6. **Fechamento demorado:** todo mundo sabe que tem algo a pagar, mas ninguém fecha.
7. **Pagamento separado do cálculo:** apps de rateio mostram saldo, mas o Pix acontece fora.

O produto resolve isso transformando mensagens simples em registros financeiros estruturados, auditáveis e fáceis de quitar.

---

## 5. Público-alvo inicial

### 5.1 Segmento primário do MVP

O primeiro segmento recomendado é:

## Viagens com amigos

Motivos:

- alta dor de rateio;
- vários gastos em poucos dias;
- viralidade natural;
- grupo temporário com começo, meio e fim;
- clareza de ativação;
- fechamento evidente;
- facilidade de demonstrar valor.

Exemplo de uso:

> “Criei a viagem Floripa 2027. Paguei R$ 480 no Airbnb para eu, Ana, Bia e Caio.”

A IA entende o contexto, calcula a divisão e mostra o saldo de cada pessoa.

### 5.2 Segmento secundário

## Apartamentos, repúblicas e casas compartilhadas

Motivos:

- despesas recorrentes;
- maior retenção;
- potencial de assinatura futura;
- dor mensal clara;
- facilidade de cobrar aluguel, luz, internet, mercado e faxina.

Exemplo:

> “Paguei R$ 220 de luz. Divide por dois comigo e Bruno.”

### 5.3 Segmentos futuros

- casais;
- churrascos;
- restaurantes;
- eventos pequenos;
- pequenas viagens internacionais;
- grupos recorrentes de amigos;
- times informais.

---

## 6. Objetivo do MVP

O objetivo do MVP é provar três hipóteses centrais:

### Hipótese 1 — Registro

As pessoas aceitam registrar gastos de grupo mandando mensagens para uma IA no WhatsApp.

### Hipótese 2 — Confiança

As pessoas confiam no sistema se ele confirma valores, participantes e impacto no saldo antes de registrar operações ambíguas.

### Hipótese 3 — Quitação

As pessoas usam o saldo calculado pelo sistema para efetivamente pagar ou cobrar via Pix Copia e Cola/QR Code.

---

## 7. North Star Metric

A métrica principal do produto deve ser:

> **Valor das despesas coletivas registradas e efetivamente quitadas por Espaço ativo.**

Essa métrica evita otimizar só por número de mensagens, cadastros ou curiosidade. O produto só entrega valor real quando uma despesa coletiva vira saldo confiável e depois vira pagamento quitado.

---

## 8. Métricas do MVP

### 8.1 Aquisição

- Custo por criador de Espaço.
- Origem dos criadores.
- Percentual de criadores vindos por convite de outro Espaço.
- Número de Espaços criados por usuário.

### 8.2 Ativação

- Espaços com pelo menos 2 membros.
- Espaços com primeira despesa registrada em até 24 horas.
- Tempo entre criação do Espaço e primeiro gasto.
- Percentual de convites aceitos.

### 8.3 Engajamento

- Despesas por Espaço.
- Mensagens úteis por Espaço.
- Consultas de saldo por membro.
- Membros ativos por Espaço.
- Taxa de retorno durante o ciclo da viagem/evento.

### 8.4 Valor financeiro

- Valor total registrado por Espaço.
- Valor médio por despesa.
- Percentual de rateios confirmados.
- Percentual de despesas contestadas.
- Percentual de saldos simplificados com sucesso.

### 8.5 Liquidação

- Percentual de dívidas marcadas como pagas.
- Tempo médio até pagamento.
- Pagamentos com comprovante.
- Pagamentos contestados.
- Pix Copia e Cola gerados.

### 8.6 Qualidade da IA

- Taxa de entendimento sem correção.
- Taxa de confirmação.
- Taxa de ambiguidade.
- Taxa de comando recusado por segurança.
- Taxa de intervenção humana, se existir.

### 8.7 Risco

- Lançamentos corrigidos.
- Pagamentos duplicados.
- Convites indevidos.
- Incidentes de privacidade.
- Contestações por erro de cálculo.

---

## 9. Personas principais

## 9.1 Organizador

Pessoa que cria o Espaço e convida os outros.

### Exemplos

- amigo que organiza viagem;
- morador que controla contas da casa;
- pessoa que pagou reserva;
- casal que quer dividir despesas;
- anfitrião de churrasco.

### Necessidades

- criar grupo rápido;
- convidar pessoas sem atrito;
- registrar gastos;
- ver quem deve para quem;
- fechar o saldo;
- evitar cobrança chata;
- não virar “contador” do grupo.

### Permissões

- criar Espaço;
- convidar membros;
- remover membros antes de gastos relevantes;
- configurar regra padrão;
- encerrar Espaço;
- gerar fechamento;
- visualizar ledger do Espaço;
- registrar despesas.

### Limites

O organizador nunca pode movimentar dinheiro de outro participante. Ele pode preparar cobranças, mas cada pessoa autoriza seu próprio pagamento.

---

## 9.2 Membro

Pessoa convidada para participar de um Espaço.

### Necessidades

- entrar sem instalar app;
- entender quanto deve;
- contestar se algo estiver errado;
- pagar com Pix;
- ver histórico mínimo;
- manter dados bancários privados;
- não receber exposição constrangedora no grupo.

### Permissões

- aceitar convite;
- registrar despesas;
- consultar saldo;
- ver despesas que o afetam;
- contestar lançamento;
- marcar pagamento;
- anexar comprovante;
- configurar chave Pix própria.

---

## 9.3 Tesoureiro

Papel opcional futuro para grupos mais recorrentes.

### Necessidades

- revisar despesas;
- aprovar lançamentos;
- administrar orçamento;
- fazer fechamento;
- acompanhar recorrências.

### Status no MVP

Não obrigatório no primeiro MVP. Pode ser previsto no modelo de dados, mas não precisa aparecer na interface inicial.

---

## 10. Princípios de produto

## 10.1 Baixa fricção

O usuário não deve precisar baixar app. O fluxo inicial deve funcionar com WhatsApp e uma página web simples.

## 10.2 Confiança acima de velocidade

O sistema deve confirmar operações ambíguas antes de registrar. É melhor perguntar de novo do que errar dinheiro.

## 10.3 IA interpreta, backend calcula

A IA nunca deve ser a fonte de verdade para saldos. Ela apenas transforma linguagem natural em comandos estruturados. O motor financeiro calcula e registra.

## 10.4 Privacidade individual

O grupo só vê o que é necessário para o rateio. Extrato bancário, dados de conta, conexões Open Finance e informações privadas não são compartilhados automaticamente.

## 10.5 Sem pagamento autônomo

No MVP, o sistema não movimenta dinheiro. Ele gera Pix Copia e Cola/QR Code ou registra comprovante. No futuro, iniciação de Pix só deve ocorrer com autorização explícita no banco ou parceiro regulado.

## 10.6 Tom neutro

A IA não deve constranger pessoas com cobranças agressivas. O tom deve ser respeitoso, objetivo e leve.

## 10.7 Rastreabilidade

Todo lançamento financeiro precisa ter origem, autor, horário, versão e histórico.

---

## 11. Escopo do MVP

## 11.1 Incluído no MVP P0

### Cadastro e identidade

- cadastro pelo número do WhatsApp;
- nome do usuário;
- aceite de termos;
- consentimento LGPD;
- idioma padrão;
- status ativo/inativo.

### Espaços

- criar Espaço;
- nomear Espaço;
- definir tipo: viagem, casa, casal, evento ou outro;
- definir moeda inicial, começando por BRL;
- definir regra padrão de divisão;
- encerrar Espaço.

### Convites

- gerar convite individual;
- convite com validade;
- convite de uso único;
- confirmação por número de WhatsApp;
- revogação de convite;
- aceite via link web leve.

### Membros

- adicionar membros;
- aceitar entrada;
- remover membro antes de fechamento;
- definir apelido;
- definir papel básico: organizador ou membro.

### Registro de despesas

- registrar despesa por texto;
- registrar pagador;
- registrar valor;
- registrar data;
- registrar descrição;
- registrar categoria básica;
- selecionar participantes afetados;
- aplicar divisão igual;
- aplicar divisão percentual;
- aplicar divisão por cotas;
- aplicar divisão por valor individual;
- anexar comprovante manualmente.

### Confirmação

- confirmar despesas ambíguas;
- exibir resumo antes do registro;
- pedir informação faltante;
- permitir cancelar antes de registrar;
- permitir corrigir antes de registrar.

### Ledger e saldos

- criar eventos financeiros imutáveis;
- calcular saldos por membro;
- simplificar dívidas;
- mostrar quem deve para quem;
- mostrar total pago por cada membro;
- mostrar total consumido por cada membro;
- mostrar histórico de despesas.

### Pagamentos

- gerar Pix Copia e Cola com valor;
- gerar QR Code Pix, se viável;
- permitir marcar como pago;
- anexar comprovante;
- permitir contestação;
- status: pendente, marcado como pago, comprovante enviado, confirmado, contestado, cancelado.

### Notificações

- notificar membro afetado por nova despesa;
- notificar saldo atualizado;
- notificar fechamento;
- notificar pagamento marcado;
- notificar contestação.

### Interface web leve

- aceitar convite;
- ver Espaço;
- ver membros;
- ver despesas;
- ver saldos;
- ver pagamentos;
- revisar fechamento;
- configurar chave Pix;
- baixar relatório simples.

---

## 11.2 Incluído no MVP P1

Esses itens são desejáveis, mas podem vir depois do P0 se atrasarem o lançamento:

- áudio para registrar despesas;
- OCR básico de recibos;
- recorrências simples;
- importação manual de dados de concorrentes;
- categorias personalizadas;
- relatórios em PDF;
- lembretes automáticos de fechamento;
- link público de convite com aprovação manual;
- exportação CSV;
- histórico avançado de auditoria na interface.

---

## 11.3 Fora do MVP

- conta digital;
- custódia de saldo;
- cartão compartilhado;
- pagamento totalmente autônomo;
- iniciação Pix direta sem parceiro regulado;
- Open Finance completo;
- conexão bancária obrigatória;
- marketplace financeiro;
- investimentos;
- grupos corporativos complexos;
- contabilidade empresarial;
- split fiscal;
- cobrança judicial;
- score de crédito;
- limite de crédito;
- empréstimos;
- antecipação de valores;
- integração com folha de pagamento;
- aplicativo mobile próprio.

---

## 12. Fluxos principais

## 12.1 Criar Espaço

### Entrada do usuário

> “Quero criar uma viagem para Floripa de 12 a 18 de janeiro com Ana, Bia e Caio.”

### Resposta esperada da IA

A IA deve identificar:

- intenção: criar Espaço;
- nome sugerido: Floripa;
- tipo: viagem;
- período: 12 a 18 de janeiro;
- membros mencionados: Ana, Bia e Caio;
- moeda: BRL por padrão;
- regra inicial: divisão igual.

### Comportamento

A IA cria um rascunho e pede confirmação:

> “Criei o rascunho do Espaço ‘Floripa’. Regra inicial: dividir igualmente entre você, Ana, Bia e Caio. Quer confirmar e gerar convites?”

Após confirmação:

> “Espaço criado. Vou gerar convites individuais para Ana, Bia e Caio. Cada pessoa precisa aceitar pelo próprio WhatsApp.”

---

## 12.2 Aceitar convite

### Fluxo

1. Organizador gera convite.
2. Membro recebe link individual.
3. Membro abre página web.
4. Página mostra nome do Espaço, organizador e participantes.
5. Membro confirma número de WhatsApp.
6. Membro aceita termos.
7. Membro entra no Espaço.
8. IA envia mensagem privada de boas-vindas.

### Mensagem de boas-vindas

> “Você entrou no Espaço ‘Floripa’. Aqui você pode consultar saldo, registrar gastos e acompanhar pagamentos. Dados bancários são privados e não são compartilhados com o grupo.”

---

## 12.3 Registrar despesa simples

### Entrada

> “Paguei R$ 480 no Airbnb pra todo mundo.”

### Interpretação

- pagador: usuário atual;
- valor: R$ 480;
- descrição: Airbnb;
- beneficiários: todos os membros;
- regra: divisão igual;
- categoria: hospedagem;
- Espaço: inferido pelo contexto ativo.

### Confirmação

> “Entendi: Airbnb de R$ 480, pago por você, dividido igualmente entre 4 participantes. Cada pessoa fica com R$ 120. Posso registrar?”

### Após confirmação

> “Registrado. Saldo atualizado: Ana deve R$ 120 para você, Bia deve R$ 120 para você e Caio deve R$ 120 para você.”

---

## 12.4 Registrar despesa com exceção

### Entrada

> “Paguei R$ 300 de mercado, mas o Caio não participou.”

### Interpretação

- valor: R$ 300;
- descrição: mercado;
- pagador: usuário;
- excluir: Caio;
- participantes: demais membros;
- divisão: igual entre participantes incluídos.

### Resposta

> “Entendi: mercado de R$ 300, pago por você, dividido entre você, Ana e Bia. Caio fica fora. Cada um participa com R$ 100. Posso registrar?”

---

## 12.5 Consultar saldo individual

### Entrada

> “Quanto eu estou devendo?”

### Resposta

> “No Espaço ‘Floripa’, seu saldo atual é de R$ 174,20 a pagar: R$ 120 para Ana e R$ 54,20 para Caio. Quer que eu prepare os Pix Copia e Cola?”

---

## 12.6 Consultar fechamento do Espaço

### Entrada

> “Fecha a viagem.”

### Resposta

> “Fechamento de ‘Floripa’: total registrado R$ 2.840,00 em 12 despesas. Depois de simplificar as dívidas, ficaram 3 pagamentos pendentes. Quer revisar antes de gerar os Pix?”

---

## 12.7 Gerar Pix

### Entrada

> “Pagar o que devo.”

### Comportamento

No MVP, a IA não paga. Ela prepara instruções de pagamento.

### Resposta

> “Vou preparar 2 Pix, total de R$ 174,20. Nada será pago automaticamente. Você vai copiar o Pix e pagar no seu banco. Quer revisar os destinatários e valores?”

Após revisão:

> “Pix 1: R$ 120 para Ana. Pix 2: R$ 54,20 para Caio.”

---

## 12.8 Marcar pagamento

### Entrada

> “Paguei a Ana.”

### Resposta

Se existir dívida compatível:

> “Encontrei uma dívida pendente de R$ 120 para Ana. Quer marcar como paga e anexar comprovante?”

Se houver múltiplas dívidas:

> “Você tem mais de uma dívida com Ana. Qual delas você pagou: R$ 120 da hospedagem ou R$ 45 do mercado?”

---

## 12.9 Contestar despesa

### Entrada

> “Esse mercado aí eu não participei.”

### Resposta

> “Entendi. Vou abrir uma contestação nessa despesa e avisar o organizador. Enquanto isso, o valor fica marcado como contestado e não entra no fechamento final até ser resolvido.”

---

## 13. Regras de negócio

## 13.1 Espaço ativo

Um usuário pode ter mais de um Espaço ativo. Quando houver ambiguidade, a IA deve perguntar em qual Espaço registrar.

Exemplo:

> “Você tem dois Espaços ativos: ‘Floripa’ e ‘Apartamento’. Em qual deles registro essa despesa?”

---

## 13.2 Despesa sem valor

Se a mensagem não tiver valor, a IA não registra.

Exemplo:

> “Quanto foi o mercado?”

---

## 13.3 Despesa sem pagador

Por padrão, o pagador é o usuário que enviou a mensagem. Se ele disser “Ana pagou”, o sistema deve considerar Ana como pagadora, mas pode exigir confirmação se Ana não for a autora.

---

## 13.4 Despesa sem beneficiários

Por padrão, beneficiários são todos os membros do Espaço, exceto se a mensagem indicar exceções.

---

## 13.5 Operações ambíguas

A IA deve pedir confirmação quando houver:

- valor incerto;
- pagador incerto;
- Espaço incerto;
- participante não encontrado;
- regra de divisão incompleta;
- comando que afete saldo;
- tentativa de alterar despesa antiga;
- possível duplicidade.

---

## 13.6 Duplicidade

Se o usuário tentar registrar despesa semelhante em curto intervalo, o sistema deve alertar:

> “Parece parecido com uma despesa registrada há 3 minutos: ‘Airbnb R$ 480’. Quer registrar mesmo assim?”

---

## 13.7 Edição de despesa

Despesas não devem ser sobrescritas diretamente. Toda alteração deve gerar nova versão ou evento de ajuste.

---

## 13.8 Exclusão de despesa

No MVP, excluir despesa deve significar cancelar ou estornar logicamente, preservando auditoria.

---

## 13.9 Fechamento

O fechamento deve:

- calcular total pago;
- calcular total consumido;
- gerar saldos líquidos;
- simplificar dívidas;
- listar pagamentos necessários;
- permitir revisão;
- permitir contestação antes de finalizar.

---

## 14. Requisitos funcionais

## RF-001 — Cadastro por WhatsApp

O sistema deve identificar usuários pelo número do WhatsApp e permitir cadastro simples com nome e aceite de termos.

## RF-002 — Criar Espaço

O sistema deve permitir a criação de um Espaço com nome, tipo, moeda, período opcional e regra padrão.

## RF-003 — Convidar membro

O sistema deve gerar convites individuais, assinados, revogáveis, com prazo de validade e uso único.

## RF-004 — Aceitar convite

O convidado deve conseguir aceitar convite via web leve e confirmar seu número de WhatsApp.

## RF-005 — Registrar despesa por texto

O usuário deve conseguir registrar despesa em linguagem natural pelo WhatsApp.

## RF-006 — Confirmar despesa ambígua

O sistema deve pedir confirmação antes de registrar despesa com informações incompletas ou ambíguas.

## RF-007 — Calcular rateio

O sistema deve calcular divisão igual, percentual, por cotas e por seleção de participantes.

## RF-008 — Gerar ledger

Cada despesa confirmada deve gerar eventos imutáveis no ledger.

## RF-009 — Consultar saldo

O usuário deve conseguir consultar saldo individual e saldo do Espaço.

## RF-010 — Simplificar dívidas

O sistema deve reduzir o número de transferências necessárias para quitar o Espaço.

## RF-011 — Gerar Pix Copia e Cola

O sistema deve gerar instrução Pix para dívidas pendentes, sem executar pagamento.

## RF-012 — Marcar pagamento

O usuário deve conseguir marcar uma dívida como paga.

## RF-013 — Anexar comprovante

O usuário deve conseguir anexar comprovante de pagamento.

## RF-014 — Contestar lançamento

O usuário deve conseguir contestar uma despesa que o afeta.

## RF-015 — Notificar afetados

O sistema deve notificar membros afetados por despesas, pagamentos, contestações e fechamento.

## RF-016 — Ver histórico web

A interface web deve exibir despesas, saldos, membros e pagamentos.

## RF-017 — Exportar relatório simples

O sistema deve permitir exportação simples do fechamento, preferencialmente em PDF ou CSV.

---

## 15. Requisitos não funcionais

## RNF-001 — Segurança

Convites, dados financeiros e comprovantes devem ser protegidos por autenticação, autorização e expiração.

## RNF-002 — Auditabilidade

Toda operação financeira deve ter rastreabilidade completa.

## RNF-003 — Idempotência

Comandos financeiros precisam ter chaves de idempotência para evitar duplicidade.

## RNF-004 — Privacidade

Dados bancários, comprovantes e saldos individuais sensíveis não devem ser expostos indevidamente.

## RNF-005 — Disponibilidade

O sistema deve continuar operando mesmo se OCR, áudio ou IA avançada falharem. O registro manual estruturado deve ser fallback.

## RNF-006 — Clareza

Toda resposta financeira deve mostrar valor, pagador, beneficiários e impacto no saldo.

## RNF-007 — Observabilidade

O sistema deve registrar logs técnicos, métricas de IA, falhas de integração e eventos de auditoria.

## RNF-008 — Latência

Respostas simples no WhatsApp devem idealmente ocorrer em poucos segundos. Operações demoradas devem enviar mensagem de processamento.

---

## 16. Estados principais

## 16.1 Estado do Espaço

- draft;
- active;
- closing;
- closed;
- archived;
- cancelled.

## 16.2 Estado do convite

- created;
- sent;
- opened;
- accepted;
- expired;
- revoked;
- used.

## 16.3 Estado da despesa

- draft;
- pending_confirmation;
- confirmed;
- contested;
- adjusted;
- cancelled.

## 16.4 Estado do pagamento

- pending;
- pix_generated;
- marked_paid;
- receipt_uploaded;
- confirmed;
- contested;
- failed;
- cancelled.

---

## 17. Critérios de aceite do MVP

O MVP pode ser considerado funcional quando for possível:

1. criar um Espaço pelo WhatsApp;
2. convidar pelo menos 2 membros;
3. membros aceitarem convite;
4. registrar despesas por texto;
5. confirmar despesas ambíguas;
6. calcular rateios;
7. consultar saldo;
8. simplificar dívidas;
9. gerar Pix Copia e Cola ou instrução de pagamento;
10. marcar pagamento;
11. anexar comprovante;
12. contestar despesa;
13. ver histórico em interface web;
14. gerar fechamento do Espaço.

---

## 18. Experiência mínima de interface web

A web não deve tentar substituir o WhatsApp. Ela deve resolver o que é ruim de fazer em conversa.

## Telas mínimas

### 18.1 Tela de aceite de convite

Conteúdo:

- nome do Espaço;
- nome do organizador;
- lista de membros já convidados;
- regra padrão;
- botão “Entrar no Espaço”;
- aceite de termos;
- aviso de privacidade.

### 18.2 Tela do Espaço

Conteúdo:

- nome;
- tipo;
- membros;
- saldo resumido;
- despesas recentes;
- botão de abrir conversa no WhatsApp;
- botão de ver fechamento.

### 18.3 Tela de saldos

Conteúdo:

- quem deve;
- quem recebe;
- valores;
- status dos pagamentos;
- botão para gerar Pix.

### 18.4 Tela de despesa

Conteúdo:

- valor;
- descrição;
- pagador;
- participantes;
- regra de divisão;
- histórico;
- comprovante;
- contestação.

### 18.5 Tela de fechamento

Conteúdo:

- total registrado;
- total por pessoa;
- pagamentos necessários;
- pendências;
- contestações;
- exportação.

---

## 19. Monetização inicial

## 19.1 Gratuito

Proposta:

- 1 ou 2 Espaços ativos;
- limite de membros;
- registro por texto;
- Pix Copia e Cola;
- histórico limitado;
- OCR/áudio limitado ou ausente;
- marca do produto no fechamento.

Objetivo:

- aquisição;
- viralidade;
- validação.

## 19.2 Espaço Pro

Cobrança única por Espaço.

Ideal para:

- viagem;
- evento;
- churrasco;
- restaurante grande;
- grupo temporário.

Benefícios:

- membros extras;
- OCR;
- áudio;
- relatório;
- exportação;
- memória ampliada;
- categorias;
- suporte prioritário;
- multimoeda futura.

## 19.3 Pro recorrente

Assinatura para:

- casa;
- república;
- casal;
- grupo recorrente.

Benefícios:

- recorrências;
- relatórios mensais;
- Open Finance leitura no futuro;
- conciliação assistida;
- insights;
- histórico ampliado.

---

## 20. Validação antes de escalar

Antes de investir em Open Finance e integrações reguladas, o time deve validar:

1. pessoas criam Espaços sem ajuda;
2. convidados entram sem confusão;
3. grupos registram pelo menos 3 despesas;
4. participantes consultam saldo;
5. pessoas geram Pix;
6. pagamentos são marcados como quitados;
7. usuários indicam para outro grupo;
8. o sistema reduz briga, confusão ou cobrança manual.

---

## 21. Riscos principais

## 21.1 Risco de confiança

Erro financeiro destrói confiança. Mitigação: motor determinístico, confirmação e auditoria.

## 21.2 Risco de escopo

Tentar fazer fintech completa cedo demais. Mitigação: MVP sem movimentação bancária direta.

## 21.3 Risco de canal

WhatsApp API pode ter limitações e custo. Mitigação: conversas privadas conectadas e web como apoio.

## 21.4 Risco regulatório

Iniciação de pagamento e Open Finance exigem cuidado. Mitigação: parceiro regulado apenas após validação.

## 21.5 Risco de privacidade

Dados financeiros em grupo são sensíveis. Mitigação: separação entre dado coletivo e dado privado.

---

## 22. Roadmap recomendado

## Fase 0 — Descoberta e protótipo

Prazo: 2 a 4 semanas.

Entregas:

- entrevistas com usuários;
- protótipo conversacional;
- landing page;
- teste de copy;
- simulação manual do fluxo;
- definição de stack;
- desenho do ledger.

## Fase 1 — MVP privado

Prazo: 8 a 12 semanas.

Entregas:

- WhatsApp privado;
- criação de Espaços;
- convites;
- registro por texto;
- ledger;
- saldos;
- Pix Copia e Cola;
- comprovante;
- fechamento;
- web leve.

## Fase 2 — Automação

Prazo: +6 a 10 semanas.

Entregas:

- áudio;
- OCR;
- recorrência;
- relatórios;
- conciliação manual assistida;
- melhoria de IA.

## Fase 3 — Open Finance leitura

Prazo: +8 a 16 semanas.

Entregas:

- conexão bancária com parceiro;
- sugestão privada de transações;
- conciliação de Pix;
- categorização assistida.

## Fase 4 — Iniciação Pix

Prazo: após parceiro regulado.

Entregas:

- intenção de pagamento;
- autorização no banco;
- webhooks;
- conciliação automática;
- estados transacionais completos.

---

## 23. Decisão final do PRD

A versão inicial deve ser simples, segura e testável:

> Um usuário cria um Espaço no WhatsApp, convida pessoas, registra gastos por mensagem, o sistema divide com precisão, mostra saldos e gera Pix manual para quitar.

O produto só deve avançar para Open Finance, grupos nativos e iniciação Pix depois que essa experiência básica provar valor real.
