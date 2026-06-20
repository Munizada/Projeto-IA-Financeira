import { beforeEach, describe, expect, it, vi } from "vitest";

import { DatabaseService, type DatabaseClient } from "../src/database/database.service.js";
import { MembersService } from "../src/modules/members/members.service.js";
import { createDatabaseMock } from "./test-helpers.js";

describe("MembersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an active member in the target space", async () => {
    const database = createDatabaseMock();
    const service = new MembersService(new DatabaseService(database as unknown as DatabaseClient));
    const createdMember = {
      id: "member-ana",
      spaceId: "space-1",
      userId: "user-ana",
      role: "member",
      nickname: "Ana"
    };

    database.space.findUnique.mockResolvedValue({ id: "space-1" });
    database.spaceMember.create.mockResolvedValue(createdMember);

    await expect(
      service.create("space-1", {
        userId: "user-ana",
        role: "member",
        nickname: "Ana"
      })
    ).resolves.toEqual(createdMember);
    expect(database.spaceMember.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nickname: "Ana",
        role: "member",
        spaceId: "space-1",
        status: "active",
        userId: "user-ana"
      })
    });
  });
});
