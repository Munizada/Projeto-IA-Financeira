export const SpaceType = {
  Trip: "trip",
  Home: "home",
  Couple: "couple",
  Event: "event",
  Restaurant: "restaurant",
  Other: "other"
} as const;

export type SpaceType = (typeof SpaceType)[keyof typeof SpaceType];

export const SpaceStatus = {
  Draft: "draft",
  Active: "active",
  Closing: "closing",
  Closed: "closed",
  Archived: "archived",
  Cancelled: "cancelled"
} as const;

export type SpaceStatus = (typeof SpaceStatus)[keyof typeof SpaceStatus];

export const MemberRole = {
  Organizer: "organizer",
  Member: "member",
  Treasurer: "treasurer",
  Guest: "guest"
} as const;

export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

export const MemberStatus = {
  Invited: "invited",
  Active: "active",
  Removed: "removed",
  Left: "left",
  Blocked: "blocked"
} as const;

export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];

export const SplitRule = {
  Equal: "equal",
  Percentage: "percentage",
  Shares: "shares",
  Fixed: "fixed",
  ManualAdjustment: "manual_adjustment"
} as const;

export type SplitRule = (typeof SplitRule)[keyof typeof SplitRule];

export const ExpenseStatus = {
  Draft: "draft",
  PendingConfirmation: "pending_confirmation",
  Confirmed: "confirmed",
  Contested: "contested",
  Adjusted: "adjusted",
  Cancelled: "cancelled"
} as const;

export type ExpenseStatus = (typeof ExpenseStatus)[keyof typeof ExpenseStatus];

export const PaymentStatus = {
  Pending: "pending",
  PixGenerated: "pix_generated",
  MarkedPaid: "marked_paid",
  ReceiptUploaded: "receipt_uploaded",
  Confirmed: "confirmed",
  Contested: "contested",
  Failed: "failed",
  Cancelled: "cancelled",
  Expired: "expired"
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const LedgerEventType = {
  ExpenseConfirmed: "expense_confirmed",
  ExpenseAdjusted: "expense_adjusted",
  ExpenseCancelled: "expense_cancelled",
  PaymentConfirmed: "payment_confirmed",
  ManualAdjustment: "manual_adjustment"
} as const;

export type LedgerEventType = (typeof LedgerEventType)[keyof typeof LedgerEventType];

export const LedgerReferenceType = {
  Expense: "expense",
  Payment: "payment",
  Adjustment: "adjustment"
} as const;

export type LedgerReferenceType = (typeof LedgerReferenceType)[keyof typeof LedgerReferenceType];
