import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const confirmPaymentSchema = z
  .object({
    payerMemberId: nonEmptyString,
    receiverMemberId: nonEmptyString,
    amountMinor: z.number().int().positive(),
    currency: nonEmptyString,
    createdByUserId: nonEmptyString,
    idempotencyKey: nonEmptyString.optional()
  })
  .refine((value) => value.payerMemberId !== value.receiverMemberId, {
    path: ["receiverMemberId"],
    message: "payerMemberId and receiverMemberId must differ."
  });

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
