import { describe, expect, it } from "vitest";

import { formatAmountMinorBRL } from "../lib/money";

describe("formatAmountMinorBRL", () => {
  it("formats 0 as BRL", () => {
    expect(formatAmountMinorBRL(0)).toBe("R$ 0,00");
  });

  it("formats 1 as BRL cents", () => {
    expect(formatAmountMinorBRL(1)).toBe("R$ 0,01");
  });

  it("formats 1050 as BRL", () => {
    expect(formatAmountMinorBRL(1050)).toBe("R$ 10,50");
  });

  it("formats 48000 as BRL", () => {
    expect(formatAmountMinorBRL(48000)).toBe("R$ 480,00");
  });

  it("rejects invalid amountMinor", () => {
    expect(() => formatAmountMinorBRL(10.5)).toThrow();
  });
});
