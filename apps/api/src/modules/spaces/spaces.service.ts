import * as core from "@ia-financeira/core";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  LedgerEventType,
  LedgerReferenceType,
  MemberRole,
  MemberStatus,
  SpaceStatus,
  type LedgerEntry
} from "@ia-financeira/shared";

import { parseWithSchema } from "../../common/validation/zod-validation.pipe.js";
import { DatabaseService } from "../../database/database.service.js";
import { createSpaceSchema, spaceIdSchema, type CreateSpaceInput } from "./spaces.schemas.js";

@Injectable()
export class SpacesService {
  constructor(private readonly database: DatabaseService) {}

  async create(input: CreateSpaceInput): Promise<unknown> {
    const payload = parseWithSchema(createSpaceSchema, input);
    const currency = core.normalizeCurrency(payload.currency);

    if (payload.name.trim().length === 0) {
      throw new BadRequestException("Space name cannot be empty.");
    }

    return this.database.transaction(async (database) => {
      const space = await database.space.create({
        data: {
          name: payload.name,
          type: payload.type,
          currency,
          creatorUserId: payload.creatorUserId,
          status: SpaceStatus.Active
        }
      });

      await database.spaceMember.create({
        data: {
          spaceId: space.id,
          userId: payload.creatorUserId,
          role: MemberRole.Organizer,
          status: MemberStatus.Active,
          joinedAt: new Date()
        }
      });

      return space;
    });
  }

  async getById(spaceId: string): Promise<unknown> {
    const id = parseWithSchema(spaceIdSchema, spaceId);
    const space = await this.database.space.findUnique({
      where: { id },
      include: {
        expenses: true,
        ledgerEntries: true,
        members: {
          include: { user: true },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!space) {
      throw new NotFoundException(`Space ${id} was not found.`);
    }

    return mapSpaceForWeb(space);
  }

  async list(): Promise<unknown[]> {
    const spaces = await this.database.space.findMany({
      include: {
        expenses: true,
        ledgerEntries: true,
        members: {
          include: { user: true },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return spaces.map(mapSpaceForWeb);
  }
}

type SpaceForWeb = {
  id: string;
  name: string;
  type: "trip" | "home" | "couple" | "event" | "restaurant" | "other";
  status: "active" | "closing" | "closed";
  currency: "BRL";
  summary: string;
  members: Array<{
    id: string;
    name: string;
    role: "organizer" | "member";
    status: "active";
    nickname?: string | undefined;
    userId: string;
  }>;
  totalExpensesMinor: number;
  yourBalanceMinor: number;
  pendingSettlementCount: number;
};

function mapSpaceForWeb(space: {
  id: string;
  name: string;
  type: string;
  status: string;
  currency: string;
  expenses: Array<{ amountMinor: number }>;
  ledgerEntries: Array<{
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
  }>;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    status: string;
    nickname: string | null;
    user: { displayName: string };
  }>;
}): SpaceForWeb {
  const memberIds = space.members.map((member) => member.id);
  const balances = core.calculateBalances({
    memberIds,
    ledgerEntries: space.ledgerEntries.map(mapLedgerEntryForCore),
    currency: space.currency
  });
  const settlement = core.simplifyDebts({ balances });

  return {
    id: space.id,
    name: space.name,
    type: normalizeSpaceType(space.type),
    status: normalizeSpaceStatus(space.status),
    currency: "BRL",
    summary: "Espaco com despesas compartilhadas e acerto manual.",
    members: space.members.map((member) => ({
      id: member.id,
      name: member.nickname ?? member.user.displayName,
      role: member.role === "organizer" ? "organizer" : "member",
      status: "active",
      userId: member.userId,
      ...(member.nickname ? { nickname: member.nickname } : {})
    })),
    totalExpensesMinor: space.expenses.reduce((total, expense) => total + expense.amountMinor, 0),
    yourBalanceMinor: Math.max(0, ...balances.map((balance) => balance.balanceMinor)),
    pendingSettlementCount: settlement.length
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
    eventType: normalizeLedgerEventType(entry.eventType),
    referenceType: normalizeLedgerReferenceType(entry.referenceType)
  };
}

function normalizeLedgerEventType(eventType: string): LedgerEventType {
  const allowed = Object.values(LedgerEventType);
  const match = allowed.find((item) => item === eventType);

  if (!match) {
    throw new BadRequestException(`Unsupported ledger event type: ${eventType}`);
  }

  return match;
}

function normalizeLedgerReferenceType(referenceType: string): LedgerReferenceType {
  const allowed = Object.values(LedgerReferenceType);
  const match = allowed.find((item) => item === referenceType);

  if (!match) {
    throw new BadRequestException(`Unsupported ledger reference type: ${referenceType}`);
  }

  return match;
}

function normalizeSpaceType(type: string): SpaceForWeb["type"] {
  const allowed = ["trip", "home", "couple", "event", "restaurant", "other"] as const;
  return allowed.find((item) => item === type) ?? "other";
}

function normalizeSpaceStatus(status: string): SpaceForWeb["status"] {
  if (status === "closing" || status === "closed") {
    return status;
  }

  return "active";
}
