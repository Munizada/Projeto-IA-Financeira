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
});
