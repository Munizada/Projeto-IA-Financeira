import { Module } from "@nestjs/common";

import { DatabaseModule } from "../../database/database.module.js";
import { SpacesController } from "./spaces.controller.js";
import { SpacesService } from "./spaces.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService]
})
export class SpacesModule {}
