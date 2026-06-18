import * as core from "@ia-financeira/core";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DatabaseService, type DatabaseClient } from "../src/database/database.service.js";
import { ExpensesService } from "../src/modules/expenses/expenses.service.js";
import { createDatabaseMock } from "./test-helpers.js";

describe("ExpensesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates equal split expense through the core and persists splits and ledger entries", async () => {
    const database = createDatabaseMock();
    const service = new ExpensesService(new DatabaseService(database as unknown as DatabaseClient));
    const splitSpy = vi.spyOn(core, "splitEqual");
    const createdExpense = {
      id: "expense-1",
      spaceId: "space-1",
      splits: [
        { memberId: "member-ana", amountMinor: 12000 },
        { memberId: "member-arthur", amountMinor: 12000 },
        { memberId: "member-bruno", amountMinor: 12000 },
        { memberId: "member-caio", amountMinor: 12000 }
      ],
      ledgerEntries: [
        { fromMemberId: "member-ana", toMemberId: "member-arthur", amountMinor: 12000 },
        { fromMemberId: "member-bruno", toMemberId: "member-arthur", amountMinor: 12000 },
        { fromMemberId: "member-caio", toMemberId: "member-arthur", amountMinor: 12000 }
      ]
    };

    database.space.findUnique.mockResolvedValue({
      id: "space-1",
      currency: "BRL"
    });
    database.spaceMember.findMany.mockResolvedValue([
      { id: "member-arthur" },
      { id: "member-ana" },
      { id: "member-bruno" },
      { id: "member-caio" }
    ]);
    database.expense.create.mockResolvedValue(createdExpense);
    database.auditLog.create.mockResolvedValue({ id: "audit-1" });

    const result = await service.create("space-1", {
      createdByUserId: "user-1",
      payerMemberId: "member-arthur",
      amountMinor: 48000,
      currency: "BRL",
      description: "Airbnb",
      category: "hospedagem",
      expenseDate: "2026-06-18T00:00:00.000Z",
      splitRule: "equal",
      participants: [
        { memberId: "member-arthur" },
        { memberId: "member-ana" },
        { memberId: "member-bruno" },
        { memberId: "member-caio" }
      ]
    });

    const createCall = database.expense.create.mock.calls[0]?.[0] as {
      data: {
        ledgerEntries: {
          create: Array<{ amountMinor: number; fromMemberId: string; toMemberId: string }>;
        };
        splits: {
          create: Array<{ amountMinor: number; memberId: string }>;
        };
      };
    };

    expect(result).toEqual(createdExpense);
    expect(splitSpy).toHaveBeenCalledWith({
      amountMinor: 48000,
      currency: "BRL",
      memberIds: ["member-arthur", "member-ana", "member-bruno", "member-caio"]
    });
    expect(createCall.data.splits.create).toHaveLength(4);
    expect(createCall.data.ledgerEntries.create).toHaveLength(3);
    expect(
      createCall.data.ledgerEntries.create.some(
        (entry) => entry.fromMemberId === "member-arthur" && entry.toMemberId === "member-arthur"
      )
    ).toBe(false);
  });

  it("rejects float amountMinor", async () => {
    const database = createDatabaseMock();
    const service = new ExpensesService(new DatabaseService(database as unknown as DatabaseClient));

    await expect(
      service.create("space-1", {
        createdByUserId: "user-1",
        payerMemberId: "member-arthur",
        amountMinor: 10.5,
        currency: "BRL",
        description: "Airbnb",
        expenseDate: "2026-06-18T00:00:00.000Z",
        splitRule: "equal",
        participants: [{ memberId: "member-arthur" }]
      })
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects empty participants", async () => {
    const database = createDatabaseMock();
    const service = new ExpensesService(new DatabaseService(database as unknown as DatabaseClient));

    await expect(
      service.create("space-1", {
        createdByUserId: "user-1",
        payerMemberId: "member-arthur",
        amountMinor: 48000,
        currency: "BRL",
        description: "Airbnb",
        expenseDate: "2026-06-18T00:00:00.000Z",
        splitRule: "equal",
        participants: []
      })
    ).rejects.toThrow(BadRequestException);
  });
});
