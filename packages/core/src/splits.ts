import { SplitRule, type ExpenseSplit } from "@ia-financeira/shared";

import {
  DuplicateMemberError,
  EmptyMembersError,
  InvalidPercentageError,
  InvalidSharesError,
  SplitTotalMismatchError
} from "./errors.js";
import { createMoney, normalizeCurrency } from "./money.js";

const RATIO_SCALE = 10_000;
const PERCENT_TOTAL = 100 * RATIO_SCALE;

type WeightedMember = {
  memberId: string;
  weight: number;
};

type Allocation = {
  memberId: string;
  amountMinor: number;
};

export function sortMemberIdsStable(memberIds: string[]): string[] {
  return [...memberIds].sort(compareIds);
}

export function splitEqual(params: {
  amountMinor: number;
  currency?: string;
  memberIds: string[];
}): ExpenseSplit[] {
  const money = createMoney(params.amountMinor, params.currency);
  const memberIds = ensureUniqueMembers(params.memberIds);
  const base = Math.floor(money.amountMinor / memberIds.length);
  let remainder = money.amountMinor % memberIds.length;

  return memberIds.map((memberId) => {
    const amountMinor = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;

    return toSplit(memberId, amountMinor, money.currency, SplitRule.Equal);
  });
}

export function splitByPercentages(params: {
  amountMinor: number;
  currency?: string;
  percentages: Array<{
    memberId: string;
    percentage: number;
  }>;
}): ExpenseSplit[] {
  const money = createMoney(params.amountMinor, params.currency);
  const weighted = sortWeightedMembers(
    params.percentages.map(({ memberId, percentage }) => ({
      memberId,
      weight: toRatioUnits(
        percentage,
        InvalidPercentageError,
        "Percentage must be a finite number."
      )
    }))
  );

  ensureUniqueMembers(weighted.map((item) => item.memberId));

  if (weighted.some((item) => item.weight < 0)) {
    throw new InvalidPercentageError("Percentage cannot be negative.");
  }

  const totalPercentage = weighted.reduce((sum, item) => sum + item.weight, 0);

  if (totalPercentage !== PERCENT_TOTAL) {
    throw new InvalidPercentageError("Percentages must sum exactly to 100.");
  }

  return allocateByWeight(money.amountMinor, weighted, PERCENT_TOTAL).map((allocation) =>
    toSplit(allocation.memberId, allocation.amountMinor, money.currency, SplitRule.Percentage)
  );
}

export function splitByShares(params: {
  amountMinor: number;
  currency?: string;
  shares: Array<{
    memberId: string;
    shares: number;
  }>;
}): ExpenseSplit[] {
  const money = createMoney(params.amountMinor, params.currency);
  const weighted = sortWeightedMembers(
    params.shares.map(({ memberId, shares }) => ({
      memberId,
      weight: toRatioUnits(shares, InvalidSharesError, "Shares must be a finite number.")
    }))
  );

  ensureUniqueMembers(weighted.map((item) => item.memberId));

  if (weighted.some((item) => item.weight <= 0)) {
    throw new InvalidSharesError("Shares must be greater than zero.");
  }

  const totalShares = weighted.reduce((sum, item) => sum + item.weight, 0);

  if (totalShares <= 0) {
    throw new InvalidSharesError("Total shares must be greater than zero.");
  }

  return allocateByWeight(money.amountMinor, weighted, totalShares).map((allocation) =>
    toSplit(allocation.memberId, allocation.amountMinor, money.currency, SplitRule.Shares)
  );
}

export function splitByFixedAmounts(params: {
  amountMinor: number;
  currency?: string;
  amounts: Array<{
    memberId: string;
    amountMinor: number;
  }>;
}): ExpenseSplit[] {
  const money = createMoney(params.amountMinor, params.currency);
  const memberIds = ensureUniqueMembers(params.amounts.map((amount) => amount.memberId));
  const byMember = new Map(params.amounts.map((amount) => [amount.memberId, amount.amountMinor]));
  const splits = memberIds.map((memberId) =>
    toSplit(
      memberId,
      createMoney(byMember.get(memberId) ?? 0, money.currency).amountMinor,
      money.currency,
      SplitRule.Fixed
    )
  );
  const total = splits.reduce((sum, split) => sum + split.amountMinor, 0);

  if (total !== money.amountMinor) {
    throw new SplitTotalMismatchError("Fixed split amounts must sum exactly to the expense total.");
  }

  return splits;
}

export function ensureUniqueMembers(memberIds: string[]): string[] {
  if (memberIds.length === 0) {
    throw new EmptyMembersError("At least one member is required.");
  }

  const normalized = memberIds.map((memberId) => {
    const trimmed = memberId.trim();

    if (trimmed.length === 0) {
      throw new EmptyMembersError("Member id cannot be empty.");
    }

    return trimmed;
  });
  const unique = new Set(normalized);

  if (unique.size !== normalized.length) {
    throw new DuplicateMemberError("Members must be unique.");
  }

  return sortMemberIdsStable(normalized);
}

function allocateByWeight(
  amountMinor: number,
  members: WeightedMember[],
  totalWeight: number
): Allocation[] {
  const baseAllocations = members.map((member) => {
    const numerator = amountMinor * member.weight;

    return {
      memberId: member.memberId,
      amountMinor: Math.floor(numerator / totalWeight),
      remainder: numerator % totalWeight
    };
  });
  const allocated = baseAllocations.reduce((sum, allocation) => sum + allocation.amountMinor, 0);
  let centsToDistribute = amountMinor - allocated;
  const remainderOrder = [...baseAllocations].sort((a, b) => {
    const byRemainder = b.remainder - a.remainder;
    return byRemainder === 0 ? compareIds(a.memberId, b.memberId) : byRemainder;
  });
  const extraByMember = new Map<string, number>();

  for (const allocation of remainderOrder) {
    if (centsToDistribute <= 0) {
      break;
    }

    extraByMember.set(allocation.memberId, (extraByMember.get(allocation.memberId) ?? 0) + 1);
    centsToDistribute -= 1;
  }

  return baseAllocations
    .map((allocation) => ({
      memberId: allocation.memberId,
      amountMinor: allocation.amountMinor + (extraByMember.get(allocation.memberId) ?? 0)
    }))
    .sort((a, b) => compareIds(a.memberId, b.memberId));
}

function toSplit(
  memberId: string,
  amountMinor: number,
  currency: string,
  splitRule: ExpenseSplit["splitRule"]
): ExpenseSplit {
  return {
    memberId,
    amountMinor,
    currency: normalizeCurrency(currency),
    splitRule
  };
}

function sortWeightedMembers(members: WeightedMember[]): WeightedMember[] {
  return [...members].sort((a, b) => compareIds(a.memberId, b.memberId));
}

function toRatioUnits(
  value: number,
  ErrorClass: new (message: string) => Error,
  finiteMessage: string
): number {
  if (!Number.isFinite(value)) {
    throw new ErrorClass(finiteMessage);
  }

  const units = Math.round(value * RATIO_SCALE);

  if (Math.abs(value * RATIO_SCALE - units) > 1e-8) {
    throw new ErrorClass("Ratios support up to four decimal places.");
  }

  return units;
}

function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
