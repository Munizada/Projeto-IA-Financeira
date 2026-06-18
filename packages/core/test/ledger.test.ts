import { describe, expect, it } from "vitest";

import {
  createLedgerEntriesFromExpense,
  CurrencyMismatchError,
  InvalidLedgerEntryError,
  splitEqual
} from "../src/index.js";

describe("createLedgerEntriesFromExpense", () => {
  it("does not create debt from the payer to themselves", () => {
    const splits = splitEqual({ amountMinor: 48000, memberIds: ["arthur", "ana", "bia", "caio"] });

    const ledgerEntries = createLedgerEntriesFromExpense({
      expenseId: "expense-1",
      spaceId: "space-1",
      payerMemberId: "arthur",
      splits,
      eventId: "event-1",
      createdAt: new Date("2026-06-18T12:00:00.000Z")
    });

    expect(ledgerEntries).toHaveLength(3);
    expect(
      ledgerEntries.map((entry) => [entry.fromMemberId, entry.toMemberId, entry.amountMinor])
    ).toEqual([
      ["ana", "arthur", 12000],
      ["bia", "arthur", 12000],
      ["caio", "arthur", 12000]
    ]);
    expect(ledgerEntries.some((entry) => entry.fromMemberId === entry.toMemberId)).toBe(false);
  });

  it("sets event and reference metadata for confirmed expenses", () => {
    const [entry] = createLedgerEntriesFromExpense({
      expenseId: "expense-1",
      spaceId: "space-1",
      payerMemberId: "ana",
      splits: [{ memberId: "bruno", amountMinor: 1000, currency: "BRL", splitRule: "equal" }],
      eventId: "event-1",
      createdAt: new Date("2026-06-18T12:00:00.000Z")
    });

    expect(entry).toMatchObject({
      id: "event-1:bruno:ana",
      spaceId: "space-1",
      eventId: "event-1",
      eventType: "expense_confirmed",
      fromMemberId: "bruno",
      toMemberId: "ana",
      referenceType: "expense",
      referenceId: "expense-1"
    });
  });

  it("excludes the payer share from the ledger total", () => {
    const splits = splitEqual({ amountMinor: 48000, memberIds: ["arthur", "ana", "bia", "caio"] });
    const ledgerEntries = createLedgerEntriesFromExpense({
      expenseId: "expense-1",
      spaceId: "space-1",
      payerMemberId: "arthur",
      splits
    });
    expect(ledgerEntries.reduce((sum, entry) => sum + entry.amountMinor, 0)).toBe(36000);
  });

  it("rejects splits with a different currency", () => {
    expect(() =>
      createLedgerEntriesFromExpense({
        expenseId: "expense-1",
        spaceId: "space-1",
        payerMemberId: "ana",
        currency: "BRL",
        splits: [{ memberId: "bruno", amountMinor: 100, currency: "USD", splitRule: "equal" }]
      })
    ).toThrow(CurrencyMismatchError);
  });

  it("rejects invalid splits", () => {
    expect(() =>
      createLedgerEntriesFromExpense({
        expenseId: "expense-1",
        spaceId: "space-1",
        payerMemberId: "ana",
        splits: [{ memberId: "bruno", amountMinor: -100, currency: "BRL", splitRule: "equal" }]
      })
    ).toThrow(InvalidLedgerEntryError);
  });
});
