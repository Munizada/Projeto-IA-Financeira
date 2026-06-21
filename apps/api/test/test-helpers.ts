import { vi } from "vitest";

import type { DatabaseOperationClient } from "../src/database/database.service.js";

type FunctionMock = ReturnType<typeof vi.fn>;

export type DatabaseMock = {
  auditLog: {
    create: FunctionMock;
    findMany: FunctionMock;
  };
  expense: {
    create: FunctionMock;
    findMany: FunctionMock;
    findUnique: FunctionMock;
    update: FunctionMock;
  };
  ledgerEntry: {
    create: FunctionMock;
    createMany: FunctionMock;
    findMany: FunctionMock;
  };
  payment: {
    create: FunctionMock;
    findUnique: FunctionMock;
  };
  space: {
    create: FunctionMock;
    findMany: FunctionMock;
    findUnique: FunctionMock;
  };
  spaceMember: {
    create: FunctionMock;
    findMany: FunctionMock;
  };
  user: {
    findUnique: FunctionMock;
  };
  $disconnect: FunctionMock;
  $transaction: FunctionMock;
};

export function createDatabaseMock(): DatabaseMock {
  const mock = {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn()
    },
    expense: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    ledgerEntry: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn()
    },
    payment: {
      create: vi.fn(),
      findUnique: vi.fn()
    },
    space: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn()
    },
    spaceMember: {
      create: vi.fn(),
      findMany: vi.fn()
    },
    user: {
      findUnique: vi.fn()
    },
    $disconnect: vi.fn(async () => undefined),
    $transaction: vi.fn()
  };

  mock.$transaction.mockImplementation(
    async (operation: (database: DatabaseOperationClient) => Promise<unknown>) =>
      operation(mock as unknown as DatabaseOperationClient)
  );

  return mock;
}
