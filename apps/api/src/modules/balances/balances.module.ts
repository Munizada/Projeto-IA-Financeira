import { Module } from "@nestjs/common";

import { DatabaseModule } from "../../database/database.module.js";
import { BalancesController } from "./balances.controller.js";
import { BalancesService } from "./balances.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [BalancesController],
  providers: [BalancesService],
  exports: [BalancesService]
})
export class BalancesModule {}
