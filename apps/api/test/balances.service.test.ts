import * as core from "@ia-financeira/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DatabaseService, type DatabaseClient } from "../src/database/database.service.js";
import { BalancesService } from "../src/modules/balances/balances.service.js";
import { createDatabaseMock } from "./test-helpers.js";

describe("BalancesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates balances through the core and keeps zero-balance members", async () => {
    const database = createDatabaseMock();
    const service = new BalancesService(new DatabaseService(database as unknown as DatabaseClient));
    const calculateSpy = vi.spyOn(core, "calculateBalances");

    database.space.findUnique.mockResolvedValue({
      id: "space-1",
      currency: "BRL"
    });
    database.spaceMember.findMany.mockResolvedValue([
      { id: "member-arthur", nickname: "Arthur", user: { displayName: "Arthur" } },
      { id: "member-bruno", nickname: "Bruno", user: { displayName: "Bruno" } },
      { id: "member-caio", nickname: "Caio", user: { displayName: "Caio" } }
    ]);
    database.ledgerEntry.findMany.mockResolvedValue([
      {
        id: "ledger-1",
        spaceId: "space-1",
        eventId: "event-1",
        eventType: "expense_confirmed",
        fromMemberId: "member-bruno",
        toMemberId: "member-arthur",
        amountMinor: 6000,
        currency: "BRL",
        referenceType: "expense",
        referenceId: "expense-1",
        createdAt: new Date("2026-06-18T00:00:00.000Z")
      }
    ]);

    const balances = await service.getBySpaceId("space-1");

    expect(calculateSpy).toHaveBeenCalled();
    expect(balances).toEqual([
      { memberId: "member-arthur", memberName: "Arthur", balanceMinor: 6000, currency: "BRL" },
      { memberId: "member-bruno", memberName: "Bruno", balanceMinor: -6000, currency: "BRL" },
      { memberId: "member-caio", memberName: "Caio", balanceMinor: 0, currency: "BRL" }
    ]);
  });
});
