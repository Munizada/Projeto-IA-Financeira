import { normalizeCurrency } from "@ia-financeira/core";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MemberRole, MemberStatus, SpaceStatus } from "@ia-financeira/shared";

import { parseWithSchema } from "../../common/validation/zod-validation.pipe.js";
import { DatabaseService } from "../../database/database.service.js";
import { createSpaceSchema, spaceIdSchema, type CreateSpaceInput } from "./spaces.schemas.js";

@Injectable()
export class SpacesService {
  constructor(private readonly database: DatabaseService) {}

  async create(input: CreateSpaceInput): Promise<unknown> {
    const payload = parseWithSchema(createSpaceSchema, input);
    const currency = normalizeCurrency(payload.currency);

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
      where: { id }
    });

    if (!space) {
      throw new NotFoundException(`Space ${id} was not found.`);
    }

    return space;
  }
}
