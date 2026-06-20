import * as core from "@ia-financeira/core";
import { Injectable } from "@nestjs/common";

import { BalancesService } from "../balances/balances.service.js";

@Injectable()
export class SettlementService {
  constructor(private readonly balancesService: BalancesService) {}

  async getBySpaceId(spaceId: string): Promise<ReturnType<typeof core.simplifyDebts>> {
    const balances = await this.balancesService.getBySpaceId(spaceId);

    const memberNamesById = new Map(
      balances.map((balance) => [balance.memberId, balance.memberName])
    );

    return core
      .simplifyDebts({
        balances
      })
      .map((payment) => ({
        ...payment,
        fromMemberName: memberNamesById.get(payment.fromMemberId) ?? payment.fromMemberId,
        toMemberName: memberNamesById.get(payment.toMemberId) ?? payment.toMemberId,
        status: "manual_pending"
      }));
  }
}
