import { MemberRole } from "@ia-financeira/shared";
import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const createMemberSchema = z.object({
  userId: nonEmptyString,
  role: z.nativeEnum(MemberRole).default(MemberRole.Member),
  nickname: nonEmptyString.optional()
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
