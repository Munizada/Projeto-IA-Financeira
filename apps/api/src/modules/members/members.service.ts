import { Injectable, NotFoundException } from "@nestjs/common";
import { MemberStatus } from "@ia-financeira/shared";

import { parseWithSchema } from "../../common/validation/zod-validation.pipe.js";
import { DatabaseService } from "../../database/database.service.js";
import { spaceIdSchema } from "../spaces/spaces.schemas.js";
import { createMemberSchema, type CreateMemberInput } from "./members.schemas.js";

@Injectable()
export class MembersService {
  constructor(private readonly database: DatabaseService) {}

  async create(spaceId: string, input: CreateMemberInput): Promise<unknown> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);
    const payload = parseWithSchema(createMemberSchema, input);

    await this.ensureSpaceExists(parsedSpaceId);

    const member = await this.database.spaceMember.create({
      data: {
        spaceId: parsedSpaceId,
        userId: payload.userId,
        role: payload.role ?? "member",
        status: MemberStatus.Active,
        joinedAt: new Date(),
        ...(payload.nickname ? { nickname: payload.nickname } : {})
      }
    });

    await this.database.auditLog.create({
      data: {
        actorUserId: payload.userId,
        spaceId: parsedSpaceId,
        action: "member.added",
        objectType: "member",
        objectId: member.id,
        after: {
          userId: payload.userId,
          role: payload.role ?? "member",
          nickname: payload.nickname ?? null
        }
      }
    });

    return member;
  }

  async listBySpace(spaceId: string): Promise<unknown[]> {
    const parsedSpaceId = parseWithSchema(spaceIdSchema, spaceId);

    await this.ensureSpaceExists(parsedSpaceId);

    return this.database.spaceMember.findMany({
      where: { spaceId: parsedSpaceId },
      orderBy: { createdAt: "asc" }
    });
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
