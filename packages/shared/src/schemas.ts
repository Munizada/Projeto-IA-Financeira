import { z } from "zod";

import { LedgerEventType, LedgerReferenceType, SplitRule } from "./enums.js";

const nonEmptyString = z.string().trim().min(1);
const amountMinor = z.number().int();
const nonNegativeAmountMinor = amountMinor.min(0);

export const moneySchema = z.object({
  amountMinor: nonNegativeAmountMinor,
  currency: nonEmptyString
});

export const memberSchema = z.object({
  id: nonEmptyString,
  displayName: nonEmptyString
});

export const expenseSplitSchema = z.object({
  memberId: nonEmptyString,
  amountMinor: nonNegativeAmountMinor,
  currency: nonEmptyString,
  splitRule: z.nativeEnum(SplitRule)
});

export const ledgerEntrySchema = z.object({
  id: nonEmptyString,
  spaceId: nonEmptyString,
  eventId: nonEmptyString,
  eventType: z.nativeEnum(LedgerEventType),
  fromMemberId: nonEmptyString,
  toMemberId: nonEmptyString,
  amountMinor: nonNegativeAmountMinor,
  currency: nonEmptyString,
  referenceType: z.nativeEnum(LedgerReferenceType),
  referenceId: nonEmptyString,
  createdAt: z.date()
});

export const balanceSchema = z.object({
  memberId: nonEmptyString,
  balanceMinor: amountMinor,
  currency: nonEmptyString
});

export const settlementPaymentSchema = z.object({
  fromMemberId: nonEmptyString,
  toMemberId: nonEmptyString,
  amountMinor: nonNegativeAmountMinor,
  currency: nonEmptyString
});
