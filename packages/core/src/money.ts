import type { Money } from "@ia-financeira/shared";

import { CurrencyMismatchError, InvalidMoneyError } from "./errors.js";

const DEFAULT_CURRENCY = "BRL";

export function createMoney(amountMinor: number, currency = DEFAULT_CURRENCY): Money {
  const normalizedCurrency = normalizeCurrency(currency);

  if (!Number.isInteger(amountMinor)) {
    throw new InvalidMoneyError("Money amountMinor must be an integer.");
  }

  if (amountMinor < 0) {
    throw new InvalidMoneyError("Money amountMinor cannot be negative.");
  }

  return {
    amountMinor,
    currency: normalizedCurrency
  };
}

export function assertSameCurrency(...values: Money[]): void {
  const [first, ...rest] = values;

  if (!first) {
    return;
  }

  const currency = normalizeCurrency(first.currency);

  for (const value of rest) {
    if (normalizeCurrency(value.currency) !== currency) {
      throw new CurrencyMismatchError("All money values must use the same currency.");
    }
  }
}

export function sumMoney(values: Money[]): Money {
  if (values.length === 0) {
    return createMoney(0);
  }

  assertSameCurrency(...values);

  return createMoney(
    values.reduce((sum, value) => sum + value.amountMinor, 0),
    values[0]?.currency
  );
}

export function formatMoneyBRL(value: Money | number): string {
  const money =
    typeof value === "number"
      ? createMoney(value, "BRL")
      : createMoney(value.amountMinor, value.currency);

  if (money.currency !== "BRL") {
    throw new CurrencyMismatchError("formatMoneyBRL only accepts BRL values.");
  }

  const reais = Math.floor(money.amountMinor / 100);
  const cents = String(money.amountMinor % 100).padStart(2, "0");

  return `R$ ${reais},${cents}`;
}

export function normalizeCurrency(currency: string): string {
  const normalized = currency.trim().toUpperCase();

  if (normalized.length === 0) {
    throw new InvalidMoneyError("Currency cannot be empty.");
  }

  return normalized;
}
