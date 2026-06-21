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
    expect(database.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "space.created",
        actorUserId: "user-1",
        objectId: "space-1",
        objectType: "space",
        spaceId: "space-1"
      })
    });
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
      name: "Floripa MVP",
      type: "trip",
      status: "active",
      currency: "BRL",
      expenses: [],
      ledgerEntries: [],
      members: []
    };

    database.space.findUnique.mockResolvedValue(space);

    await expect(service.getById("space-1")).resolves.toMatchObject({
      id: "space-1",
      name: "Floripa MVP",
      members: [],
      totalExpensesMinor: 0
    });
  });

  it("lists spaces in the web summary shape", async () => {
    const database = createDatabaseMock();
    const service = new SpacesService(new DatabaseService(database as unknown as DatabaseClient));

    database.space.findMany.mockResolvedValue([
      {
        id: "space-1",
        name: "Floripa MVP",
        type: "trip",
        status: "active",
        currency: "BRL",
        expenses: [{ amountMinor: 48000 }],
        ledgerEntries: [],
        members: [
          {
            id: "member-arthur",
            userId: "user-arthur",
            role: "organizer",
            status: "active",
            nickname: "Arthur",
            user: { displayName: "Arthur" }
          }
        ]
      }
    ]);

    await expect(service.list()).resolves.toEqual([
      expect.objectContaining({
        id: "space-1",
        name: "Floripa MVP",
        totalExpensesMinor: 48000,
        members: [
          expect.objectContaining({
            id: "member-arthur",
            name: "Arthur"
          })
        ]
      })
    ]);
  });

  it("returns error when space is not found", async () => {
    const database = createDatabaseMock();
    const service = new SpacesService(new DatabaseService(database as unknown as DatabaseClient));

    database.space.findUnique.mockResolvedValue(null);

    await expect(service.getById("space-missing")).rejects.toThrow(NotFoundException);
  });

  it("lists space activity from audit logs in reverse chronological order", async () => {
    const database = createDatabaseMock();
    const service = new SpacesService(new DatabaseService(database as unknown as DatabaseClient));
    const createdAt = new Date("2026-06-20T12:00:00.000Z");

    database.space.findUnique.mockResolvedValue({ id: "space-1" });
    database.auditLog.findMany.mockResolvedValue([
      {
        id: "audit-1",
        action: "expense.cancelled",
        objectType: "expense",
        objectId: "expense-1",
        actorUserId: "user-1",
        spaceId: "space-1",
        before: { status: "confirmed" },
        after: { status: "cancelled", reason: "duplicada" },
        createdAt
      }
    ]);

    await expect(service.getActivity("space-1")).resolves.toEqual([
      {
        id: "audit-1",
        action: "expense.cancelled",
        objectType: "expense",
        objectId: "expense-1",
        actorUserId: "user-1",
        spaceId: "space-1",
        summary: "Despesa cancelada.",
        createdAt: createdAt.toISOString(),
        before: { status: "confirmed" },
        after: { status: "cancelled", reason: "duplicada" }
      }
    ]);
    expect(database.auditLog.findMany).toHaveBeenCalledWith({
      where: { spaceId: "space-1" },
      orderBy: { createdAt: "desc" }
    });
  });
});
