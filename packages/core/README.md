# Core Financeiro

`@ia-financeira/core` e o motor financeiro puro da IA Financeira Coletiva no WhatsApp.

Ele nao importa Prisma, NestJS, Next.js, WhatsApp, IA, Redis, HTTP ou banco de dados. O pacote recebe objetos simples, valida regras financeiras e devolve objetos simples para outras camadas registrarem com auditoria.

## Dinheiro

Dinheiro sempre usa:

```ts
{
  amountMinor: number;
  currency: string;
}
```

`amountMinor` precisa ser inteiro. Exemplos:

- R$ 1,00 = `100`
- R$ 10,50 = `1050`
- R$ 0,01 = `1`

## Rateios

O core implementa:

- `splitEqual`: divide igualmente e distribui centavos restantes por ordem estavel de `memberId`;
- `splitByPercentages`: exige soma de 100%;
- `splitByShares`: exige cotas maiores que zero;
- `splitByFixedAmounts`: exige que a soma bata exatamente com o total.

Todas as funcoes mantem a soma final igual ao valor original.

## Ledger

Ledger representa obrigacoes:

- `fromMemberId`: quem deve;
- `toMemberId`: quem recebe;
- `amountMinor`: valor devido.

Ao criar ledger de uma despesa, o pagador nao gera divida para si mesmo.

## Saldos

`calculateBalances` aplica cada entry:

- `fromMemberId` perde valor;
- `toMemberId` ganha valor.

Saldo positivo significa que o membro deve receber. Saldo negativo significa que o membro deve pagar. A soma dos saldos precisa ser zero.

## Settlement

`simplifyDebts` separa credores e devedores, casa os maiores valores e gera uma lista deterministica de pagamentos para quitar o espaco com um numero razoavel de transferencias.

## Pagamentos

No MVP, pagamento confirmado e representado como lancamento reverso no ledger.

Se Bruno deve R$ 60 para Ana:

```txt
Bruno -> Ana 6000
```

Quando Bruno paga e o pagamento e confirmado:

```txt
Ana -> Bruno 6000
```

O saldo liquido zera.

## Testes

```bash
pnpm --filter @ia-financeira/core test
```

Com Corepack:

```bash
corepack pnpm --filter @ia-financeira/core test
```
