import type { Balance, SettlementPayment } from "@ia-financeira/shared";

import { CurrencyMismatchError, InvalidLedgerEntryError } from "./errors.js";
import { normalizeCurrency } from "./money.js";

type MutableBalance = {
  memberId: string;
  amountMinor: number;
};

export function simplifyDebts(params: {
  balances: Balance[];
  currency?: string;
}): SettlementPayment[] {
  const currency = normalizeCurrency(params.currency ?? params.balances[0]?.currency ?? "BRL");

  for (const balance of params.balances) {
    if (normalizeCurrency(balance.currency) !== currency) {
      throw new CurrencyMismatchError("Balances must use a single currency.");
    }

    if (!Number.isInteger(balance.balanceMinor)) {
      throw new InvalidLedgerEntryError("Balance amount must be an integer.");
    }
  }

  const total = params.balances.reduce((sum, balance) => sum + balance.balanceMinor, 0);

  if (total !== 0) {
    throw new InvalidLedgerEntryError("Cannot simplify balances when their sum is not zero.");
  }

  const creditors = params.balances
    .filter((balance) => balance.balanceMinor > 0)
    .map((balance) => ({ memberId: balance.memberId, amountMinor: balance.balanceMinor }))
    .sort(compareSettlementBalances);
  const debtors = params.balances
    .filter((balance) => balance.balanceMinor < 0)
    .map((balance) => ({ memberId: balance.memberId, amountMinor: -balance.balanceMinor }))
    .sort(compareSettlementBalances);
  const payments: SettlementPayment[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    if (!debtor || !creditor) {
      break;
    }

    const amountMinor = Math.min(debtor.amountMinor, creditor.amountMinor);

    if (amountMinor > 0) {
      payments.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amountMinor,
        currency
      });
    }

    debtor.amountMinor -= amountMinor;
    creditor.amountMinor -= amountMinor;

    if (debtor.amountMinor === 0) {
      debtorIndex += 1;
    }

    if (creditor.amountMinor === 0) {
      creditorIndex += 1;
    }
  }

  return payments;
}

function compareSettlementBalances(a: MutableBalance, b: MutableBalance): number {
  const byAmount = b.amountMinor - a.amountMinor;

  if (byAmount !== 0) {
    return byAmount;
  }

  return a.memberId < b.memberId ? -1 : a.memberId > b.memberId ? 1 : 0;
}
