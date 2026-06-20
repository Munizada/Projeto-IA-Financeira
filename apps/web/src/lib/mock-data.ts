export type DemoMember = {
  id: string;
  name: string;
  role: "organizer" | "member";
  status: "active";
  nickname?: string | undefined;
  userId?: string | undefined;
};

export type DemoSpace = {
  id: string;
  name: string;
  type: "trip" | "home" | "couple" | "event" | "restaurant" | "other";
  status: "active" | "closing" | "closed";
  currency: "BRL";
  summary: string;
  members: DemoMember[];
  totalExpensesMinor: number;
  yourBalanceMinor: number;
  pendingSettlementCount: number;
};

export type DemoExpenseSplit = {
  memberId: string;
  memberName: string;
  amountMinor: number;
};

export type DemoExpense = {
  id: string;
  description: string;
  category: string;
  amountMinor: number;
  currency: "BRL";
  expenseDate: string;
  payerMemberId: string;
  payerMemberName: string;
  status: "confirmed";
  splitRule: "equal";
  splits: DemoExpenseSplit[];
};

export type DemoBalance = {
  memberId: string;
  memberName: string;
  balanceMinor: number;
  currency: "BRL";
};

export type DemoSettlementPayment = {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amountMinor: number;
  currency: "BRL";
  status: "manual_pending";
};

const floripaMembers: DemoMember[] = [
  {
    id: "member-arthur",
    name: "Arthur",
    role: "organizer",
    status: "active",
    userId: "user-arthur"
  },
  { id: "member-ana", name: "Ana", role: "member", status: "active", userId: "user-ana" },
  { id: "member-bruno", name: "Bruno", role: "member", status: "active", userId: "user-bruno" },
  { id: "member-caio", name: "Caio", role: "member", status: "active", userId: "user-caio" }
];

export const mockSpaces: DemoSpace[] = [
  {
    id: "space-floripa",
    name: "Floripa MVP",
    type: "trip",
    status: "active",
    currency: "BRL",
    summary: "Viagem piloto com despesas compartilhadas e fechamento manual por Pix.",
    members: floripaMembers,
    totalExpensesMinor: 48000,
    yourBalanceMinor: 36000,
    pendingSettlementCount: 3
  },
  {
    id: "space-apartamento",
    name: "Apartamento Pinheiros",
    type: "home",
    status: "closing",
    currency: "BRL",
    summary: "Espaco recorrente para contas da casa com acompanhamento simples.",
    members: [
      { id: "member-lia", name: "Lia", role: "organizer", status: "active" },
      { id: "member-joao", name: "Joao", role: "member", status: "active" }
    ],
    totalExpensesMinor: 22000,
    yourBalanceMinor: -11000,
    pendingSettlementCount: 1
  }
];

export const mockExpensesBySpaceId: Record<string, DemoExpense[]> = {
  "space-floripa": [
    {
      id: "expense-airbnb",
      description: "Airbnb",
      category: "hospedagem",
      amountMinor: 48000,
      currency: "BRL",
      expenseDate: "2026-06-18T00:00:00.000Z",
      payerMemberId: "member-arthur",
      payerMemberName: "Arthur",
      status: "confirmed",
      splitRule: "equal",
      splits: [
        { memberId: "member-arthur", memberName: "Arthur", amountMinor: 12000 },
        { memberId: "member-ana", memberName: "Ana", amountMinor: 12000 },
        { memberId: "member-bruno", memberName: "Bruno", amountMinor: 12000 },
        { memberId: "member-caio", memberName: "Caio", amountMinor: 12000 }
      ]
    }
  ],
  "space-apartamento": [
    {
      id: "expense-luz",
      description: "Conta de luz",
      category: "moradia",
      amountMinor: 22000,
      currency: "BRL",
      expenseDate: "2026-06-10T00:00:00.000Z",
      payerMemberId: "member-lia",
      payerMemberName: "Lia",
      status: "confirmed",
      splitRule: "equal",
      splits: [
        { memberId: "member-lia", memberName: "Lia", amountMinor: 11000 },
        { memberId: "member-joao", memberName: "Joao", amountMinor: 11000 }
      ]
    }
  ]
};

export const mockBalancesBySpaceId: Record<string, DemoBalance[]> = {
  "space-floripa": [
    { memberId: "member-arthur", memberName: "Arthur", balanceMinor: 36000, currency: "BRL" },
    { memberId: "member-ana", memberName: "Ana", balanceMinor: -12000, currency: "BRL" },
    { memberId: "member-bruno", memberName: "Bruno", balanceMinor: -12000, currency: "BRL" },
    { memberId: "member-caio", memberName: "Caio", balanceMinor: -12000, currency: "BRL" }
  ],
  "space-apartamento": [
    { memberId: "member-lia", memberName: "Lia", balanceMinor: 11000, currency: "BRL" },
    { memberId: "member-joao", memberName: "Joao", balanceMinor: -11000, currency: "BRL" }
  ]
};

export const mockSettlementBySpaceId: Record<string, DemoSettlementPayment[]> = {
  "space-floripa": [
    {
      fromMemberId: "member-ana",
      fromMemberName: "Ana",
      toMemberId: "member-arthur",
      toMemberName: "Arthur",
      amountMinor: 12000,
      currency: "BRL",
      status: "manual_pending"
    },
    {
      fromMemberId: "member-bruno",
      fromMemberName: "Bruno",
      toMemberId: "member-arthur",
      toMemberName: "Arthur",
      amountMinor: 12000,
      currency: "BRL",
      status: "manual_pending"
    },
    {
      fromMemberId: "member-caio",
      fromMemberName: "Caio",
      toMemberId: "member-arthur",
      toMemberName: "Arthur",
      amountMinor: 12000,
      currency: "BRL",
      status: "manual_pending"
    }
  ],
  "space-apartamento": [
    {
      fromMemberId: "member-joao",
      fromMemberName: "Joao",
      toMemberId: "member-lia",
      toMemberName: "Lia",
      amountMinor: 11000,
      currency: "BRL",
      status: "manual_pending"
    }
  ]
};

export function getMockSpace(spaceId: string): DemoSpace | null {
  return mockSpaces.find((space) => space.id === spaceId) ?? null;
}
