import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DatabaseService, type DatabaseClient } from "../src/database/database.service.js";
import { SpacesService } from "../src/modules/spaces/spaces.service.js";
import { createDatabaseMock } from "./test-helpers.js";

describe("SpacesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a space with valid data", async () => {
    const database = createDatabaseMock();
    const service = new SpacesService(new DatabaseService(database as unknown as DatabaseClient));
    const createdSpace = {
      id: "space-1",
      name: "Floripa MVP",
      type: "trip",
      currency: "BRL",
      creatorUserId: "user-1",
      status: "active"
    };

    database.space.create.mockResolvedValue(createdSpace);
    database.spaceMember.create.mockResolvedValue({
      id: "member-1"
    });

    await expect(
      service.create({
        name: "Floripa MVP",
        type: "trip",
        currency: "BRL",
        creatorUserId: "user-1"
      })
    ).resolves.toEqual(createdSpace);
  });

  it("fails when name is empty", async () => {
    const database = createDatabaseMock();
    const service = new SpacesService(new DatabaseService(database as unknown as DatabaseClient));

    await expect(
      service.create({
        name: " ",
        type: "trip",
        currency: "BRL",
        creatorUserId: "user-1"
      })
    ).rejects.toThrow(BadRequestException);
  });

  it("retrieves a space by id", async () => {
    const database = createDatabaseMock();
    const service = new SpacesService(new DatabaseService(database as unknown as DatabaseClient));
    const space = {
      id: "space-1",
      name: "Floripa MVP"
    };

    database.space.findUnique.mockResolvedValue(space);

    await expect(service.getById("space-1")).resolves.toEqual(space);
  });

  it("returns error when space is not found", async () => {
    const database = createDatabaseMock();
    const service = new SpacesService(new DatabaseService(database as unknown as DatabaseClient));

    database.space.findUnique.mockResolvedValue(null);

    await expect(service.getById("space-missing")).rejects.toThrow(NotFoundException);
  });
});
