import { z } from "zod";

import {
  getMockSpace,
  mockBalancesBySpaceId,
  mockExpensesBySpaceId,
  mockSettlementBySpaceId,
  mockSpaces,
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
  nickname: z.string().optional()
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
  status: z.literal("confirmed"),
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

const spacesSchema = z.array(spaceSchema);
const expensesSchema = z.array(expenseSchema);
const balancesSchema = z.array(balanceSchema);
const settlementListSchema = z.array(settlementSchema);

function getApiBaseUrl(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  return baseUrl ? baseUrl : null;
}

function shouldUseMockData(): boolean {
  return process.env.NODE_ENV === "test" || !getApiBaseUrl();
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
