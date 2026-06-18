import { Controller, Get, Param } from "@nestjs/common";

import { ZodValidationPipe } from "../../common/validation/zod-validation.pipe.js";
import { spaceIdSchema } from "../spaces/spaces.schemas.js";
import { BalancesService } from "./balances.service.js";

@Controller("spaces/:spaceId/balances")
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get()
  getBySpaceId(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string
  ) {
    return this.balancesService.getBySpaceId(spaceId);
  }
}
