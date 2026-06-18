import { randomUUID } from "node:crypto";

import * as core from "@ia-financeira/core";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PaymentStatus } from "@ia-financeira/shared";

import { parseWithSchema } from "../../common/validation/zod-validation.pipe.js";
import { DatabaseService } from "../../database/database.service.js";
import { spaceIdSchema } from "../spaces/spaces.schemas.js";
import { confirmPaymentSchema, type ConfirmPaymentInput } from "./payments.schemas.js";

@Injectable()
export class PaymentsService {
  constructor(private readonly database: DatabaseService) {}

  async confirm(
    spaceId: string,
    input: ConfirmPaymentInput
  ): Promise<{ ledgerEntry: unknown; payment: unknown }> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);
    const payload = parseWithSchema(confirmPaymentSchema, input);

    return this.database.transaction(async (database) => {
      const space = await database.space.findUnique({
        where: { id: parsedSpaceId }
      });

      if (!space) {
        throw new NotFoundException(`Space ${parsedSpaceId} was not found.`);
      }

      const currency = core.normalizeCurrency(payload.currency);

      if (core.normalizeCurrency(space.currency) !== currency) {
        throw new BadRequestException("Payment currency must match the space currency.");
      }

      if (payload.idempotencyKey) {
        const existingPayment = await database.payment.findUnique({
          where: { idempotencyKey: payload.idempotencyKey }
        });

        if (existingPayment) {
          const existingLedgerEntries = await database.ledgerEntry.findMany({
            where: {
              spaceId: parsedSpaceId,
              referenceId: existingPayment.id
            },
            orderBy: { createdAt: "asc" }
          });

          return {
            payment: existingPayment,
            ledgerEntry: existingLedgerEntries[0] ?? null
          };
        }
      }

      const members = await database.spaceMember.findMany({
        where: {
          spaceId: parsedSpaceId,
          id: { in: [payload.payerMemberId, payload.receiverMemberId] }
        }
      });

      if (members.length !== 2) {
        throw new BadRequestException("Payment members must belong to the target space.");
      }

      const paymentId = randomUUID();
      const confirmedAt = new Date();
      const ledgerEntry = core.applyPaymentToLedger({
        paymentId,
        spaceId: parsedSpaceId,
        payerMemberId: payload.payerMemberId,
        receiverMemberId: payload.receiverMemberId,
        amountMinor: payload.amountMinor,
        currency,
        createdAt: confirmedAt
      });
      const payment = await database.payment.create({
        data: {
          id: paymentId,
          spaceId: parsedSpaceId,
          payerMemberId: payload.payerMemberId,
          receiverMemberId: payload.receiverMemberId,
          amountMinor: payload.amountMinor,
          currency,
          status: PaymentStatus.Confirmed,
          idempotencyKey: payload.idempotencyKey ?? `payment:${paymentId}`,
          createdByUserId: payload.createdByUserId,
          confirmedByUserId: payload.createdByUserId,
          confirmedAt
        }
      });
      const savedLedgerEntry = await database.ledgerEntry.create({
        data: ledgerEntry
      });

      await database.auditLog.create({
        data: {
          actorUserId: payload.createdByUserId,
          spaceId: parsedSpaceId,
          action: "payment.confirmed",
          objectType: "payment",
          objectId: paymentId,
          after: {
            amountMinor: payload.amountMinor,
            currency,
            payerMemberId: payload.payerMemberId,
            receiverMemberId: payload.receiverMemberId
          }
        }
      });

      return {
        payment,
        ledgerEntry: savedLedgerEntry
      };
    });
  }
}
