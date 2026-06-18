import type { Balance, LedgerEntry } from "@ia-financeira/shared";

import { CurrencyMismatchError, InvalidLedgerEntryError } from "./errors.js";
import { normalizeCurrency } from "./money.js";
import { sortMemberIdsStable } from "./splits.js";
import { validateLedgerEntry } from "./ledger.js";

export function calculateBalances(params: {
  ledgerEntries: LedgerEntry[];
  memberIds: string[];
  currency?: string;
}): Balance[] {
  const currency = normalizeCurrency(params.currency ?? params.ledgerEntries[0]?.currency ?? "BRL");
  const balanceByMember = new Map<string, number>();

  for (const memberId of params.memberIds) {
    balanceByMember.set(memberId.trim(), 0);
  }

  for (const entry of params.ledgerEntries) {
    validateLedgerEntry(entry, currency);

    if (normalizeCurrency(entry.currency) !== currency) {
      throw new CurrencyMismatchError("Ledger entries must use a single currency.");
    }

    balanceByMember.set(
      entry.fromMemberId,
      (balanceByMember.get(entry.fromMemberId) ?? 0) - entry.amountMinor
    );
    balanceByMember.set(
      entry.toMemberId,
      (balanceByMember.get(entry.toMemberId) ?? 0) + entry.amountMinor
    );
  }

  const balances = sortMemberIdsStable([...balanceByMember.keys()]).map((memberId) => ({
    memberId,
    balanceMinor: balanceByMember.get(memberId) ?? 0,
    currency
  }));
  const total = balances.reduce((sum, balance) => sum + balance.balanceMinor, 0);

  if (total !== 0) {
    throw new InvalidLedgerEntryError("Balance invariant failed: total balance must be zero.");
  }

  return balances;
}
