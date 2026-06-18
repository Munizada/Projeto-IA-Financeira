export class FinancialCoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidMoneyError extends FinancialCoreError {}

export class CurrencyMismatchError extends FinancialCoreError {}

export class EmptyMembersError extends FinancialCoreError {}

export class DuplicateMemberError extends FinancialCoreError {}

export class SplitTotalMismatchError extends FinancialCoreError {}

export class InvalidPercentageError extends FinancialCoreError {}

export class InvalidSharesError extends FinancialCoreError {}

export class InvalidLedgerEntryError extends FinancialCoreError {}

export class InvalidPaymentError extends FinancialCoreError {}
