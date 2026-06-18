import type { LedgerEntry } from "@ia-financeira/shared";
import { LedgerEventType, LedgerReferenceType } from "@ia-financeira/shared";

import { InvalidPaymentError } from "./errors.js";
import { normalizeCurrency } from "./money.js";

export function applyPaymentToLedger(params: {
  paymentId: string;
  spaceId: string;
  payerMemberId: string;
  receiverMemberId: string;
  amountMinor: number;
  currency?: string;
  eventId?: string;
  createdAt?: Date;
}): LedgerEntry {
  const paymentId = requirePaymentId(params.paymentId, "paymentId");
  const spaceId = requirePaymentId(params.spaceId, "spaceId");
  const payerMemberId = requirePaymentId(params.payerMemberId, "payerMemberId");
  const receiverMemberId = requirePaymentId(params.receiverMemberId, "receiverMemberId");
  const currency = normalizePaymentCurrency(params.currency ?? "BRL");
  const eventId = params.eventId ?? `payment:${paymentId}`;

  if (payerMemberId === receiverMemberId) {
    throw new InvalidPaymentError("Payer and receiver cannot be the same member.");
  }

  if (!Number.isInteger(params.amountMinor) || params.amountMinor <= 0) {
    throw new InvalidPaymentError("Payment amountMinor must be a positive integer.");
  }

  return {
    id: `${eventId}:${receiverMemberId}:${payerMemberId}`,
    spaceId,
    eventId,
    eventType: LedgerEventType.PaymentConfirmed,
    fromMemberId: receiverMemberId,
    toMemberId: payerMemberId,
    amountMinor: params.amountMinor,
    currency,
    referenceType: LedgerReferenceType.Payment,
    referenceId: paymentId,
    createdAt: params.createdAt ?? new Date(0)
  };
}

function requirePaymentId(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new InvalidPaymentError(`${fieldName} cannot be empty.`);
  }

  return normalized;
}

function normalizePaymentCurrency(currency: string): string {
  try {
    return normalizeCurrency(currency);
  } catch {
    throw new InvalidPaymentError("Payment currency cannot be empty.");
  }
}
