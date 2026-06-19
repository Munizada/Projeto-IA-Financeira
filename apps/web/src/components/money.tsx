import { formatAmountMinorBRL } from "../lib/money";

type MoneyProps = {
  amountMinor: number;
  tone?: "default" | "positive" | "negative";
};

export function Money({ amountMinor, tone = "default" }: MoneyProps) {
  return <span className={`money money--${tone}`}>{formatAmountMinorBRL(amountMinor)}</span>;
}
