export type CreateExpensePayload = {
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

export function parseReaisToAmountMinor(input: string): number {
  const normalized = input.trim().replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Valor em reais invalido");
  }

  const [reais = "0", cents = ""] = normalized.split(".");
  const amountMinor = Number.parseInt(reais, 10) * 100 + Number.parseInt(cents.padEnd(2, "0"), 10);

  if (amountMinor <= 0) {
    throw new Error("Valor precisa ser maior que zero");
  }

  return amountMinor;
}

export function buildEqualSplitExpensePayload(formData: FormData): CreateExpensePayload {
  const createdByUserId = getRequiredString(formData, "createdByUserId");
  const payerMemberId = getRequiredString(formData, "payerMemberId");
  const amountMinor = parseReaisToAmountMinor(getRequiredString(formData, "amountReais"));
  const description = getRequiredString(formData, "description");
  const expenseDate = getRequiredString(formData, "expenseDate");
  const category = getOptionalString(formData, "category");
  const participants = formData
    .getAll("participants")
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((memberId) => ({ memberId }));

  if (participants.length === 0) {
    throw new Error("Selecione ao menos um participante");
  }

  return {
    createdByUserId,
    payerMemberId,
    amountMinor,
    currency: "BRL",
    description,
    ...(category ? { category } : {}),
    expenseDate: `${expenseDate}T00:00:00.000Z`,
    splitRule: "equal",
    participants
  };
}

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Campo obrigatorio ausente: ${key}`);
  }

  return value.trim();
}

function getOptionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return value.trim();
}
