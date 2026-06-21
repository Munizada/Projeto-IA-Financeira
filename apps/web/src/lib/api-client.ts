import { z } from "zod";

import {
  getMockSpace,
  mockActivityBySpaceId,
  mockBalancesBySpaceId,
  mockExpensesBySpaceId,
  mockSettlementBySpaceId,
  mockSpaces,
  type DemoActivityItem,
  type DemoBalance,
  type DemoExpense,
  type DemoSettlementPayment,
  type DemoSpace
} from "./mock-data";

const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["organizer", "member"]),
  status: z.literal("active"),
  nickname: z.string().optional(),
  userId: z.string().optional()
});

const spaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["trip", "home", "couple", "event", "restaurant", "other"]),
  status: z.enum(["active", "closing", "closed"]),
  currency: z.literal("BRL"),
  summary: z.string(),
  members: z.array(memberSchema),
  totalExpensesMinor: z.number().int(),
  yourBalanceMinor: z.number().int(),
  pendingSettlementCount: z.number().int()
});

const expenseSchema = z.object({
  id: z.string(),
  description: z.string(),
  category: z.string(),
  amountMinor: z.number().int(),
  currency: z.literal("BRL"),
  expenseDate: z.string(),
  payerMemberId: z.string(),
  payerMemberName: z.string(),
  status: z.enum(["confirmed", "adjusted", "cancelled"]),
  version: z.number().int().optional(),
  parentExpenseId: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  splitRule: z.literal("equal"),
  splits: z.array(
    z.object({
      memberId: z.string(),
      memberName: z.string(),
      amountMinor: z.number().int()
    })
  )
});

const balanceSchema = z.object({
  memberId: z.string(),
  memberName: z.string(),
  balanceMinor: z.number().int(),
  currency: z.literal("BRL")
});

const settlementSchema = z.object({
  fromMemberId: z.string(),
  fromMemberName: z.string(),
  toMemberId: z.string(),
  toMemberName: z.string(),
  amountMinor: z.number().int(),
  currency: z.literal("BRL"),
  status: z.literal("manual_pending")
});

const activitySchema = z.object({
  id: z.string(),
  action: z.string(),
  objectType: z.string(),
  objectId: z.string().nullable().optional(),
  actorUserId: z.string().nullable().optional(),
  spaceId: z.string().nullable().optional(),
  summary: z.string(),
  createdAt: z.string(),
  before: z.unknown().optional(),
  after: z.unknown().optional()
});

const spacesSchema = z.array(spaceSchema);
const expensesSchema = z.array(expenseSchema);
const balancesSchema = z.array(balanceSchema);
const settlementListSchema = z.array(settlementSchema);
const activityListSchema = z.array(activitySchema);
const createdResourceSchema = z.object({ id: z.string() }).passthrough();

export type CreateSpaceInput = {
  name: string;
  type: DemoSpace["type"];
  currency: "BRL";
  creatorUserId: string;
};

export type AddSpaceMemberInput = {
  userId: string;
  role: "organizer" | "member";
  nickname?: string;
};

export type CreateExpenseInput = {
  createdByUserId: string;
  payerMemberId: string;
  amountMinor: number;
  currency: "BRL";
  description: string;
  category?: string;
  expenseDate: string;
  splitRule: "equal";
  participants: Array<{ memberId: string }>;
};

export type ConfirmPaymentInput = {
  payerMemberId: string;
  receiverMemberId: string;
  amountMinor: number;
  currency: "BRL";
  createdByUserId: string;
};

export type CancelExpenseInput = {
  actorUserId: string;
  reason?: string;
};

export type AdjustExpenseInput = CreateExpenseInput & {
  actorUserId: string;
  reason?: string;
};

export class ApiWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiWriteError";
  }
}

function getApiBaseUrl(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  return baseUrl ? baseUrl : null;
}

function shouldUseMockData(): boolean {
  return !getApiBaseUrl();
}

async function fetchWithFallback<TValue>(
  path: string,
  schema: z.ZodType<TValue>,
  fallback: () => TValue
): Promise<TValue> {
  if (shouldUseMockData()) {
    return fallback();
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      return fallback();
    }

    const json = await response.json();
    return schema.parse(json);
  } catch {
    return fallback();
  }
}

async function postJson<TValue>(
  path: string,
  payload: unknown,
  schema: z.ZodType<TValue>
): Promise<TValue> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    throw new ApiWriteError("API base URL is not configured");
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      body: JSON.stringify(payload),
      headers: {
        "content-type": "application/json"
      },
      method: "POST"
    });
  } catch {
    throw new ApiWriteError("API request failed");
  }

  if (!response.ok) {
    throw new ApiWriteError(`API request failed with status ${response.status}`);
  }

  return schema.parse(await response.json());
}

export async function getSpaces(): Promise<DemoSpace[]> {
  return fetchWithFallback("/spaces", spacesSchema, () => mockSpaces);
}

export async function getSpace(spaceId: string): Promise<DemoSpace | null> {
  return fetchWithFallback(`/spaces/${spaceId}`, spaceSchema.nullable(), () =>
    getMockSpace(spaceId)
  );
}

export async function getSpaceExpenses(spaceId: string): Promise<DemoExpense[]> {
  return fetchWithFallback(`/spaces/${spaceId}/expenses`, expensesSchema, () => {
    return mockExpensesBySpaceId[spaceId] ?? [];
  });
}

export async function getSpaceBalances(spaceId: string): Promise<DemoBalance[]> {
  return fetchWithFallback(`/spaces/${spaceId}/balances`, balancesSchema, () => {
    return mockBalancesBySpaceId[spaceId] ?? [];
  });
}

export async function getSpaceSettlement(spaceId: string): Promise<DemoSettlementPayment[]> {
  return fetchWithFallback(`/spaces/${spaceId}/settlement`, settlementListSchema, () => {
    return mockSettlementBySpaceId[spaceId] ?? [];
  });
}

export async function getSpaceActivity(spaceId: string): Promise<DemoActivityItem[]> {
  return fetchWithFallback(`/spaces/${spaceId}/activity`, activityListSchema, () => {
    return mockActivityBySpaceId[spaceId] ?? [];
  });
}

export async function createSpace(input: CreateSpaceInput): Promise<{ id: string }> {
  return postJson("/spaces", input, createdResourceSchema);
}

export async function addSpaceMember(
  spaceId: string,
  input: AddSpaceMemberInput
): Promise<{ id: string }> {
  return postJson(`/spaces/${spaceId}/members`, input, createdResourceSchema);
}

export async function createExpense(
  spaceId: string,
  input: CreateExpenseInput
): Promise<{ id: string }> {
  return postJson(`/spaces/${spaceId}/expenses`, input, createdResourceSchema);
}

export async function cancelExpense(
  spaceId: string,
  expenseId: string,
  input: CancelExpenseInput
): Promise<unknown> {
  return postJson(`/spaces/${spaceId}/expenses/${expenseId}/cancel`, input, z.unknown());
}

export async function adjustExpense(
  spaceId: string,
  expenseId: string,
  input: AdjustExpenseInput
): Promise<unknown> {
  return postJson(`/spaces/${spaceId}/expenses/${expenseId}/adjust`, input, z.unknown());
}

export async function confirmPayment(
  spaceId: string,
  input: ConfirmPaymentInput
): Promise<unknown> {
  return postJson(`/spaces/${spaceId}/payments/confirm`, input, z.unknown());
}
