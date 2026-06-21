import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("api client", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("exports the expected API functions", async () => {
    const api = await import("../lib/api-client");

    expect(typeof api.getSpaces).toBe("function");
    expect(typeof api.getSpace).toBe("function");
    expect(typeof api.getSpaceExpenses).toBe("function");
    expect(typeof api.getSpaceBalances).toBe("function");
    expect(typeof api.getSpaceSettlement).toBe("function");
    expect(typeof api.createSpace).toBe("function");
    expect(typeof api.addSpaceMember).toBe("function");
    expect(typeof api.createExpense).toBe("function");
    expect(typeof api.confirmPayment).toBe("function");
    expect(typeof api.getSpaceActivity).toBe("function");
    expect(typeof api.cancelExpense).toBe("function");
    expect(typeof api.adjustExpense).toBe("function");
  });

  it("falls back to mock data when NEXT_PUBLIC_API_BASE_URL is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const api = await import("../lib/api-client");

    const spaces = await api.getSpaces();

    expect(spaces[0]?.name).toBe("Floripa MVP");
  });

  it("falls back to mock data when fetch fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3333/api/v1");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      })
    );
    const api = await import("../lib/api-client");

    const settlement = await api.getSpaceSettlement("space-floripa");

    expect(settlement).toHaveLength(3);
    expect(settlement[0]?.toMemberId).toBe("member-arthur");
  });

  it("sends write payloads to the API", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3333/api/v1");
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ id: "space-1" }), {
        headers: { "content-type": "application/json" },
        status: 201
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const api = await import("../lib/api-client");

    await api.createSpace({
      name: "Runtime Test",
      type: "trip",
      currency: "BRL",
      creatorUserId: "user-arthur"
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/api/v1/spaces",
      expect.objectContaining({
        body: JSON.stringify({
          name: "Runtime Test",
          type: "trip",
          currency: "BRL",
          creatorUserId: "user-arthur"
        }),
        method: "POST"
      })
    );
  });

  it("fetches space activity from the API", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3333/api/v1");
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify([
          {
            id: "audit-1",
            action: "expense.cancelled",
            objectType: "expense",
            objectId: "expense-1",
            actorUserId: "user-arthur",
            spaceId: "space-1",
            summary: "Despesa cancelada.",
            createdAt: "2026-06-20T12:00:00.000Z"
          }
        ]),
        { headers: { "content-type": "application/json" }, status: 200 }
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const api = await import("../lib/api-client");

    const activity = await api.getSpaceActivity("space-1");

    expect(activity[0]?.action).toBe("expense.cancelled");
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3333/api/v1/spaces/space-1/activity", {
      next: { revalidate: 30 }
    });
  });

  it("sends cancel and adjustment payloads to the API", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3333/api/v1");
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ id: "expense-1" }), {
        headers: { "content-type": "application/json" },
        status: 200
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const api = await import("../lib/api-client");

    await api.cancelExpense("space-1", "expense-1", {
      actorUserId: "user-arthur",
      reason: "duplicada"
    });
    await api.adjustExpense("space-1", "expense-1", {
      actorUserId: "user-arthur",
      createdByUserId: "user-arthur",
      payerMemberId: "member-arthur",
      amountMinor: 50000,
      currency: "BRL",
      description: "Airbnb corrigido",
      category: "hospedagem",
      expenseDate: "2026-06-20T00:00:00.000Z",
      splitRule: "equal",
      participants: [{ memberId: "member-arthur" }],
      reason: "valor corrigido"
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3333/api/v1/spaces/space-1/expenses/expense-1/cancel",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3333/api/v1/spaces/space-1/expenses/expense-1/adjust",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fails writes clearly when the API is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const api = await import("../lib/api-client");

    await expect(
      api.confirmPayment("space-1", {
        payerMemberId: "member-ana",
        receiverMemberId: "member-arthur",
        amountMinor: 12000,
        currency: "BRL",
        createdByUserId: "user-arthur"
      })
    ).rejects.toThrow("API base URL is not configured");
  });

  it("keeps balance calculation out of the expenses page", async () => {
    const fs = await import("node:fs/promises");
    const source = await fs.readFile("src/app/spaces/[spaceId]/expenses/page.tsx", "utf8");

    expect(source).not.toContain("calculateBalances");
    expect(source).not.toContain("simplifyDebts");
    expect(source).toContain("Despesa cancelada");
  });
});
