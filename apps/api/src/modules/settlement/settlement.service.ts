import * as core from "@ia-financeira/core";
import { Injectable } from "@nestjs/common";

import { BalancesService } from "../balances/balances.service.js";

@Injectable()
export class SettlementService {
  constructor(private readonly balancesService: BalancesService) {}

  async getBySpaceId(spaceId: string): Promise<ReturnType<typeof core.simplifyDebts>> {
    const balances = await this.balancesService.getBySpaceId(spaceId);

    return core.simplifyDebts({
      balances
    });
  }
}
