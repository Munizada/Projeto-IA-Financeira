import { describe, expect, it } from "vitest";

import { calculateBalances, CurrencyMismatchError } from "../src/index.js";
import type { LedgerEntry } from "@ia-financeira/shared";

const entry = (
  fromMemberId: string,
  toMemberId: string,
  amountMinor: number,
  currency = "BRL"
): LedgerEntry => ({
  id: `${fromMemberId}-${toMemberId}-${amountMinor}`,
  spaceId: "space-1",
  eventId: `${fromMemberId}-${toMemberId}`,
  eventType: "expense_confirmed",
  fromMemberId,
  toMemberId,
  amountMinor,
  currency,
  referenceType: "expense",
  referenceId: "expense-1",
  createdAt: new Date("2026-06-18T12:00:00.000Z")
});

describe("calculateBalances", () => {
  it("calculates credits and debts correctly", () => {
    const balances = calculateBalances({
      memberIds: ["ana", "bruno", "caio"],
      ledgerEntries: [
        entry("bruno", "ana", 10000),
        entry("ana", "bruno", 4000),
        entry("caio", "ana", 6000)
      ]
    });

    expect(balances).toEqual([
      { memberId: "ana", balanceMinor: 12000, currency: "BRL" },
      { memberId: "bruno", balanceMinor: -6000, currency: "BRL" },
      { memberId: "caio", balanceMinor: -6000, currency: "BRL" }
    ]);
    expect(balances.reduce((sum, balance) => sum + balance.balanceMinor, 0)).toBe(0);
  });

  it("includes members without movement as zero", () => {
    expect(
      calculateBalances({
        memberIds: ["ana", "bruno", "duda"],
        ledgerEntries: [entry("bruno", "ana", 100)]
      })
    ).toEqual([
      { memberId: "ana", balanceMinor: 100, currency: "BRL" },
      { memberId: "bruno", balanceMinor: -100, currency: "BRL" },
      { memberId: "duda", balanceMinor: 0, currency: "BRL" }
    ]);
  });

  it("rejects entries with a different currency", () => {
    expect(() =>
      calculateBalances({
        memberIds: ["ana", "bruno"],
        currency: "BRL",
        ledgerEntries: [entry("bruno", "ana", 100, "USD")]
      })
    ).toThrow(CurrencyMismatchError);
  });
});
