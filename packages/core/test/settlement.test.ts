import { describe, expect, it } from "vitest";

import { CurrencyMismatchError, simplifyDebts } from "../src/index.js";
import type { Balance, SettlementPayment } from "@ia-financeira/shared";

const settleToNet = (payments: SettlementPayment[]) => {
  const net = new Map<string, number>();
  for (const payment of payments) {
    net.set(payment.fromMemberId, (net.get(payment.fromMemberId) ?? 0) - payment.amountMinor);
    net.set(payment.toMemberId, (net.get(payment.toMemberId) ?? 0) + payment.amountMinor);
  }
  return net;
};

describe("simplifyDebts", () => {
  it("creates payments from debtors to creditor", () => {
    expect(
      simplifyDebts({
        balances: [
          { memberId: "ana", balanceMinor: 12000, currency: "BRL" },
          { memberId: "bruno", balanceMinor: -6000, currency: "BRL" },
          { memberId: "caio", balanceMinor: -6000, currency: "BRL" }
        ]
      })
    ).toEqual([
      { fromMemberId: "bruno", toMemberId: "ana", amountMinor: 6000, currency: "BRL" },
      { fromMemberId: "caio", toMemberId: "ana", amountMinor: 6000, currency: "BRL" }
    ]);
  });

  it("handles multiple creditors and debtors deterministically", () => {
    const balances: Balance[] = [
      { memberId: "ana", balanceMinor: 7000, currency: "BRL" },
      { memberId: "bia", balanceMinor: 5000, currency: "BRL" },
      { memberId: "bruno", balanceMinor: -6000, currency: "BRL" },
      { memberId: "caio", balanceMinor: -6000, currency: "BRL" }
    ];

    expect(simplifyDebts({ balances })).toEqual([
      { fromMemberId: "bruno", toMemberId: "ana", amountMinor: 6000, currency: "BRL" },
      { fromMemberId: "caio", toMemberId: "ana", amountMinor: 1000, currency: "BRL" },
      { fromMemberId: "caio", toMemberId: "bia", amountMinor: 5000, currency: "BRL" }
    ]);
  });

  it("ignores zero balances", () => {
    expect(
      simplifyDebts({
        balances: [
          { memberId: "ana", balanceMinor: 0, currency: "BRL" },
          { memberId: "bruno", balanceMinor: 0, currency: "BRL" }
        ]
      })
    ).toEqual([]);
  });

  it("creates payments that settle balances", () => {
    const balances: Balance[] = [
      { memberId: "ana", balanceMinor: 12000, currency: "BRL" },
      { memberId: "bruno", balanceMinor: -6000, currency: "BRL" },
      { memberId: "caio", balanceMinor: -6000, currency: "BRL" }
    ];
    const payments = simplifyDebts({ balances });
    const net = settleToNet(payments);

    for (const balance of balances) {
      expect(net.get(balance.memberId) ?? 0).toBe(balance.balanceMinor);
    }
  });

  it("rejects mixed currencies", () => {
    expect(() =>
      simplifyDebts({
        balances: [
          { memberId: "ana", balanceMinor: 100, currency: "BRL" },
          { memberId: "bruno", balanceMinor: -100, currency: "USD" }
        ]
      })
    ).toThrow(CurrencyMismatchError);
  });
});
