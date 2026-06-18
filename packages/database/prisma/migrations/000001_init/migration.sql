-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'blocked', 'deleted');

-- CreateEnum
CREATE TYPE "SpaceType" AS ENUM ('trip', 'home', 'couple', 'event', 'restaurant', 'other');

-- CreateEnum
CREATE TYPE "SpaceStatus" AS ENUM ('draft', 'active', 'closing', 'closed', 'archived', 'cancelled');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('organizer', 'member', 'treasurer', 'guest');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('invited', 'active', 'removed', 'left', 'blocked');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('created', 'sent', 'opened', 'accepted', 'expired', 'revoked', 'used');

-- CreateEnum
CREATE TYPE "SplitRule" AS ENUM ('equal', 'percentage', 'shares', 'fixed', 'manual_adjustment');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('draft', 'pending_confirmation', 'confirmed', 'contested', 'adjusted', 'cancelled');

-- CreateEnum
CREATE TYPE "ExpenseSource" AS ENUM ('whatsapp_text', 'whatsapp_audio', 'receipt_ocr', 'web', 'import', 'system');

-- CreateEnum
CREATE TYPE "LedgerEventType" AS ENUM ('expense_confirmed', 'expense_adjusted', 'expense_cancelled', 'payment_confirmed', 'manual_adjustment');

-- CreateEnum
CREATE TYPE "LedgerReferenceType" AS ENUM ('expense', 'payment', 'adjustment');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'pix_generated', 'marked_paid', 'receipt_uploaded', 'confirmed', 'contested', 'failed', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "FileKind" AS ENUM ('receipt', 'payment_receipt', 'image', 'audio', 'report', 'other');

-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('processing', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('terms', 'privacy_policy', 'whatsapp_messages', 'ai_processing', 'open_finance_read', 'payment_initiation');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "whatsappPhone" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'pt-BR',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "termsAcceptedAt" TIMESTAMP(3),
    "privacyPolicyAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "publicCode" TEXT,
    "name" TEXT NOT NULL,
    "type" "SpaceType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "creatorUserId" TEXT NOT NULL,
    "status" "SpaceStatus" NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "defaultSplitRule" "SplitRule" NOT NULL DEFAULT 'equal',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceMember" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'member',
    "status" "MemberStatus" NOT NULL DEFAULT 'active',
    "nickname" TEXT,
    "pixKey" TEXT,
    "pixKeyType" TEXT,
    "paymentPreferences" JSONB,
    "joinedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "invitedPhone" TEXT,
    "invitedName" TEXT,
    "invitedByUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'created',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "acceptedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "payerMemberId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "description" TEXT NOT NULL,
    "category" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'draft',
    "source" "ExpenseSource" NOT NULL DEFAULT 'web',
    "sourceMessageId" TEXT,
    "idempotencyKey" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentExpenseId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseSplit" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "splitRule" "SplitRule" NOT NULL,
    "splitWeight" DECIMAL(65,30),
    "percentage" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" "LedgerEventType" NOT NULL,
    "fromMemberId" TEXT NOT NULL,
    "toMemberId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "referenceType" "LedgerReferenceType" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "expenseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "payerMemberId" TEXT NOT NULL,
    "receiverMemberId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "pixPayload" TEXT,
    "pixQrCodeUrl" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "dueReference" JSONB,
    "createdByUserId" TEXT NOT NULL,
    "confirmedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceipt" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "parsedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileObject" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "spaceId" TEXT,
    "kind" "FileKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "encrypted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "spaceId" TEXT,
    "action" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "objectId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "actorUserId" TEXT,
    "requestHash" TEXT NOT NULL,
    "responseHash" TEXT,
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'processing',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ConversationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'whatsapp',
    "providerMessageId" TEXT,
    "direction" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "text" TEXT,
    "normalizedIntent" TEXT,
    "rawPayload" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_whatsappPhone_key" ON "User"("whatsappPhone");

-- CreateIndex
CREATE INDEX "User_whatsappPhone_idx" ON "User"("whatsappPhone");

-- CreateIndex
CREATE INDEX "UserConsent_userId_type_idx" ON "UserConsent"("userId", "type");

-- CreateIndex
CREATE INDEX "Space_creatorUserId_idx" ON "Space"("creatorUserId");

-- CreateIndex
CREATE INDEX "Space_status_idx" ON "Space"("status");

-- CreateIndex
CREATE INDEX "Space_publicCode_idx" ON "Space"("publicCode");

-- CreateIndex
CREATE INDEX "SpaceMember_spaceId_status_idx" ON "SpaceMember"("spaceId", "status");

-- CreateIndex
CREATE INDEX "SpaceMember_userId_idx" ON "SpaceMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpaceMember_spaceId_userId_key" ON "SpaceMember"("spaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_tokenHash_key" ON "Invite"("tokenHash");

-- CreateIndex
CREATE INDEX "Invite_spaceId_idx" ON "Invite"("spaceId");

-- CreateIndex
CREATE INDEX "Invite_status_expiresAt_idx" ON "Invite"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_idempotencyKey_key" ON "Expense"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Expense_spaceId_status_idx" ON "Expense"("spaceId", "status");

-- CreateIndex
CREATE INDEX "Expense_payerMemberId_idx" ON "Expense"("payerMemberId");

-- CreateIndex
CREATE INDEX "Expense_sourceMessageId_idx" ON "Expense"("sourceMessageId");

-- CreateIndex
CREATE INDEX "ExpenseSplit_memberId_idx" ON "ExpenseSplit"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseSplit_expenseId_memberId_key" ON "ExpenseSplit"("expenseId", "memberId");

-- CreateIndex
CREATE INDEX "LedgerEntry_spaceId_idx" ON "LedgerEntry"("spaceId");

-- CreateIndex
CREATE INDEX "LedgerEntry_fromMemberId_idx" ON "LedgerEntry"("fromMemberId");

-- CreateIndex
CREATE INDEX "LedgerEntry_toMemberId_idx" ON "LedgerEntry"("toMemberId");

-- CreateIndex
CREATE INDEX "LedgerEntry_referenceType_referenceId_idx" ON "LedgerEntry"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "LedgerEntry_eventId_idx" ON "LedgerEntry"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_spaceId_status_idx" ON "Payment"("spaceId", "status");

-- CreateIndex
CREATE INDEX "Payment_payerMemberId_idx" ON "Payment"("payerMemberId");

-- CreateIndex
CREATE INDEX "Payment_receiverMemberId_idx" ON "Payment"("receiverMemberId");

-- CreateIndex
CREATE INDEX "PaymentReceipt_paymentId_idx" ON "PaymentReceipt"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentReceipt_uploadedByUserId_idx" ON "PaymentReceipt"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "PaymentReceipt_fileId_idx" ON "PaymentReceipt"("fileId");

-- CreateIndex
CREATE INDEX "FileObject_ownerUserId_idx" ON "FileObject"("ownerUserId");

-- CreateIndex
CREATE INDEX "FileObject_spaceId_idx" ON "FileObject"("spaceId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_spaceId_idx" ON "AuditLog"("spaceId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_objectType_objectId_idx" ON "AuditLog"("objectType", "objectId");

-- CreateIndex
CREATE INDEX "IdempotencyKey_scope_idx" ON "IdempotencyKey"("scope");

-- CreateIndex
CREATE INDEX "IdempotencyKey_actorUserId_idx" ON "IdempotencyKey"("actorUserId");

-- CreateIndex
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationEvent_providerMessageId_key" ON "ConversationEvent"("providerMessageId");

-- CreateIndex
CREATE INDEX "ConversationEvent_userId_idx" ON "ConversationEvent"("userId");

-- CreateIndex
CREATE INDEX "ConversationEvent_spaceId_idx" ON "ConversationEvent"("spaceId");

-- CreateIndex
CREATE INDEX "ConversationEvent_providerMessageId_idx" ON "ConversationEvent"("providerMessageId");

-- AddForeignKey
ALTER TABLE "UserConsent" ADD CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_creatorUserId_fkey" FOREIGN KEY ("creatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceMember" ADD CONSTRAINT "SpaceMember_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceMember" ADD CONSTRAINT "SpaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_acceptedUserId_fkey" FOREIGN KEY ("acceptedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_payerMemberId_fkey" FOREIGN KEY ("payerMemberId") REFERENCES "SpaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_parentExpenseId_fkey" FOREIGN KEY ("parentExpenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "SpaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_fromMemberId_fkey" FOREIGN KEY ("fromMemberId") REFERENCES "SpaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_toMemberId_fkey" FOREIGN KEY ("toMemberId") REFERENCES "SpaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_payerMemberId_fkey" FOREIGN KEY ("payerMemberId") REFERENCES "SpaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_receiverMemberId_fkey" FOREIGN KEY ("receiverMemberId") REFERENCES "SpaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileObject" ADD CONSTRAINT "FileObject_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileObject" ADD CONSTRAINT "FileObject_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationEvent" ADD CONSTRAINT "ConversationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationEvent" ADD CONSTRAINT "ConversationEvent_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

