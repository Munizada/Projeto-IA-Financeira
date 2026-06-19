const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export function formatAmountMinorBRL(amountMinor: number): string {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("amountMinor must be an integer.");
  }

  return brlFormatter.format(amountMinor / 100).replace(/\u00a0/g, " ");
}

export function describeBalance(balanceMinor: number): "paga" | "quitado" | "recebe" {
  if (balanceMinor > 0) {
    return "recebe";
  }

  if (balanceMinor < 0) {
    return "paga";
  }

  return "quitado";
}
