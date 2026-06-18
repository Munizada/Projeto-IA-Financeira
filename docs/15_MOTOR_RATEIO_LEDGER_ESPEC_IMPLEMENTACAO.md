# Motor de Rateio e Ledger — Especificação de Implementação

## 1. Objetivo

Este documento detalha como implementar o motor financeiro do produto.

O motor precisa ser:

- puro;
- determinístico;
- testável;
- sem dependência de banco;
- sem dependência de IA;
- sem dependência de WhatsApp;
- seguro para dinheiro;
- auditável via dados gerados.

## 2. Entradas e saídas

O core deve receber objetos simples e retornar objetos simples.

Exemplo:

```ts
const splits = splitEqual({
  amountMinor: 48000,
  currency: "BRL",
  memberIds: ["arthur", "ana", "bia", "caio"],
});
```

Saída:

```ts
[
  { memberId: "ana", amountMinor: 12000, currency: "BRL" },
  { memberId: "arthur", amountMinor: 12000, currency: "BRL" },
  { memberId: "bia", amountMinor: 12000, currency: "BRL" },
  { memberId: "caio", amountMinor: 12000, currency: "BRL" }
]
```

A ordem pode ser estável por ordenação de ID ou ordem recebida, desde que documentada e testada.

## 3. Money

## 3.1 Tipo

```ts
type Money = {
  amountMinor: number;
  currency: string;
};
```

## 3.2 Validações

- amountMinor precisa ser inteiro;
- amountMinor precisa ser >= 0;
- currency precisa existir;
- default currency = BRL.

## 3.3 Funções

```ts
createMoney(amountMinor: number, currency = "BRL"): Money
assertSameCurrency(a: Money, b: Money): void
sumMoney(values: Money[]): Money
formatMoneyBRL(money: Money): string
```

## 4. Rateio igual

## 4.1 Regra

Dividir valor igualmente entre membros.

## 4.2 Resto de centavos

Se a divisão não for exata, distribuir centavos restantes de forma determinística.

Exemplo:

10000 / 3 =

- 3334
- 3333
- 3333

## 4.3 Pseudocódigo

```txt
sort members stable
base = floor(amount / count)
remainder = amount % count
for each member by stable order:
  split = base
  if remainder > 0:
    split += 1
    remainder -= 1
return splits
```

## 5. Rateio percentual

## 5.1 Regra

Percentuais precisam somar 100.

Exemplo:

R$ 100:

- 70% = R$ 70
- 30% = R$ 30

## 5.2 Arredondamento

Calcular valor bruto em centavos com precisão e distribuir diferença residual.

Estratégia:

1. calcular valor floor para cada percentual;
2. calcular fração residual;
3. ordenar maiores frações;
4. distribuir centavos restantes;
5. usar desempate por memberId estável.

## 6. Rateio por cotas

## 6.1 Regra

Cada membro tem número de cotas.

Exemplo:

R$ 300 com cotas 2/1/1:

- total cotas = 4;
- valor cota = R$ 75;
- pessoa com 2 cotas = R$ 150.

## 6.2 Validações

- cota precisa ser > 0;
- soma de cotas > 0;
- membros únicos.

## 7. Rateio fixo

## 7.1 Regra

Usuário informa valor de cada pessoa.

A soma precisa bater exatamente com o total.

Se não bater, falhar e pedir correção.

## 8. Ledger

## 8.1 Semântica

Ledger representa obrigações entre membros.

Campo:

- `fromMemberId`: quem deve;
- `toMemberId`: quem recebe;
- `amountMinor`: valor devido;
- `eventType`: tipo do evento;
- `referenceId`: despesa/pagamento/ajuste.

## 8.2 Despesa

Se Arthur pagou R$ 480 para Arthur, Ana, Bia e Caio:

Splits:

- Arthur: 12000
- Ana: 12000
- Bia: 12000
- Caio: 12000

Ledger:

- Ana deve 12000 para Arthur
- Bia deve 12000 para Arthur
- Caio deve 12000 para Arthur

Arthur não deve para si mesmo.

## 9. Saldos

## 9.1 Cálculo

Para cada ledger entry:

- fromMemberId perde `amountMinor`;
- toMemberId ganha `amountMinor`.

Saldo positivo = deve receber.  
Saldo negativo = deve pagar.

## 9.2 Invariante

A soma dos saldos deve ser zero.

Se não for zero, há bug.

## 10. Simplificação de dívidas

## 10.1 Objetivo

Gerar lista menor de pagamentos para zerar o Espaço.

## 10.2 Algoritmo

1. calcular devedores;
2. calcular credores;
3. ordenar devedores por maior dívida;
4. ordenar credores por maior crédito;
5. casar devedor com credor;
6. gerar pagamento pelo menor valor;
7. atualizar saldos;
8. repetir.

## 10.3 Exemplo

Saldos:

- Ana +12000
- Bruno -6000
- Caio -6000

Resultado:

- Bruno paga 6000 para Ana
- Caio paga 6000 para Ana

## 11. Pagamento aplicado

No MVP, pagamento confirmado pelo recebedor deve reduzir obrigação.

Pode ser representado como ledger entry de evento `payment_confirmed`.

Se Bruno devia 6000 para Ana e pagou:

- pagamento reduz dívida de Bruno para Ana.

Implementação pode representar como entrada reversa:

- fromMemberId = Ana
- toMemberId = Bruno
- amountMinor = 6000
- eventType = payment_confirmed

Assim, o cálculo líquido zera.

## 12. Erros esperados

Criar classes ou erros tipados:

- InvalidMoneyError
- CurrencyMismatchError
- SplitTotalMismatchError
- InvalidPercentageError
- InvalidSharesError
- DuplicateMemberError
- EmptyMembersError
- InvalidLedgerError

## 13. Testes obrigatórios

## Money

- float falha;
- negativo falha;
- zero aceita;
- BRL formata.

## Equal

- 10000 / 2;
- 10000 / 3;
- soma bate;
- ordem determinística.

## Percentage

- 70/30;
- soma 99 falha;
- soma 101 falha;
- negativo falha.

## Shares

- 30000 com 2/1/1;
- zero falha;
- negativo falha.

## Fixed

- soma correta aceita;
- soma errada falha.

## Ledger

- pagador não deve para si;
- membros devem ao pagador;
- total do ledger exclui parte do pagador.

## Balances

- créditos;
- débitos;
- soma zero.

## Simplify

- caso simples;
- múltiplos credores;
- múltiplos devedores;
- saldo zero ignorado.

## Payment

- pagamento reduz dívida;
- moeda diferente falha;
- negativo falha.

## 14. Invariantes do core

Sempre verificar:

- soma dos splits = valor da despesa;
- ledger não tem valor negativo;
- from != to;
- moeda consistente;
- soma dos balances = 0;
- settlement quita balances;
- funções determinísticas.

## 15. Definition of Done

O motor está pronto quando:

- todos os testes passam;
- não há float;
- não há dependência externa;
- funções são puras;
- invariantes são testadas;
- README explica regras;
- código pode ser usado pela API sem adaptação pesada.
