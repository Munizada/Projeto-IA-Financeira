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
        { memberId: "member-arthur", balanceMinor: 12000, currency: "BRL" },
        { memberId: "member-bruno", balanceMinor: -6000, currency: "BRL" },
        { memberId: "member-caio", balanceMinor: -6000, currency: "BRL" },
        { memberId: "member-ana", balanceMinor: 0, currency: "BRL" }
      ])
    };
    const simplifySpy = vi.spyOn(core, "simplifyDebts");
    const service = new SettlementService(balanceService as unknown as BalancesService);

    await expect(service.getBySpaceId("space-1")).resolves.toEqual([
      {
        fromMemberId: "member-bruno",
        toMemberId: "member-arthur",
        amountMinor: 6000,
        currency: "BRL"
      },
      {
        fromMemberId: "member-caio",
        toMemberId: "member-arthur",
        amountMinor: 6000,
        currency: "BRL"
      }
    ]);
    expect(simplifySpy).toHaveBeenCalled();
  });
});
