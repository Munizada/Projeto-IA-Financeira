import { Module } from "@nestjs/common";

import { BalancesModule } from "../balances/balances.module.js";
import { SettlementController } from "./settlement.controller.js";
import { SettlementService } from "./settlement.service.js";

@Module({
  imports: [BalancesModule],
  controllers: [SettlementController],
  providers: [SettlementService]
})
export class SettlementModule {}
