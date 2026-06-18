# Modelo de Banco PostgreSQL + Prisma — MVP

## 1. Objetivo

Este documento transforma o modelo conceitual do produto em um modelo técnico pronto para orientar a implementação com PostgreSQL e Prisma.

O banco precisa suportar:

- usuários;
- Espaços Compartilhados;
- membros;
- convites;
- despesas;
- rateios;
- ledger;
- pagamentos;
- comprovantes;
- arquivos;
- auditoria;
- idempotência;
- consentimentos;
- preferências Pix;
- eventos de conversa.

## 2. Princípios do banco

## 2.1 Dinheiro como inteiro

Todo valor monetário deve ser salvo em centavos.

Exemplo:

- R$ 1,00 = 100
- R$ 10,50 = 1050

Campo padrão:

```prisma
amountMinor Int
currency    String @default("BRL")
```

Nunca usar `Float` para dinheiro.

## 2.2 Ledger imutável

Entradas do ledger não devem ser editadas.

Correções devem gerar:

- nova despesa;
- ajuste;
- cancelamento lógico;
- lançamento compensatório;
- audit log.

## 2.3 Convite seguro

Convite não deve salvar token puro.

Salvar:

- `tokenHash`;
- validade;
- status;
- uso único;
- revogação.

## 2.4 Idempotência persistida

Redis pode ajudar, mas idempotência financeira precisa existir no PostgreSQL.

## 2.5 Auditoria obrigatória

Toda operação financeira ou sensível deve gerar audit log.

---

## 3. Enums recomendados

```prisma
enum UserStatus {
  active
  blocked
  deleted
}

enum SpaceType {
  trip
  home
  couple
  event
  restaurant
  other
}

enum SpaceStatus {
  draft
  active
  closing
  closed
  archived
  cancelled
}

enum MemberRole {
  organizer
  member
  treasurer
  guest
}

enum MemberStatus {
  invited
  active
  removed
  left
  blocked
}

enum InviteStatus {
  created
  sent
  opened
  accepted
  expired
  revoked
  used
}

enum SplitRule {
  equal
  percentage
  shares
  fixed
  manual_adjustment
}

enum ExpenseStatus {
  draft
  pending_confirmation
  confirmed
  contested
  adjusted
  cancelled
}

enum ExpenseSource {
  whatsapp_text
  whatsapp_audio
  receipt_ocr
  web
  import
  system
}

enum LedgerEventType {
  expense_confirmed
  expense_adjusted
  expense_cancelled
  payment_confirmed
  manual_adjustment
}

enum LedgerReferenceType {
  expense
  payment
  adjustment
}

enum PaymentStatus {
  pending
  pix_generated
  marked_paid
  receipt_uploaded
  confirmed
  contested
  failed
  cancelled
  expired
}

enum FileKind {
  receipt
  payment_receipt
  image
  audio
  report
  other
}

enum IdempotencyStatus {
  processing
  succeeded
  failed
}

enum ConsentType {
  terms
  privacy_policy
  whatsapp_messages
  ai_processing
  open_finance_read
  payment_initiation
}
```

---

## 4. Schema Prisma sugerido

Este schema é uma base. O Codex pode ajustar sintaxe fina conforme a versão do Prisma, mas deve manter a semântica.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                      String        @id @default(uuid())
  whatsappPhone           String        @unique
  displayName             String
  preferredLanguage       String        @default("pt-BR")
  status                  UserStatus    @default(active)
  termsAcceptedAt         DateTime?
  privacyPolicyAcceptedAt DateTime?
  createdAt               DateTime      @default(now())
  updatedAt               DateTime      @updatedAt

  memberships             SpaceMember[]
  createdSpaces           Space[]       @relation("SpaceCreator")
  sentInvites             Invite[]      @relation("InvitedBy")
  acceptedInvites         Invite[]      @relation("AcceptedBy")
  createdExpenses         Expense[]     @relation("ExpenseCreatedBy")
  createdPayments         Payment[]     @relation("PaymentCreatedBy")
  confirmedPayments       Payment[]     @relation("PaymentConfirmedBy")
  files                   FileObject[]
  auditLogs               AuditLog[]
  consents                UserConsent[]
  conversationEvents      ConversationEvent[]

  @@index([whatsappPhone])
}

model UserConsent {
  id          String      @id @default(uuid())
  userId      String
  type        ConsentType
  granted     Boolean     @default(true)
  source      String?
  metadata    Json?
  createdAt   DateTime    @default(now())

  user        User        @relation(fields: [userId], references: [id])

  @@index([userId, type])
}

model Space {
  id               String        @id @default(uuid())
  publicCode       String?
  name             String
  type             SpaceType
  currency         String        @default("BRL")
  creatorUserId    String
  status           SpaceStatus   @default(active)
  startDate        DateTime?
  endDate          DateTime?
  defaultSplitRule SplitRule     @default(equal)
  metadata         Json?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  closedAt         DateTime?

  creator          User          @relation("SpaceCreator", fields: [creatorUserId], references: [id])
  members          SpaceMember[]
  invites          Invite[]
  expenses         Expense[]
  ledgerEntries    LedgerEntry[]
  payments         Payment[]
  files            FileObject[]
  auditLogs        AuditLog[]
  conversationEvents ConversationEvent[]

  @@index([creatorUserId])
  @@index([status])
  @@index([publicCode])
}

model SpaceMember {
  id                 String        @id @default(uuid())
  spaceId            String
  userId             String
  role               MemberRole    @default(member)
  status             MemberStatus  @default(active)
  nickname           String?
  pixKey             String?
  pixKeyType         String?
  paymentPreferences Json?
  joinedAt           DateTime?
  removedAt          DateTime?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  space              Space         @relation(fields: [spaceId], references: [id])
  user               User          @relation(fields: [userId], references: [id])

  paidExpenses       Expense[]     @relation("ExpensePayer")
  createdSplits      ExpenseSplit[]
  ledgerDebits       LedgerEntry[] @relation("LedgerFromMember")
  ledgerCredits      LedgerEntry[] @relation("LedgerToMember")
  paymentsMade       Payment[]     @relation("PaymentPayer")
  paymentsReceived   Payment[]     @relation("PaymentReceiver")

  @@unique([spaceId, userId])
  @@index([spaceId, status])
  @@index([userId])
}

model Invite {
  id              String       @id @default(uuid())
  spaceId         String
  invitedPhone    String?
  invitedName     String?
  invitedByUserId String
  tokenHash       String       @unique
  status          InviteStatus @default(created)
  expiresAt       DateTime
  usedAt          DateTime?
  acceptedUserId  String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  space           Space        @relation(fields: [spaceId], references: [id])
  invitedBy       User         @relation("InvitedBy", fields: [invitedByUserId], references: [id])
  acceptedUser    User?        @relation("AcceptedBy", fields: [acceptedUserId], references: [id])

  @@index([spaceId])
  @@index([status, expiresAt])
}

model Expense {
  id               String         @id @default(uuid())
  spaceId          String
  createdByUserId  String
  payerMemberId    String
  amountMinor      Int
  currency         String         @default("BRL")
  description      String
  category         String?
  expenseDate      DateTime
  status           ExpenseStatus  @default(draft)
  source           ExpenseSource  @default(web)
  sourceMessageId  String?
  idempotencyKey   String?        @unique
  version          Int            @default(1)
  parentExpenseId  String?
  confirmedAt      DateTime?
  cancelledAt      DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  space            Space          @relation(fields: [spaceId], references: [id])
  createdBy        User           @relation("ExpenseCreatedBy", fields: [createdByUserId], references: [id])
  payer            SpaceMember    @relation("ExpensePayer", fields: [payerMemberId], references: [id])
  parentExpense    Expense?       @relation("ExpenseVersions", fields: [parentExpenseId], references: [id])
  childExpenses    Expense[]      @relation("ExpenseVersions")
  splits           ExpenseSplit[]
  ledgerEntries    LedgerEntry[]

  @@index([spaceId, status])
  @@index([payerMemberId])
  @@index([sourceMessageId])
}

model ExpenseSplit {
  id           String      @id @default(uuid())
  expenseId    String
  memberId     String
  amountMinor  Int
  currency     String      @default("BRL")
  splitRule    SplitRule
  splitWeight  Decimal?
  percentage   Decimal?
  createdAt    DateTime    @default(now())

  expense      Expense     @relation(fields: [expenseId], references: [id])
  member       SpaceMember @relation(fields: [memberId], references: [id])

  @@unique([expenseId, memberId])
  @@index([memberId])
}

model LedgerEntry {
  id             String              @id @default(uuid())
  spaceId        String
  eventId        String
  eventType      LedgerEventType
  fromMemberId   String
  toMemberId     String
  amountMinor    Int
  currency       String              @default("BRL")
  referenceType  LedgerReferenceType
  referenceId    String
  expenseId      String?
  createdAt      DateTime            @default(now())

  space          Space               @relation(fields: [spaceId], references: [id])
  fromMember     SpaceMember         @relation("LedgerFromMember", fields: [fromMemberId], references: [id])
  toMember       SpaceMember         @relation("LedgerToMember", fields: [toMemberId], references: [id])
  expense        Expense?            @relation(fields: [expenseId], references: [id])

  @@index([spaceId])
  @@index([fromMemberId])
  @@index([toMemberId])
  @@index([referenceType, referenceId])
  @@index([eventId])
}

model Payment {
  id                   String        @id @default(uuid())
  spaceId              String
  payerMemberId         String
  receiverMemberId      String
  amountMinor           Int
  currency              String        @default("BRL")
  status                PaymentStatus @default(pending)
  pixPayload            String?
  pixQrCodeUrl          String?
  idempotencyKey        String        @unique
  dueReference          Json?
  createdByUserId       String
  confirmedByUserId     String?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  confirmedAt           DateTime?
  cancelledAt           DateTime?

  space                 Space         @relation(fields: [spaceId], references: [id])
  payer                 SpaceMember   @relation("PaymentPayer", fields: [payerMemberId], references: [id])
  receiver              SpaceMember   @relation("PaymentReceiver", fields: [receiverMemberId], references: [id])
  createdBy             User          @relation("PaymentCreatedBy", fields: [createdByUserId], references: [id])
  confirmedBy           User?         @relation("PaymentConfirmedBy", fields: [confirmedByUserId], references: [id])
  receipts              PaymentReceipt[]

  @@index([spaceId, status])
  @@index([payerMemberId])
  @@index([receiverMemberId])
}

model PaymentReceipt {
  id              String      @id @default(uuid())
  paymentId       String
  uploadedByUserId String
  fileId          String
  status          String      @default("uploaded")
  parsedData      Json?
  createdAt       DateTime    @default(now())
  reviewedAt      DateTime?

  payment         Payment     @relation(fields: [paymentId], references: [id])
  file            FileObject  @relation(fields: [fileId], references: [id])

  @@index([paymentId])
}

model FileObject {
  id            String      @id @default(uuid())
  ownerUserId   String
  spaceId       String?
  kind          FileKind
  storageKey    String
  mimeType      String
  sizeBytes     Int
  checksum      String?
  encrypted     Boolean     @default(true)
  createdAt     DateTime    @default(now())

  owner         User        @relation(fields: [ownerUserId], references: [id])
  space         Space?      @relation(fields: [spaceId], references: [id])
  paymentReceipts PaymentReceipt[]

  @@index([ownerUserId])
  @@index([spaceId])
  @@index([kind])
}

model AuditLog {
  id          String    @id @default(uuid())
  actorUserId String?
  spaceId     String?
  action      String
  objectType  String
  objectId    String?
  before      Json?
  after       Json?
  ipHash      String?
  userAgent   String?
  requestId   String?
  createdAt   DateTime  @default(now())

  actor       User?      @relation(fields: [actorUserId], references: [id])
  space       Space?     @relation(fields: [spaceId], references: [id])

  @@index([actorUserId])
  @@index([spaceId])
  @@index([action])
  @@index([objectType, objectId])
}

model IdempotencyKey {
  key          String             @id
  scope        String
  actorUserId  String?
  requestHash  String
  responseHash String?
  status       IdempotencyStatus  @default(processing)
  expiresAt    DateTime?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  @@index([scope])
  @@index([actorUserId])
  @@index([expiresAt])
}

model ConversationEvent {
  id                String    @id @default(uuid())
  userId            String
  spaceId           String?
  provider          String    @default("whatsapp")
  providerMessageId String?   @unique
  direction         String
  messageType       String
  text              String?
  normalizedIntent  String?
  rawPayload        Json?
  processedAt       DateTime?
  createdAt         DateTime  @default(now())

  user              User      @relation(fields: [userId], references: [id])
  space             Space?    @relation(fields: [spaceId], references: [id])

  @@index([userId])
  @@index([spaceId])
  @@index([providerMessageId])
}
```

---

## 5. Regras adicionais para implementação

## 5.1 Constraints no nível de aplicação

Algumas regras são difíceis de garantir só no Prisma e devem ser validadas em service/core:

- `amountMinor >= 0`;
- `currency` igual entre despesa, splits e ledger;
- soma de splits igual ao total da despesa;
- membro pertence ao Espaço;
- pagador pertence ao Espaço;
- pagamento entre membros do mesmo Espaço;
- convite não expirado;
- convite não usado;
- usuário tem permissão para ação;
- despesa confirmada não é editada diretamente.

## 5.2 Índices importantes

Priorizar índices em:

- `User.whatsappPhone`;
- `Space.creatorUserId`;
- `Space.status`;
- `SpaceMember.spaceId/status`;
- `Invite.tokenHash`;
- `Invite.status/expiresAt`;
- `Expense.spaceId/status`;
- `LedgerEntry.spaceId`;
- `Payment.spaceId/status`;
- `IdempotencyKey.key`;
- `ConversationEvent.providerMessageId`.

## 5.3 Seeds de desenvolvimento

Criar seed com:

- usuário Arthur;
- usuário Ana;
- usuário Bruno;
- Espaço “Floripa MVP”;
- membros;
- despesa “Airbnb R$ 480”;
- splits;
- ledger;
- settlement esperado.

## 5.4 Comandos esperados

```bash
pnpm --filter database prisma validate
pnpm --filter database prisma generate
pnpm --filter database prisma migrate dev
pnpm --filter database seed
```

## 6. Definition of Done

O modelo de banco está pronto quando:

- Prisma valida;
- migration roda;
- seed roda;
- relações fazem sentido;
- dinheiro usa inteiro;
- token de convite é hash;
- há suporte a auditoria;
- há suporte a idempotência;
- não há Open Finance real no MVP;
- não há movimentação automática de dinheiro.
