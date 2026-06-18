import type { LedgerEventType, LedgerReferenceType, SplitRule } from "./enums.js";

export type Money = {
  amountMinor: number;
  currency: string;
};

export type Member = {
  id: string;
  displayName: string;
};

export type ExpenseInput = {
  id?: string;
  spaceId: string;
  payerMemberId: string;
  amountMinor: number;
  currency: string;
  description?: string;
  splits: ExpenseSplit[];
};

export type ExpenseSplit = {
  memberId: string;
  amountMinor: number;
  currency: string;
  splitRule: SplitRule;
};

export type LedgerEntry = {
  id: string;
  spaceId: string;
  eventId: string;
  eventType: LedgerEventType;
  fromMemberId: string;
  toMemberId: string;
  amountMinor: number;
  currency: string;
  referenceType: LedgerReferenceType;
  referenceId: string;
  createdAt: Date;
};

export type Balance = {
  memberId: string;
  balanceMinor: number;
  currency: string;
};

export type SettlementPayment = {
  fromMemberId: string;
  toMemberId: string;
  amountMinor: number;
  currency: string;
};
