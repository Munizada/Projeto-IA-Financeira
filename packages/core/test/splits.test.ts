import { describe, expect, it } from "vitest";

import {
  DuplicateMemberError,
  EmptyMembersError,
  InvalidMoneyError,
  InvalidPercentageError,
  InvalidSharesError,
  splitByFixedAmounts,
  splitByPercentages,
  splitByShares,
  splitEqual,
  SplitTotalMismatchError
} from "../src/index.js";

const total = (splits: Array<{ amountMinor: number }>) =>
  splits.reduce((sum, split) => sum + split.amountMinor, 0);

describe("splitEqual", () => {
  it("splits R$100 between two members", () => {
    expect(splitEqual({ amountMinor: 10000, memberIds: ["ana", "bruno"] })).toEqual([
      { memberId: "ana", amountMinor: 5000, currency: "BRL", splitRule: "equal" },
      { memberId: "bruno", amountMinor: 5000, currency: "BRL", splitRule: "equal" }
    ]);
  });

  it("distributes cents deterministically for R$100 between three members", () => {
    expect(splitEqual({ amountMinor: 10000, memberIds: ["caio", "ana", "bruno"] })).toEqual([
      { memberId: "ana", amountMinor: 3334, currency: "BRL", splitRule: "equal" },
      { memberId: "bruno", amountMinor: 3333, currency: "BRL", splitRule: "equal" },
      { memberId: "caio", amountMinor: 3333, currency: "BRL", splitRule: "equal" }
    ]);
  });

  it("keeps split sum equal to amount", () => {
    const splits = splitEqual({ amountMinor: 10001, memberIds: ["a", "b", "c"] });
    expect(total(splits)).toBe(10001);
  });

  it("does not mutate input order and always returns stable order", () => {
    const memberIds = ["caio", "ana", "bruno"];
    const splits = splitEqual({ amountMinor: 300, memberIds });
    expect(memberIds).toEqual(["caio", "ana", "bruno"]);
    expect(splits.map((split) => split.memberId)).toEqual(["ana", "bruno", "caio"]);
  });

  it("rejects duplicate members", () => {
    expect(() => splitEqual({ amountMinor: 100, memberIds: ["ana", "ana"] })).toThrow(
      DuplicateMemberError
    );
  });

  it("rejects an empty member list", () => {
    expect(() => splitEqual({ amountMinor: 100, memberIds: [] })).toThrow(EmptyMembersError);
  });
});

describe("splitByPercentages", () => {
  it("splits R$100 by 70/30 percentages", () => {
    expect(
      splitByPercentages({
        amountMinor: 10000,
        percentages: [
          { memberId: "ana", percentage: 70 },
          { memberId: "bruno", percentage: 30 }
        ]
      })
    ).toEqual([
      { memberId: "ana", amountMinor: 7000, currency: "BRL", splitRule: "percentage" },
      { memberId: "bruno", amountMinor: 3000, currency: "BRL", splitRule: "percentage" }
    ]);
  });

  it("supports decimal percentages and preserves the total", () => {
    const splits = splitByPercentages({
      amountMinor: 10000,
      percentages: [
        { memberId: "ana", percentage: 33.33 },
        { memberId: "bia", percentage: 33.33 },
        { memberId: "caio", percentage: 33.34 }
      ]
    });

    expect(splits).toEqual([
      { memberId: "ana", amountMinor: 3333, currency: "BRL", splitRule: "percentage" },
      { memberId: "bia", amountMinor: 3333, currency: "BRL", splitRule: "percentage" },
      { memberId: "caio", amountMinor: 3334, currency: "BRL", splitRule: "percentage" }
    ]);
    expect(total(splits)).toBe(10000);
  });

  it("rejects percentages summing to 99", () => {
    expect(() =>
      splitByPercentages({
        amountMinor: 100,
        percentages: [
          { memberId: "ana", percentage: 60 },
          { memberId: "bruno", percentage: 39 }
        ]
      })
    ).toThrow(InvalidPercentageError);
  });

  it("rejects percentages summing to 101", () => {
    expect(() =>
      splitByPercentages({
        amountMinor: 100,
        percentages: [
          { memberId: "ana", percentage: 60 },
          { memberId: "bruno", percentage: 41 }
        ]
      })
    ).toThrow(InvalidPercentageError);
  });

  it("rejects negative percentages", () => {
    expect(() =>
      splitByPercentages({
        amountMinor: 100,
        percentages: [{ memberId: "ana", percentage: -1 }]
      })
    ).toThrow(InvalidPercentageError);
  });

  it("rejects duplicate members", () => {
    expect(() =>
      splitByPercentages({
        amountMinor: 100,
        percentages: [
          { memberId: "ana", percentage: 50 },
          { memberId: "ana", percentage: 50 }
        ]
      })
    ).toThrow(DuplicateMemberError);
  });
});

describe("splitByShares", () => {
  it("splits R$300 by 2/1/1 shares", () => {
    expect(
      splitByShares({
        amountMinor: 30000,
        shares: [
          { memberId: "ana", shares: 2 },
          { memberId: "bruno", shares: 1 },
          { memberId: "caio", shares: 1 }
        ]
      })
    ).toEqual([
      { memberId: "ana", amountMinor: 15000, currency: "BRL", splitRule: "shares" },
      { memberId: "bruno", amountMinor: 7500, currency: "BRL", splitRule: "shares" },
      { memberId: "caio", amountMinor: 7500, currency: "BRL", splitRule: "shares" }
    ]);
  });

  it("rejects zero shares", () => {
    expect(() =>
      splitByShares({ amountMinor: 100, shares: [{ memberId: "ana", shares: 0 }] })
    ).toThrow(InvalidSharesError);
  });

  it("rejects negative shares", () => {
    expect(() =>
      splitByShares({ amountMinor: 100, shares: [{ memberId: "ana", shares: -1 }] })
    ).toThrow(InvalidSharesError);
  });

  it("rejects duplicate members", () => {
    expect(() =>
      splitByShares({
        amountMinor: 100,
        shares: [
          { memberId: "ana", shares: 1 },
          { memberId: "ana", shares: 1 }
        ]
      })
    ).toThrow(DuplicateMemberError);
  });
});

describe("splitByFixedAmounts", () => {
  it("accepts fixed amounts when the sum matches", () => {
    expect(
      splitByFixedAmounts({
        amountMinor: 10000,
        amounts: [
          { memberId: "ana", amountMinor: 6000 },
          { memberId: "bruno", amountMinor: 4000 }
        ]
      })
    ).toEqual([
      { memberId: "ana", amountMinor: 6000, currency: "BRL", splitRule: "fixed" },
      { memberId: "bruno", amountMinor: 4000, currency: "BRL", splitRule: "fixed" }
    ]);
  });

  it("rejects sums below total", () => {
    expect(() =>
      splitByFixedAmounts({
        amountMinor: 100,
        amounts: [{ memberId: "ana", amountMinor: 99 }]
      })
    ).toThrow(SplitTotalMismatchError);
  });

  it("rejects sums above total", () => {
    expect(() =>
      splitByFixedAmounts({
        amountMinor: 100,
        amounts: [{ memberId: "ana", amountMinor: 101 }]
      })
    ).toThrow(SplitTotalMismatchError);
  });

  it("rejects negative amounts", () => {
    expect(() =>
      splitByFixedAmounts({
        amountMinor: 100,
        amounts: [{ memberId: "ana", amountMinor: -1 }]
      })
    ).toThrow(InvalidMoneyError);
  });

  it("rejects float amounts", () => {
    expect(() =>
      splitByFixedAmounts({
        amountMinor: 100,
        amounts: [{ memberId: "ana", amountMinor: 10.5 }]
      })
    ).toThrow(InvalidMoneyError);
  });

  it("rejects duplicate members", () => {
    expect(() =>
      splitByFixedAmounts({
        amountMinor: 100,
        amounts: [
          { memberId: "ana", amountMinor: 50 },
          { memberId: "ana", amountMinor: 50 }
        ]
      })
    ).toThrow(DuplicateMemberError);
  });
});
