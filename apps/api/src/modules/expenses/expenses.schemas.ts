import { SplitRule } from "@ia-financeira/shared";
import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const expenseIdSchema = nonEmptyString;

export const createExpenseSchema = z.object({
  createdByUserId: nonEmptyString,
  payerMemberId: nonEmptyString,
  amountMinor: z.number().int().positive(),
  currency: nonEmptyString,
  description: nonEmptyString,
  category: nonEmptyString.optional(),
  expenseDate: z.string().datetime(),
  splitRule: z.nativeEnum(SplitRule),
  idempotencyKey: nonEmptyString.optional(),
  participants: z
    .array(
      z.object({
        memberId: nonEmptyString
      })
    )
    .min(1)
});

export const cancelExpenseSchema = z.object({
  actorUserId: nonEmptyString,
  reason: nonEmptyString.optional()
});

export const adjustExpenseSchema = createExpenseSchema.extend({
  actorUserId: nonEmptyString,
  reason: nonEmptyString.optional()
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CancelExpenseInput = z.infer<typeof cancelExpenseSchema>;
export type AdjustExpenseInput = z.infer<typeof adjustExpenseSchema>;
