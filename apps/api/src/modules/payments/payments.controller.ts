import { Body, Controller, Param, Post } from "@nestjs/common";

import { ZodValidationPipe } from "../../common/validation/zod-validation.pipe.js";
import { spaceIdSchema } from "../spaces/spaces.schemas.js";
import { confirmPaymentSchema, type ConfirmPaymentInput } from "./payments.schemas.js";
import { PaymentsService } from "./payments.service.js";

@Controller("spaces/:spaceId/payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("confirm")
  confirm(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string,
    @Body(new ZodValidationPipe(confirmPaymentSchema))
    body: ConfirmPaymentInput
  ): Promise<{ ledgerEntry: unknown; payment: unknown }> {
    return this.paymentsService.confirm(spaceId, body);
  }
}
