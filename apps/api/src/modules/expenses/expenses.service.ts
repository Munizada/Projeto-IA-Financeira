import { randomUUID } from "node:crypto";

import * as core from "@ia-financeira/core";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  ExpenseStatus,
  LedgerEventType,
  LedgerReferenceType,
  SplitRule,
  type LedgerEntry
} from "@ia-financeira/shared";

import { parseWithSchema } from "../../common/validation/zod-validation.pipe.js";
import { DatabaseService, type DatabaseOperationClient } from "../../database/database.service.js";
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

      await ensureExpenseMembersBelongToSpace(database, parsedSpaceId, payload);

      const participantIds = payload.participants.map((participant) => participant.memberId);
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
          action: "expense.created",
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

  async cancel(spaceId: string, expenseId: string, input: CancelExpenseInput): Promise<unknown> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);
    const parsedExpenseId = parseWithSchema(expenseIdSchema, expenseId);
    const payload = parseWithSchema(cancelExpenseSchema, input);

    return this.database.transaction(async (database) => {
      const expense = await findExpenseForMutation(database, parsedSpaceId, parsedExpenseId);

      if (expense.status === ExpenseStatus.Cancelled) {
        throw new ConflictException(`Expense ${parsedExpenseId} is already cancelled.`);
      }

      if (expense.status === ExpenseStatus.Adjusted) {
        throw new ConflictException(`Expense ${parsedExpenseId} was already adjusted.`);
      }

      const cancelledAt = new Date();
      const reversalLedgerEntries = core.createReversalLedgerEntries({
        originalEntries: expense.ledgerEntries.map(mapLedgerEntryForCore),
        eventType: LedgerEventType.ExpenseCancelled,
        referenceType: LedgerReferenceType.Expense,
        referenceId: parsedExpenseId,
        eventId: `expense:${parsedExpenseId}:cancelled:${randomUUID()}`,
        createdAt: cancelledAt
      });

      const updatedExpense = await database.expense.update({
        where: { id: parsedExpenseId },
        data: {
          status: ExpenseStatus.Cancelled,
          cancelledAt
        },
        include: { splits: true, ledgerEntries: true }
      });

      if (reversalLedgerEntries.length > 0) {
        await database.ledgerEntry.createMany({
          data: reversalLedgerEntries.map((entry) => mapLedgerCreateData(entry, parsedExpenseId))
        });
      }

      await database.auditLog.create({
        data: {
          actorUserId: payload.actorUserId,
          spaceId: parsedSpaceId,
          action: "expense.cancelled",
          objectType: "expense",
          objectId: parsedExpenseId,
          before: {
            status: expense.status,
            amountMinor: expense.amountMinor,
            version: expense.version
          },
          after: {
            status: ExpenseStatus.Cancelled,
            cancelledAt: cancelledAt.toISOString(),
            reason: payload.reason ?? null
          }
        }
      });

      return { expense: updatedExpense, reversalLedgerEntries };
    });
  }

  async adjust(spaceId: string, expenseId: string, input: AdjustExpenseInput): Promise<unknown> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);
    const parsedExpenseId = parseWithSchema(expenseIdSchema, expenseId);
    const payload = parseWithSchema(adjustExpenseSchema, input);

    if (payload.splitRule !== SplitRule.Equal) {
      throw new BadRequestException("Only equal split is supported in this stage.");
    }

    return this.database.transaction(async (database) => {
      const originalExpense = await findExpenseForMutation(
        database,
        parsedSpaceId,
        parsedExpenseId
      );

      if (originalExpense.status === ExpenseStatus.Cancelled) {
        throw new ConflictException(
          `Expense ${parsedExpenseId} is cancelled and cannot be adjusted.`
        );
      }

      if (originalExpense.status === ExpenseStatus.Adjusted) {
        throw new ConflictException(`Expense ${parsedExpenseId} was already adjusted.`);
      }

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

      await ensureExpenseMembersBelongToSpace(database, parsedSpaceId, payload);

      const adjustedAt = new Date();
      const reversalLedgerEntries = core.createReversalLedgerEntries({
        originalEntries: originalExpense.ledgerEntries.map(mapLedgerEntryForCore),
        eventType: LedgerEventType.ExpenseAdjusted,
        referenceType: LedgerReferenceType.Expense,
        referenceId: parsedExpenseId,
        eventId: `expense:${parsedExpenseId}:adjusted-reversal:${randomUUID()}`,
        createdAt: adjustedAt
      });
      const adjustedExpenseId = randomUUID();
      const participantIds = payload.participants.map((participant) => participant.memberId);
      const splits = core.splitEqual({
        amountMinor: payload.amountMinor,
        currency,
        memberIds: participantIds
      });
      const ledgerEntries = core
        .createLedgerEntriesFromExpense({
          expenseId: adjustedExpenseId,
          spaceId: parsedSpaceId,
          payerMemberId: payload.payerMemberId,
          splits,
          currency,
          eventId: `expense:${adjustedExpenseId}:adjusted`,
          createdAt: adjustedAt
        })
        .map((entry) => ({ ...entry, eventType: LedgerEventType.ExpenseAdjusted }));

      const updatedOriginalExpense = await database.expense.update({
        where: { id: parsedExpenseId },
        data: { status: ExpenseStatus.Adjusted },
        include: { splits: true, ledgerEntries: true }
      });

      if (reversalLedgerEntries.length > 0) {
        await database.ledgerEntry.createMany({
          data: reversalLedgerEntries.map((entry) => mapLedgerCreateData(entry, parsedExpenseId))
        });
      }

      const adjustedExpense = await database.expense.create({
        data: {
          id: adjustedExpenseId,
          spaceId: parsedSpaceId,
          createdByUserId: payload.createdByUserId,
          payerMemberId: payload.payerMemberId,
          amountMinor: payload.amountMinor,
          currency,
          description: payload.description,
          category: payload.category ?? null,
          expenseDate: new Date(payload.expenseDate),
          status: ExpenseStatus.Confirmed,
          source: "web",
          parentExpenseId: parsedExpenseId,
          version: originalExpense.version + 1,
          confirmedAt: adjustedAt,
          splits: {
            create: splits.map((split) => ({
              memberId: split.memberId,
              amountMinor: split.amountMinor,
              currency: split.currency,
              splitRule: split.splitRule
            }))
          },
          ledgerEntries: {
            create: ledgerEntries.map(mapLedgerNestedCreateData)
          }
        },
        include: { splits: true, ledgerEntries: true }
      });

      await database.auditLog.create({
        data: {
          actorUserId: payload.actorUserId,
          spaceId: parsedSpaceId,
          action: "expense.adjusted",
          objectType: "expense",
          objectId: parsedExpenseId,
          before: {
            status: originalExpense.status,
            amountMinor: originalExpense.amountMinor,
            version: originalExpense.version
          },
          after: {
            status: ExpenseStatus.Adjusted,
            adjustedExpenseId,
            amountMinor: payload.amountMinor,
            version: originalExpense.version + 1,
            reason: payload.reason ?? null
          }
        }
      });

      return {
        originalExpense: updatedOriginalExpense,
        adjustedExpense,
        reversalLedgerEntries,
        newLedgerEntries: ledgerEntries
      };
    });
  }

  async listBySpace(spaceId: string): Promise<unknown[]> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);

    await this.ensureSpaceExists(parsedSpaceId);

    return this.database.expense
      .findMany({
        where: { spaceId: parsedSpaceId },
        include: {
          ledgerEntries: true,
          payer: { include: { user: true } },
          splits: {
            include: {
              member: { include: { user: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
      .then((expenses) => expenses.map(mapExpenseForWeb));
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

async function ensureExpenseMembersBelongToSpace(
  database: DatabaseOperationClient,
  spaceId: string,
  payload: Pick<CreateExpenseInput, "payerMemberId" | "participants">
): Promise<void> {
  const participantIds = payload.participants.map((participant) => participant.memberId);
  const relatedMemberIds = uniqueValues([payload.payerMemberId, ...participantIds]);
  const members = await database.spaceMember.findMany({
    where: {
      spaceId,
      id: { in: relatedMemberIds }
    }
  });

  if (members.length !== relatedMemberIds.length) {
    throw new BadRequestException("Expense members must belong to the target space.");
  }
}

async function findExpenseForMutation(
  database: DatabaseOperationClient,
  spaceId: string,
  expenseId: string
) {
  const expense = await database.expense.findUnique({
    where: { id: expenseId },
    include: { splits: true, ledgerEntries: true }
  });

  if (!expense || expense.spaceId !== spaceId) {
    throw new NotFoundException(`Expense ${expenseId} was not found in space ${spaceId}.`);
  }

  return expense;
}

function mapLedgerCreateData(entry: LedgerEntry, expenseId: string) {
  return {
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
  };
}

function mapLedgerNestedCreateData(entry: LedgerEntry) {
  return {
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
    createdAt: entry.createdAt
  };
}

function mapLedgerEntryForCore(entry: {
  id: string;
  spaceId: string;
  eventId: string;
  eventType: string;
  fromMemberId: string;
  toMemberId: string;
  amountMinor: number;
  currency: string;
  referenceType: string;
  referenceId: string;
  createdAt: Date;
}): LedgerEntry {
  return {
    ...entry,
    eventType: entry.eventType as LedgerEventType,
    referenceType: entry.referenceType as LedgerReferenceType
  };
}

function mapExpenseForWeb(expense: {
  id: string;
  description: string;
  category: string | null;
  amountMinor: number;
  currency: string;
  expenseDate: Date;
  payerMemberId: string;
  status: string;
  version: number;
  parentExpenseId: string | null;
  cancelledAt: Date | null;
  payer: { nickname: string | null; user: { displayName: string } };
  splits: Array<{
    memberId: string;
    amountMinor: number;
    member: { nickname: string | null; user: { displayName: string } };
  }>;
}) {
  return {
    id: expense.id,
    description: expense.description,
    category: expense.category ?? "geral",
    amountMinor: expense.amountMinor,
    currency: expense.currency,
    expenseDate: expense.expenseDate.toISOString(),
    payerMemberId: expense.payerMemberId,
    payerMemberName: expense.payer.nickname ?? expense.payer.user.displayName,
    status: expense.status,
    version: expense.version,
    parentExpenseId: expense.parentExpenseId,
    cancelledAt: expense.cancelledAt?.toISOString() ?? null,
    splitRule: "equal",
    splits: expense.splits.map((split) => ({
      memberId: split.memberId,
      memberName: split.member.nickname ?? split.member.user.displayName,
      amountMinor: split.amountMinor
    }))
  };
}
