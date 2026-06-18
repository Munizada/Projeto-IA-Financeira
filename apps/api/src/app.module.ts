import { Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { DatabaseModule } from "./database/database.module.js";
import { BalancesModule } from "./modules/balances/balances.module.js";
import { ExpensesModule } from "./modules/expenses/expenses.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { MembersModule } from "./modules/members/members.module.js";
import { PaymentsModule } from "./modules/payments/payments.module.js";
import { SettlementModule } from "./modules/settlement/settlement.module.js";
import { SpacesModule } from "./modules/spaces/spaces.module.js";

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    SpacesModule,
    MembersModule,
    ExpensesModule,
    BalancesModule,
    SettlementModule,
    PaymentsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
