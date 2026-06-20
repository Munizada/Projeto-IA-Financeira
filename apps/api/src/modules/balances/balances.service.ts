import * as core from "@ia-financeira/core";
import { Injectable, NotFoundException } from "@nestjs/common";

import { parseWithSchema } from "../../common/validation/zod-validation.pipe.js";
import { DatabaseService } from "../../database/database.service.js";
import { spaceIdSchema } from "../spaces/spaces.schemas.js";

@Injectable()
export class BalancesService {
  constructor(private readonly database: DatabaseService) {}

  async getBySpaceId(
    spaceId: string
  ): Promise<Array<ReturnType<typeof core.calculateBalances>[number] & { memberName: string }>> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);
    const space = await this.database.space.findUnique({
      where: { id: parsedSpaceId }
    });

    if (!space) {
      throw new NotFoundException(`Space ${parsedSpaceId} was not found.`);
    }

    const members = await this.database.spaceMember.findMany({
      where: {
        spaceId: parsedSpaceId
      },
      include: { user: true },
      orderBy: { createdAt: "asc" }
    });
    const ledgerEntries = await this.database.ledgerEntry.findMany({
      where: { spaceId: parsedSpaceId },
      orderBy: { createdAt: "asc" }
    });

    const memberNamesById = new Map(
      members.map((member) => [member.id, member.nickname ?? member.user.displayName])
    );

    return core
      .calculateBalances({
        memberIds: members.map((member) => member.id),
        ledgerEntries: ledgerEntries.map((entry) => ({
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
        })),
        currency: space.currency
      })
      .map((balance) => ({
        ...balance,
        memberName: memberNamesById.get(balance.memberId) ?? balance.memberId
      }));
  }
}
