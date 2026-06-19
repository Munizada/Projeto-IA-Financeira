import { describe, expect, it } from "vitest";

import {
  mockBalancesBySpaceId,
  mockExpensesBySpaceId,
  mockSettlementBySpaceId,
  mockSpaces
} from "../lib/mock-data";

describe("mock data", () => {
  it("contains the Floripa MVP space", () => {
    expect(mockSpaces.some((space) => space.name === "Floripa MVP")).toBe(true);
  });

  it("contains the Airbnb expense with 48000 amountMinor", () => {
    const [expense] = mockExpensesBySpaceId["space-floripa"] ?? [];

    expect(expense?.description).toBe("Airbnb");
    expect(expense?.amountMinor).toBe(48000);
  });

  it("keeps balances summing to zero", () => {
    const total = (mockBalancesBySpaceId["space-floripa"] ?? []).reduce(
      (sum, balance) => sum + balance.balanceMinor,
      0
    );

    expect(total).toBe(0);
  });

  it("keeps settlement summing to 36000", () => {
    const total = (mockSettlementBySpaceId["space-floripa"] ?? []).reduce(
      (sum, payment) => sum + payment.amountMinor,
      0
    );

    expect(total).toBe(36000);
  });
});
