import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { ZodValidationPipe } from "../../common/validation/zod-validation.pipe.js";
import { createSpaceSchema, spaceIdSchema, type CreateSpaceInput } from "./spaces.schemas.js";
import { SpacesService } from "./spaces.service.js";

@Controller("spaces")
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  list(): Promise<unknown[]> {
    return this.spacesService.list();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createSpaceSchema))
    body: CreateSpaceInput
  ): Promise<unknown> {
    return this.spacesService.create(body);
  }

  @Get(":spaceId/activity")
  getActivity(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string
  ): Promise<unknown[]> {
    return this.spacesService.getActivity(spaceId);
  }

  @Get(":spaceId")
  getById(
    @Param("spaceId", new ZodValidationPipe(spaceIdSchema))
    spaceId: string
  ): Promise<unknown> {
    return this.spacesService.getById(spaceId);
  }
}
