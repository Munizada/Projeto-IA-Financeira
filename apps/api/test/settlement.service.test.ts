import * as core from "@ia-financeira/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BalancesService } from "../src/modules/balances/balances.service.js";
import { SettlementService } from "../src/modules/settlement/settlement.service.js";

describe("SettlementService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates settlement through simplifyDebts and ignores zero balances", async () => {
    const balanceService = {
      getBySpaceId: vi.fn().mockResolvedValue([
        { memberId: "member-arthur", memberName: "Arthur", balanceMinor: 12000, currency: "BRL" },
        { memberId: "member-bruno", memberName: "Bruno", balanceMinor: -6000, currency: "BRL" },
        { memberId: "member-caio", memberName: "Caio", balanceMinor: -6000, currency: "BRL" },
        { memberId: "member-ana", memberName: "Ana", balanceMinor: 0, currency: "BRL" }
      ])
    };
    const simplifySpy = vi.spyOn(core, "simplifyDebts");
    const service = new SettlementService(balanceService as unknown as BalancesService);

    await expect(service.getBySpaceId("space-1")).resolves.toEqual([
      {
        fromMemberId: "member-bruno",
        fromMemberName: "Bruno",
        toMemberId: "member-arthur",
        toMemberName: "Arthur",
        amountMinor: 6000,
        currency: "BRL",
        status: "manual_pending"
      },
      {
        fromMemberId: "member-caio",
        fromMemberName: "Caio",
        toMemberId: "member-arthur",
        toMemberName: "Arthur",
        amountMinor: 6000,
        currency: "BRL",
        status: "manual_pending"
      }
    ]);
    expect(simplifySpy).toHaveBeenCalled();
  });
});
