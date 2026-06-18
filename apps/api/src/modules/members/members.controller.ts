import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { ZodValidationPipe } from "../../common/validation/zod-validation.pipe.js";
import { spaceIdSchema } from "../spaces/spaces.schemas.js";
import { createMemberSchema, type CreateMemberInput } from "./members.schemas.js";
import { MembersService } from "./members.service.js";

@Controller("spaces/:spaceId/members")
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string,
    @Body(new ZodValidationPipe(createMemberSchema))
    body: CreateMemberInput
  ): Promise<unknown> {
    return this.membersService.create(spaceId, body);
  }

  @Get()
  listBySpace(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string
  ): Promise<unknown[]> {
    return this.membersService.listBySpace(spaceId);
  }
}
