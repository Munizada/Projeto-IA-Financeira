import type { ExpenseSplit, LedgerEntry } from "@ia-financeira/shared";
import { LedgerEventType, LedgerReferenceType } from "@ia-financeira/shared";

import { CurrencyMismatchError, DuplicateMemberError, InvalidLedgerEntryError } from "./errors.js";
import { normalizeCurrency } from "./money.js";
import { sortMemberIdsStable } from "./splits.js";

export function createLedgerEntriesFromExpense(params: {
  expenseId: string;
  spaceId: string;
  payerMemberId: string;
  splits: ExpenseSplit[];
  currency?: string;
  eventId?: string;
  createdAt?: Date;
}): LedgerEntry[] {
  const currency = normalizeCurrency(params.currency ?? params.splits[0]?.currency ?? "BRL");
  const eventId = params.eventId ?? `expense:${params.expenseId}`;
  const createdAt = params.createdAt ?? new Date(0);
  const payerMemberId = requireId(params.payerMemberId, "payerMemberId");

  requireId(params.expenseId, "expenseId");
  requireId(params.spaceId, "spaceId");
  ensureNoDuplicateSplits(params.splits);

  return [...params.splits]
    .sort((a, b) => (a.memberId < b.memberId ? -1 : a.memberId > b.memberId ? 1 : 0))
    .flatMap((split) => {
      validateSplitForLedger(split, currency);

      if (split.memberId === payerMemberId || split.amountMinor === 0) {
        return [];
      }

      if (split.memberId === payerMemberId) {
        throw new InvalidLedgerEntryError("Ledger entry cannot have the same debtor and creditor.");
      }

      return [
        {
          id: `${eventId}:${split.memberId}:${payerMemberId}`,
          spaceId: params.spaceId,
          eventId,
          eventType: LedgerEventType.ExpenseConfirmed,
          fromMemberId: split.memberId,
          toMemberId: payerMemberId,
          amountMinor: split.amountMinor,
          currency,
          referenceType: LedgerReferenceType.Expense,
          referenceId: params.expenseId,
          createdAt
        }
      ];
    });
}

export function validateLedgerEntry(entry: LedgerEntry, expectedCurrency?: string): void {
  requireId(entry.id, "ledgerEntry.id");
  requireId(entry.spaceId, "ledgerEntry.spaceId");
  requireId(entry.eventId, "ledgerEntry.eventId");
  requireId(entry.fromMemberId, "ledgerEntry.fromMemberId");
  requireId(entry.toMemberId, "ledgerEntry.toMemberId");
  requireId(entry.referenceId, "ledgerEntry.referenceId");

  if (entry.fromMemberId === entry.toMemberId) {
    throw new InvalidLedgerEntryError("Ledger entry cannot have the same debtor and creditor.");
  }

  if (!Number.isInteger(entry.amountMinor) || entry.amountMinor < 0) {
    throw new InvalidLedgerEntryError("Ledger amountMinor must be a non-negative integer.");
  }

  const currency = normalizeCurrency(entry.currency);

  if (expectedCurrency && currency !== normalizeCurrency(expectedCurrency)) {
    throw new CurrencyMismatchError("Ledger entry currency does not match expected currency.");
  }
}

function validateSplitForLedger(split: ExpenseSplit, expectedCurrency: string): void {
  requireId(split.memberId, "split.memberId");

  if (!Number.isInteger(split.amountMinor) || split.amountMinor < 0) {
    throw new InvalidLedgerEntryError("Expense split amountMinor must be a non-negative integer.");
  }

  if (normalizeCurrency(split.currency) !== expectedCurrency) {
    throw new CurrencyMismatchError("Expense split currency does not match ledger currency.");
  }
}

function ensureNoDuplicateSplits(splits: ExpenseSplit[]): void {
  const sorted = sortMemberIdsStable(splits.map((split) => split.memberId));

  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] === sorted[index - 1]) {
      throw new DuplicateMemberError("Expense splits must have unique members.");
    }
  }
}

export function requireId(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new InvalidLedgerEntryError(`${fieldName} cannot be empty.`);
  }

  return normalized;
}
