import * as core from "@ia-financeira/core";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DatabaseService, type DatabaseClient } from "../src/database/database.service.js";
import { PaymentsService } from "../src/modules/payments/payments.service.js";
import { createDatabaseMock } from "./test-helpers.js";

describe("PaymentsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("confirms payment, creates reverse ledger entry and uses the core", async () => {
    const database = createDatabaseMock();
    const service = new PaymentsService(new DatabaseService(database as unknown as DatabaseClient));
    const applySpy = vi.spyOn(core, "applyPaymentToLedger");
    const payment = {
      id: "payment-1",
      amountMinor: 12000
    };
    const ledgerEntry = {
      id: "ledger-payment-1",
      fromMemberId: "member-arthur",
      toMemberId: "member-bruno",
      amountMinor: 12000
    };

    database.space.findUnique.mockResolvedValue({
      id: "space-1",
      currency: "BRL"
    });
    database.spaceMember.findMany.mockResolvedValue([
      { id: "member-bruno" },
      { id: "member-arthur" }
    ]);
    database.payment.create.mockResolvedValue(payment);
    database.ledgerEntry.create.mockResolvedValue(ledgerEntry);
    database.auditLog.create.mockResolvedValue({ id: "audit-1" });

    const result = await service.confirm("space-1", {
      payerMemberId: "member-bruno",
      receiverMemberId: "member-arthur",
      amountMinor: 12000,
      currency: "BRL",
      createdByUserId: "user-1"
    });

    expect(result).toEqual({
      payment,
      ledgerEntry
    });
    expect(applySpy).toHaveBeenCalled();
    expect(database.ledgerEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amountMinor: 12000,
        fromMemberId: "member-arthur",
        toMemberId: "member-bruno"
      })
    });
  });

  it("rejects identical payer and receiver", async () => {
    const database = createDatabaseMock();
    const service = new PaymentsService(new DatabaseService(database as unknown as DatabaseClient));

    await expect(
      service.confirm("space-1", {
        payerMemberId: "member-bruno",
        receiverMemberId: "member-bruno",
        amountMinor: 12000,
        currency: "BRL",
        createdByUserId: "user-1"
      })
    ).rejects.toThrow(BadRequestException);
  });
});
