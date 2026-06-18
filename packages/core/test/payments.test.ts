import { describe, expect, it } from "vitest";

import { applyPaymentToLedger, calculateBalances, InvalidPaymentError } from "../src/index.js";
import type { LedgerEntry } from "@ia-financeira/shared";

const debtEntry: LedgerEntry = {
  id: "debt-1",
  spaceId: "space-1",
  eventId: "event-expense-1",
  eventType: "expense_confirmed",
  fromMemberId: "bruno",
  toMemberId: "ana",
  amountMinor: 6000,
  currency: "BRL",
  referenceType: "expense",
  referenceId: "expense-1",
  createdAt: new Date("2026-06-18T12:00:00.000Z")
};

describe("applyPaymentToLedger", () => {
  it("creates a reverse ledger entry for confirmed payment", () => {
    expect(
      applyPaymentToLedger({
        paymentId: "payment-1",
        spaceId: "space-1",
        payerMemberId: "bruno",
        receiverMemberId: "ana",
        amountMinor: 6000,
        eventId: "event-payment-1",
        createdAt: new Date("2026-06-18T12:00:00.000Z")
      })
    ).toMatchObject({
      id: "event-payment-1:ana:bruno",
      spaceId: "space-1",
      eventId: "event-payment-1",
      eventType: "payment_confirmed",
      fromMemberId: "ana",
      toMemberId: "bruno",
      amountMinor: 6000,
      currency: "BRL",
      referenceType: "payment",
      referenceId: "payment-1"
    });
  });

  it("rejects payment to self", () => {
    expect(() =>
      applyPaymentToLedger({
        paymentId: "payment-1",
        spaceId: "space-1",
        payerMemberId: "ana",
        receiverMemberId: "ana",
        amountMinor: 100
      })
    ).toThrow(InvalidPaymentError);
  });

  it("rejects non-positive amount", () => {
    expect(() =>
      applyPaymentToLedger({
        paymentId: "payment-1",
        spaceId: "space-1",
        payerMemberId: "bruno",
        receiverMemberId: "ana",
        amountMinor: 0
      })
    ).toThrow(InvalidPaymentError);
  });

  it("rejects invalid currency", () => {
    expect(() =>
      applyPaymentToLedger({
        paymentId: "payment-1",
        spaceId: "space-1",
        payerMemberId: "bruno",
        receiverMemberId: "ana",
        amountMinor: 100,
        currency: ""
      })
    ).toThrow(InvalidPaymentError);
  });

  it("reduces debt when balances are recalculated with previous ledger", () => {
    const paymentEntry = applyPaymentToLedger({
      paymentId: "payment-1",
      spaceId: "space-1",
      payerMemberId: "bruno",
      receiverMemberId: "ana",
      amountMinor: 6000
    });

    expect(
      calculateBalances({
        memberIds: ["ana", "bruno"],
        ledgerEntries: [debtEntry, paymentEntry]
      })
    ).toEqual([
      { memberId: "ana", balanceMinor: 0, currency: "BRL" },
      { memberId: "bruno", balanceMinor: 0, currency: "BRL" }
    ]);
  });
});
