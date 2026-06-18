# Telas Web Mínimas e UX do MVP

## 1. Objetivo

A web existe para apoiar o WhatsApp, não para substituir o WhatsApp.

O produto deve funcionar principalmente por conversa, mas algumas ações precisam de tela por clareza e segurança:

- aceitar convite;
- revisar Espaço;
- ver saldos;
- conferir fechamento;
- cadastrar chave Pix;
- anexar comprovante;
- consultar histórico;
- revisar dados antes de pagar.

## 2. Princípios de UX

## 2.1 Simplicidade

Não criar dashboard gigante.

O usuário precisa entender rápido:

- qual é o Espaço;
- quem participa;
- quanto foi gasto;
- quem deve;
- quem recebe;
- o que falta pagar.

## 2.2 Segurança visual

Antes de pagamento, sempre mostrar:

- valor;
- recebedor;
- Espaço;
- descrição;
- status;
- aviso de que o pagamento ocorre no banco.

## 2.3 WhatsApp como CTA

Quase toda tela deve ter botão:

- “Abrir no WhatsApp”
- “Registrar gasto pelo WhatsApp”
- “Perguntar para a IA”

## 2.4 Nada de regra financeira duplicada

Frontend não calcula saldo final. Ele apenas exibe dados vindos da API.

---

## 3. Mapa de telas MVP

## 3.1 Tela 1 — Landing simples

Rota:

```txt
/
```

Objetivo:

- explicar produto;
- capturar interessados;
- levar para criar Espaço.

Blocos:

1. Hero;
2. Como funciona;
3. Casos de uso;
4. Benefícios;
5. Segurança;
6. CTA.

CTA:

- “Criar meu primeiro Espaço”
- “Entrar na lista de teste”

## 3.2 Tela 2 — Aceitar convite

Rota:

```txt
/invite/[token]
```

Objetivo:

- membro aceitar entrada no Espaço.

Conteúdo:

- nome do Espaço;
- tipo;
- organizador;
- participantes;
- regra padrão;
- aviso de privacidade;
- botão “Entrar no Espaço”;
- botão “Recusar”.

Estados:

- convite válido;
- convite expirado;
- convite usado;
- convite revogado;
- erro técnico.

Texto de privacidade:

> Seus dados bancários não são compartilhados com o grupo. Você verá apenas as despesas e saldos relacionados a este Espaço.

## 3.3 Tela 3 — Login/identificação simples

Rota:

```txt
/auth
```

MVP privado:

- login por link mágico;
- código por WhatsApp;
- modo dev com usuário selecionável, se necessário.

Não criar autenticação complexa demais no início.

## 3.4 Tela 4 — Lista de Espaços

Rota:

```txt
/spaces
```

Conteúdo:

- cards dos Espaços;
- status;
- membros;
- saldo resumido;
- última atividade;
- botão criar Espaço.

Card:

```txt
Floripa 2027
Viagem • 4 membros
Você tem R$ 174,20 a pagar
[Ver Espaço] [Abrir WhatsApp]
```

## 3.5 Tela 5 — Criar Espaço

Rota:

```txt
/spaces/new
```

Campos:

- nome;
- tipo;
- moeda;
- regra padrão;
- período opcional;
- membros opcionais.

Ação:

- criar;
- gerar convites.

## 3.6 Tela 6 — Detalhe do Espaço

Rota:

```txt
/spaces/[spaceId]
```

Conteúdo:

- nome;
- tipo;
- membros;
- total registrado;
- seu saldo;
- pagamentos pendentes;
- despesas recentes;
- CTA WhatsApp.

Blocos:

1. Resumo;
2. Saldos;
3. Despesas;
4. Pagamentos;
5. Membros.

## 3.7 Tela 7 — Membros

Rota:

```txt
/spaces/[spaceId]/members
```

Conteúdo:

- lista de membros;
- papel;
- status;
- apelido;
- chave Pix cadastrada ou não, sem expor se for sensível;
- botão convidar membro.

Ações:

- gerar convite;
- revogar convite;
- remover membro, se permitido.

## 3.8 Tela 8 — Despesas

Rota:

```txt
/spaces/[spaceId]/expenses
```

Conteúdo:

- lista de despesas;
- valor;
- pagador;
- participantes;
- categoria;
- status;
- data.

Filtros:

- todas;
- confirmadas;
- contestadas;
- canceladas.

## 3.9 Tela 9 — Detalhe da despesa

Rota:

```txt
/spaces/[spaceId]/expenses/[expenseId]
```

Conteúdo:

- descrição;
- valor;
- pagador;
- splits;
- regra de divisão;
- histórico;
- comprovante;
- status;
- ações.

Ações:

- contestar;
- corrigir;
- cancelar, se permitido.

## 3.10 Tela 10 — Saldos

Rota:

```txt
/spaces/[spaceId]/balances
```

Conteúdo:

- quem deve;
- quem recebe;
- saldo líquido;
- detalhe do cálculo;
- CTA para fechamento.

Visual recomendado:

```txt
Você deve R$ 174,20
- R$ 120,00 para Ana
- R$ 54,20 para Caio
```

## 3.11 Tela 11 — Fechamento

Rota:

```txt
/spaces/[spaceId]/settlement
```

Conteúdo:

- total registrado;
- despesas incluídas;
- despesas contestadas;
- pagamentos necessários;
- status;
- botão preparar Pix.

Exemplo:

```txt
Para zerar o Espaço:
Bruno paga R$ 120 para Ana
Caio paga R$ 54,20 para Arthur
Bia paga R$ 80 para Ana
```

## 3.12 Tela 12 — Pagamento

Rota:

```txt
/spaces/[spaceId]/payments/[paymentId]
```

Conteúdo:

- valor;
- pagador;
- recebedor;
- status;
- Pix Copia e Cola;
- QR Code;
- comprovante;
- botão marcar como pago;
- botão contestar.

Aviso obrigatório:

> O pagamento acontece no seu banco. Este sistema apenas prepara os dados e registra o status no Espaço.

## 3.13 Tela 13 — Configuração Pix

Rota:

```txt
/settings/pix
```

Campos:

- tipo de chave;
- chave;
- nome exibido;
- confirmação.

Aviso:

> Sua chave Pix será usada apenas para preparar pagamentos relacionados aos Espaços em que você participa.

## 3.14 Tela 14 — Auditoria simples

Rota:

```txt
/spaces/[spaceId]/activity
```

Conteúdo:

- despesa criada;
- despesa confirmada;
- pagamento marcado;
- comprovante enviado;
- contestação aberta;
- fechamento gerado.

Não precisa ser super técnica no MVP.

---

## 4. Componentes de UI

Componentes recomendados:

- `SpaceCard`;
- `MemberAvatar`;
- `MoneyValue`;
- `StatusBadge`;
- `ExpenseList`;
- `BalanceSummary`;
- `SettlementList`;
- `PaymentCard`;
- `PixBox`;
- `ConfirmDialog`;
- `EmptyState`;
- `ErrorState`;
- `LoadingState`;
- `WhatsAppCTA`.

---

## 5. Estados vazios

## 5.1 Sem Espaços

> Você ainda não tem Espaços. Crie uma viagem, casa ou evento para começar a dividir despesas.

## 5.2 Sem despesas

> Nenhuma despesa registrada ainda. Você pode mandar “paguei R$ 80 de mercado” no WhatsApp.

## 5.3 Sem pagamentos

> Nenhum pagamento pendente por enquanto.

## 5.4 Convite expirado

> Este convite expirou ou já foi usado. Peça um novo convite ao organizador.

---

## 6. Design inicial

Estilo recomendado:

- limpo;
- cards;
- bastante espaço;
- números bem visíveis;
- verde só para ações positivas/quitadas;
- alerta para contestado;
- evitar visual de banco pesado;
- parecer simples como WhatsApp + app financeiro leve.

## 7. Rotas recomendadas

```txt
/
 /auth
 /invite/[token]
 /spaces
 /spaces/new
 /spaces/[spaceId]
 /spaces/[spaceId]/members
 /spaces/[spaceId]/expenses
 /spaces/[spaceId]/expenses/[expenseId]
 /spaces/[spaceId]/balances
 /spaces/[spaceId]/settlement
 /spaces/[spaceId]/payments/[paymentId]
 /spaces/[spaceId]/activity
 /settings/pix
```

## 8. Prioridade de implementação

P0:

1. aceitar convite;
2. lista de Espaços;
3. detalhe do Espaço;
4. despesas;
5. saldos;
6. fechamento;
7. pagamento;
8. configuração Pix.

P1:

1. auditoria visual;
2. relatório;
3. OCR;
4. recorrências;
5. configurações avançadas.

## 9. Definition of Done

A web mínima está pronta quando:

- usuário aceita convite;
- vê Espaço;
- vê despesas;
- vê saldos;
- vê fechamento;
- vê Pix manual;
- marca pagamento;
- anexa comprovante;
- abre WhatsApp;
- frontend não calcula regra financeira crítica.
