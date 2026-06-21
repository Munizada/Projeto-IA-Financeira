export const routes = {
  home: "/",
  spaces: "/spaces",
  space: (spaceId: string) => `/spaces/${spaceId}`,
  spaceExpenses: (spaceId: string) => `/spaces/${spaceId}/expenses`,
  spaceActivity: (spaceId: string) => `/spaces/${spaceId}/activity`,
  spaceBalances: (spaceId: string) => `/spaces/${spaceId}/balances`,
  spaceSettlement: (spaceId: string) => `/spaces/${spaceId}/settlement`
} as const;
