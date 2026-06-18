import { SpaceType } from "@ia-financeira/shared";
import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const spaceIdSchema = nonEmptyString;

export const createSpaceSchema = z.object({
  name: nonEmptyString,
  type: z.nativeEnum(SpaceType),
  currency: nonEmptyString,
  creatorUserId: nonEmptyString
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
