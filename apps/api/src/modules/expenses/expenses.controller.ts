import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { ZodValidationPipe } from "../../common/validation/zod-validation.pipe.js";
import { spaceIdSchema } from "../spaces/spaces.schemas.js";
import {
  adjustExpenseSchema,
  cancelExpenseSchema,
  createExpenseSchema,
  expenseIdSchema,
  type AdjustExpenseInput,
  type CancelExpenseInput,
  type CreateExpenseInput
} from "./expenses.schemas.js";
import { ExpensesService } from "./expenses.service.js";

@Controller("spaces/:spaceId/expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string,
    @Body(new ZodValidationPipe(createExpenseSchema))
    body: CreateExpenseInput
  ): Promise<unknown> {
    return this.expensesService.create(spaceId, body);
  }

  @Get()
  listBySpace(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string
  ): Promise<unknown[]> {
    return this.expensesService.listBySpace(spaceId);
  }

  @Get(":expenseId")
  getById(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string,
    @Param("expenseId", new ZodValidationPipe(expenseIdSchema))
    expenseId: string
  ): Promise<unknown> {
    return this.expensesService.getById(spaceId, expenseId);
  }

  @Post(":expenseId/cancel")
  cancel(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string,
    @Param("expenseId", new ZodValidationPipe(expenseIdSchema))
    expenseId: string,
    @Body(new ZodValidationPipe(cancelExpenseSchema))
    body: CancelExpenseInput
  ): Promise<unknown> {
    return this.expensesService.cancel(spaceId, expenseId, body);
  }

  @Post(":expenseId/adjust")
  adjust(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string,
    @Param("expenseId", new ZodValidationPipe(expenseIdSchema))
    expenseId: string,
    @Body(new ZodValidationPipe(adjustExpenseSchema))
    body: AdjustExpenseInput
  ): Promise<unknown> {
    return this.expensesService.adjust(spaceId, expenseId, body);
  }
}
