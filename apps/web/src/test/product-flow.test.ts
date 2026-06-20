import { describe, expect, it } from "vitest";

import { buildEqualSplitExpensePayload, parseReaisToAmountMinor } from "../lib/product-flow";

describe("product flow helpers", () => {
  it("converts reais input to amountMinor without float math", () => {
    expect(parseReaisToAmountMinor("123,45")).toBe(12345);
    expect(parseReaisToAmountMinor("10.00")).toBe(1000);
    expect(parseReaisToAmountMinor("7")).toBe(700);
  });

  it("rejects invalid money input", () => {
    expect(() => parseReaisToAmountMinor("0")).toThrow("Valor precisa ser maior que zero");
    expect(() => parseReaisToAmountMinor("12,345")).toThrow("Valor em reais invalido");
  });

  it("builds an equal split expense payload from form data", () => {
    const formData = new FormData();
    formData.set("createdByUserId", "user-arthur");
    formData.set("payerMemberId", "member-arthur");
    formData.set("amountReais", "48,00");
    formData.set("currency", "BRL");
    formData.set("description", "Jantar");
    formData.set("category", "alimentacao");
    formData.set("expenseDate", "2026-06-20");
    formData.append("participants", "member-arthur");
    formData.append("participants", "member-ana");

    expect(buildEqualSplitExpensePayload(formData)).toEqual({
      createdByUserId: "user-arthur",
      payerMemberId: "member-arthur",
      amountMinor: 4800,
      currency: "BRL",
      description: "Jantar",
      category: "alimentacao",
      expenseDate: "2026-06-20T00:00:00.000Z",
      splitRule: "equal",
      participants: [{ memberId: "member-arthur" }, { memberId: "member-ana" }]
    });
  });
});
