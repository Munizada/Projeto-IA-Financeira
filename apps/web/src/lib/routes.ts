export const routes = {
  home: "/",
  spaces: "/spaces",
  space: (spaceId: string) => `/spaces/${spaceId}`,
  spaceExpenses: (spaceId: string) => `/spaces/${spaceId}/expenses`,
  spaceBalances: (spaceId: string) => `/spaces/${spaceId}/balances`,
  spaceSettlement: (spaceId: string) => `/spaces/${spaceId}/settlement`
} as const;
