import * as core from "@ia-financeira/core";
import { BadRequestException, ConflictException } from "@nestjs/common";
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
    expect(createCall.data.ledgerEntries.create[0]).not.toHaveProperty("expenseId");
    expect(
      createCall.data.ledgerEntries.create.some(
        (entry) => entry.fromMemberId === "member-arthur" && entry.toMemberId === "member-arthur"
      )
    ).toBe(false);
  });

  it("cancels a confirmed expense with reversal ledger entries and audit log", async () => {
    const database = createDatabaseMock();
    const service = new ExpensesService(new DatabaseService(database as unknown as DatabaseClient));
    const originalExpense = {
      id: "expense-1",
      spaceId: "space-1",
      status: "confirmed",
      amountMinor: 48000,
      currency: "BRL",
      description: "Airbnb",
      category: "hospedagem",
      expenseDate: new Date("2026-06-18T00:00:00.000Z"),
      version: 1,
      parentExpenseId: null,
      cancelledAt: null,
      splits: [],
      ledgerEntries: [
        {
          id: "ledger-ana-arthur",
          spaceId: "space-1",
          eventId: "expense:expense-1",
          eventType: "expense_confirmed",
          fromMemberId: "member-ana",
          toMemberId: "member-arthur",
          amountMinor: 12000,
          currency: "BRL",
          referenceType: "expense",
          referenceId: "expense-1",
          createdAt: new Date("2026-06-18T12:00:00.000Z")
        }
      ]
    };

    database.expense.findUnique.mockResolvedValue(originalExpense);
    database.expense.update.mockResolvedValue({
      ...originalExpense,
      status: "cancelled",
      cancelledAt: new Date("2026-06-20T12:00:00.000Z")
    });
    database.ledgerEntry.createMany.mockResolvedValue({ count: 1 });
    database.auditLog.create.mockResolvedValue({ id: "audit-cancel" });

    const result = await service.cancel("space-1", "expense-1", {
      actorUserId: "user-1",
      reason: "Despesa lancada por engano"
    });

    expect(result).toMatchObject({
      expense: expect.objectContaining({ id: "expense-1", status: "cancelled" }),
      reversalLedgerEntries: [
        expect.objectContaining({
          eventType: "expense_cancelled",
          fromMemberId: "member-arthur",
          toMemberId: "member-ana",
          amountMinor: 12000,
          referenceId: "expense-1"
        })
      ]
    });
    expect(database.expense.update).toHaveBeenCalledWith({
      where: { id: "expense-1" },
      data: expect.objectContaining({ status: "cancelled", cancelledAt: expect.any(Date) }),
      include: { splits: true, ledgerEntries: true }
    });
    expect(database.ledgerEntry.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          eventType: "expense_cancelled",
          fromMemberId: "member-arthur",
          toMemberId: "member-ana",
          expenseId: "expense-1"
        })
      ]
    });
    expect(database.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "expense.cancelled",
        actorUserId: "user-1",
        objectId: "expense-1",
        objectType: "expense",
        spaceId: "space-1"
      })
    });
  });

  it("rejects cancelling an already cancelled expense clearly", async () => {
    const database = createDatabaseMock();
    const service = new ExpensesService(new DatabaseService(database as unknown as DatabaseClient));

    database.expense.findUnique.mockResolvedValue({
      id: "expense-1",
      spaceId: "space-1",
      status: "cancelled",
      ledgerEntries: []
    });

    await expect(
      service.cancel("space-1", "expense-1", {
        actorUserId: "user-1",
        reason: "duplicada"
      })
    ).rejects.toThrow(ConflictException);
  });

  it("adjusts an expense by preserving the original and creating a new version", async () => {
    const database = createDatabaseMock();
    const service = new ExpensesService(new DatabaseService(database as unknown as DatabaseClient));
    const originalExpense = {
      id: "expense-1",
      spaceId: "space-1",
      status: "confirmed",
      amountMinor: 48000,
      currency: "BRL",
      description: "Airbnb",
      category: "hospedagem",
      expenseDate: new Date("2026-06-18T00:00:00.000Z"),
      version: 1,
      parentExpenseId: null,
      cancelledAt: null,
      splits: [],
      ledgerEntries: [
        {
          id: "ledger-ana-arthur",
          spaceId: "space-1",
          eventId: "expense:expense-1",
          eventType: "expense_confirmed",
          fromMemberId: "member-ana",
          toMemberId: "member-arthur",
          amountMinor: 12000,
          currency: "BRL",
          referenceType: "expense",
          referenceId: "expense-1",
          createdAt: new Date("2026-06-18T12:00:00.000Z")
        }
      ]
    };
    const adjustedExpense = {
      id: "expense-adjusted",
      spaceId: "space-1",
      status: "confirmed",
      amountMinor: 50000,
      version: 2,
      parentExpenseId: "expense-1",
      splits: [],
      ledgerEntries: []
    };

    database.expense.findUnique.mockResolvedValue(originalExpense);
    database.space.findUnique.mockResolvedValue({ id: "space-1", currency: "BRL" });
    database.spaceMember.findMany.mockResolvedValue([
      { id: "member-arthur" },
      { id: "member-ana" }
    ]);
    database.expense.update.mockResolvedValue({ ...originalExpense, status: "adjusted" });
    database.expense.create.mockResolvedValue(adjustedExpense);
    database.ledgerEntry.createMany.mockResolvedValue({ count: 1 });
    database.auditLog.create.mockResolvedValue({ id: "audit-adjust" });

    const result = await service.adjust("space-1", "expense-1", {
      actorUserId: "user-1",
      createdByUserId: "user-1",
      payerMemberId: "member-arthur",
      amountMinor: 50000,
      currency: "BRL",
      description: "Airbnb corrigido",
      category: "hospedagem",
      expenseDate: "2026-06-20T00:00:00.000Z",
      splitRule: "equal",
      participants: [{ memberId: "member-arthur" }, { memberId: "member-ana" }],
      reason: "Valor corrigido"
    });

    expect(result).toMatchObject({
      originalExpense: expect.objectContaining({ id: "expense-1", status: "adjusted" }),
      adjustedExpense: expect.objectContaining({
        id: "expense-adjusted",
        parentExpenseId: "expense-1",
        version: 2
      }),
      reversalLedgerEntries: [
        expect.objectContaining({
          eventType: "expense_adjusted",
          fromMemberId: "member-arthur",
          toMemberId: "member-ana"
        })
      ]
    });
    expect(database.expense.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          parentExpenseId: "expense-1",
          version: 2,
          ledgerEntries: {
            create: expect.arrayContaining([
              expect.objectContaining({ eventType: "expense_adjusted" })
            ])
          }
        })
      })
    );
    expect(database.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "expense.adjusted",
        actorUserId: "user-1",
        objectId: "expense-1",
        objectType: "expense",
        spaceId: "space-1"
      })
    });
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
