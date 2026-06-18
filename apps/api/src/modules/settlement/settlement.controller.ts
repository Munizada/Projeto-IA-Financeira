import { Controller, Get, Param } from "@nestjs/common";

import { ZodValidationPipe } from "../../common/validation/zod-validation.pipe.js";
import { spaceIdSchema } from "../spaces/spaces.schemas.js";
import { SettlementService } from "./settlement.service.js";

@Controller("spaces/:spaceId/settlement")
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get()
  getBySpaceId(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string
  ) {
    return this.settlementService.getBySpaceId(spaceId);
  }
}
