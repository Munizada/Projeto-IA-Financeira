import { describe, expect, it } from "vitest";

import {
  assertSameCurrency,
  createMoney,
  CurrencyMismatchError,
  formatMoneyBRL,
  InvalidMoneyError,
  sumMoney
} from "../src/index.js";

describe("money", () => {
  it("accepts zero", () => {
    expect(createMoney(0)).toEqual({ amountMinor: 0, currency: "BRL" });
  });

  it("accepts a positive integer", () => {
    expect(createMoney(1050, "BRL")).toEqual({ amountMinor: 1050, currency: "BRL" });
  });

  it("rejects float amounts", () => {
    expect(() => createMoney(10.5)).toThrow(InvalidMoneyError);
  });

  it("rejects negative amounts", () => {
    expect(() => createMoney(-1)).toThrow(InvalidMoneyError);
  });

  it("rejects empty currency", () => {
    expect(() => createMoney(100, " ")).toThrow(InvalidMoneyError);
  });

  it.each([
    [0, "R$ 0,00"],
    [1, "R$ 0,01"],
    [1050, "R$ 10,50"],
    [10000, "R$ 100,00"]
  ])("formats %i minor units as %s", (amountMinor, expected) => {
    expect(formatMoneyBRL(amountMinor)).toBe(expected);
  });

  it("requires BRL when formatting Money", () => {
    expect(() => formatMoneyBRL({ amountMinor: 100, currency: "USD" })).toThrow(
      CurrencyMismatchError
    );
  });

  it("assertSameCurrency accepts matching currencies", () => {
    expect(() =>
      assertSameCurrency(createMoney(100, "BRL"), createMoney(200, "BRL"))
    ).not.toThrow();
  });

  it("assertSameCurrency rejects different currencies", () => {
    expect(() => assertSameCurrency(createMoney(100, "BRL"), createMoney(200, "USD"))).toThrow(
      CurrencyMismatchError
    );
  });

  it("sumMoney returns zero BRL for an empty list", () => {
    expect(sumMoney([])).toEqual({ amountMinor: 0, currency: "BRL" });
  });

  it("sumMoney adds matching currencies", () => {
    expect(sumMoney([createMoney(100), createMoney(250)])).toEqual({
      amountMinor: 350,
      currency: "BRL"
    });
  });

  it("sumMoney rejects mixed currencies", () => {
    expect(() => sumMoney([createMoney(100, "BRL"), createMoney(100, "USD")])).toThrow(
      CurrencyMismatchError
    );
  });
});
