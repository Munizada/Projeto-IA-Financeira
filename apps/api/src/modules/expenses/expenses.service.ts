import { randomUUID } from "node:crypto";

import * as core from "@ia-financeira/core";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ExpenseStatus, SplitRule } from "@ia-financeira/shared";

import { parseWithSchema } from "../../common/validation/zod-validation.pipe.js";
import { DatabaseService, type DatabaseOperationClient } from "../../database/database.service.js";
import { spaceIdSchema } from "../spaces/spaces.schemas.js";
import {
  createExpenseSchema,
  expenseIdSchema,
  type CreateExpenseInput
} from "./expenses.schemas.js";

type ExpenseWithRelations = Awaited<ReturnType<DatabaseOperationClient["expense"]["create"]>>;

@Injectable()
export class ExpensesService {
  constructor(private readonly database: DatabaseService) {}

  async create(spaceId: string, input: CreateExpenseInput): Promise<ExpenseWithRelations> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);
    const payload = parseWithSchema(createExpenseSchema, input);

    if (payload.splitRule !== SplitRule.Equal) {
      throw new BadRequestException("Only equal split is supported in this stage.");
    }

    return this.database.transaction(async (database) => {
      const space = await database.space.findUnique({
        where: { id: parsedSpaceId }
      });

      if (!space) {
        throw new NotFoundException(`Space ${parsedSpaceId} was not found.`);
      }

      const currency = core.normalizeCurrency(payload.currency);

      if (core.normalizeCurrency(space.currency) !== currency) {
        throw new BadRequestException("Expense currency must match the space currency.");
      }

      if (payload.idempotencyKey) {
        const existingExpense = await database.expense.findUnique({
          where: { idempotencyKey: payload.idempotencyKey },
          include: { splits: true, ledgerEntries: true }
        });

        if (existingExpense) {
          return existingExpense;
        }
      }

      const participantIds = payload.participants.map((participant) => participant.memberId);
      const relatedMemberIds = uniqueValues([payload.payerMemberId, ...participantIds]);
      const members = await database.spaceMember.findMany({
        where: {
          spaceId: parsedSpaceId,
          id: { in: relatedMemberIds }
        }
      });

      if (members.length !== relatedMemberIds.length) {
        throw new BadRequestException("Expense members must belong to the target space.");
      }

      const expenseId = randomUUID();
      const createdAt = new Date(payload.expenseDate);
      const confirmedAt = new Date();
      const splits = core.splitEqual({
        amountMinor: payload.amountMinor,
        currency,
        memberIds: participantIds
      });
      const ledgerEntries = core.createLedgerEntriesFromExpense({
        expenseId,
        spaceId: parsedSpaceId,
        payerMemberId: payload.payerMemberId,
        splits,
        currency,
        createdAt: confirmedAt
      });
      const expense = await database.expense.create({
        data: {
          id: expenseId,
          spaceId: parsedSpaceId,
          createdByUserId: payload.createdByUserId,
          payerMemberId: payload.payerMemberId,
          amountMinor: payload.amountMinor,
          currency,
          description: payload.description,
          category: payload.category ?? null,
          expenseDate: createdAt,
          status: ExpenseStatus.Confirmed,
          source: "web",
          confirmedAt,
          ...(payload.idempotencyKey ? { idempotencyKey: payload.idempotencyKey } : {}),
          splits: {
            create: splits.map((split) => ({
              memberId: split.memberId,
              amountMinor: split.amountMinor,
              currency: split.currency,
              splitRule: split.splitRule
            }))
          },
          ledgerEntries: {
            create: ledgerEntries.map((entry) => ({
              id: entry.id,
              spaceId: entry.spaceId,
              eventId: entry.eventId,
              eventType: entry.eventType,
              fromMemberId: entry.fromMemberId,
              toMemberId: entry.toMemberId,
              amountMinor: entry.amountMinor,
              currency: entry.currency,
              referenceType: entry.referenceType,
              referenceId: entry.referenceId,
              expenseId,
              createdAt: entry.createdAt
            }))
          }
        },
        include: {
          splits: true,
          ledgerEntries: true
        }
      });

      await database.auditLog.create({
        data: {
          actorUserId: payload.createdByUserId,
          spaceId: parsedSpaceId,
          action: "expense.confirmed",
          objectType: "expense",
          objectId: expenseId,
          after: {
            amountMinor: payload.amountMinor,
            currency,
            payerMemberId: payload.payerMemberId,
            participantIds
          }
        }
      });

      return expense;
    });
  }

  async listBySpace(spaceId: string): Promise<unknown[]> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);

    await this.ensureSpaceExists(parsedSpaceId);

    return this.database.expense.findMany({
      where: { spaceId: parsedSpaceId },
      include: { splits: true, ledgerEntries: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async getById(spaceId: string, expenseId: string): Promise<unknown> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);
    const parsedExpenseId = parseWithSchema(expenseIdSchema, expenseId);
    const expense = await this.database.expense.findUnique({
      where: { id: parsedExpenseId },
      include: { splits: true, ledgerEntries: true }
    });

    if (!expense || expense.spaceId !== parsedSpaceId) {
      throw new NotFoundException(
        `Expense ${parsedExpenseId} was not found in space ${parsedSpaceId}.`
      );
    }

    return expense;
  }

  private async ensureSpaceExists(spaceId: string): Promise<void> {
    const space = await this.database.space.findUnique({
      where: { id: spaceId }
    });

    if (!space) {
      throw new NotFoundException(`Space ${spaceId} was not found.`);
    }
  }
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}
