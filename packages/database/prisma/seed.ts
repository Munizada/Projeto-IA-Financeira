import {
  ConsentType,
  ExpenseSource,
  ExpenseStatus,
  LedgerEventType,
  LedgerReferenceType,
  MemberRole,
  MemberStatus,
  SpaceStatus,
  SpaceType,
  SplitRule,
  UserStatus,
  PrismaClient
} from "@prisma/client";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/ia_financeira_whatsapp?schema=public";

const prisma = new PrismaClient();

const now = new Date("2026-06-18T12:00:00.000Z");

const users = [
  {
    id: "user-arthur",
    whatsappPhone: "+5500000000001",
    displayName: "Arthur"
  },
  {
    id: "user-ana",
    whatsappPhone: "+5500000000002",
    displayName: "Ana"
  },
  {
    id: "user-bruno",
    whatsappPhone: "+5500000000003",
    displayName: "Bruno"
  },
  {
    id: "user-caio",
    whatsappPhone: "+5500000000004",
    displayName: "Caio"
  }
] as const;

const memberIdsByUserId = {
  "user-arthur": "member-arthur",
  "user-ana": "member-ana",
  "user-bruno": "member-bruno",
  "user-caio": "member-caio"
} as const;

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { whatsappPhone: user.whatsappPhone },
      update: {
        displayName: user.displayName,
        status: UserStatus.active,
        termsAcceptedAt: now,
        privacyPolicyAcceptedAt: now
      },
      create: {
        id: user.id,
        whatsappPhone: user.whatsappPhone,
        displayName: user.displayName,
        status: UserStatus.active,
        termsAcceptedAt: now,
        privacyPolicyAcceptedAt: now
      }
    });

    await prisma.userConsent.upsert({
      where: { id: `consent-${user.id}-terms` },
      update: {
        granted: true,
        source: "seed"
      },
      create: {
        id: `consent-${user.id}-terms`,
        userId: user.id,
        type: ConsentType.terms,
        granted: true,
        source: "seed",
        metadata: { version: "dev" }
      }
    });
  }

  await prisma.space.upsert({
    where: { id: "space-floripa-mvp" },
    update: {
      name: "Floripa MVP",
      status: SpaceStatus.active
    },
    create: {
      id: "space-floripa-mvp",
      publicCode: "floripa-mvp",
      name: "Floripa MVP",
      type: SpaceType.trip,
      currency: "BRL",
      creatorUserId: "user-arthur",
      status: SpaceStatus.active,
      defaultSplitRule: SplitRule.equal,
      metadata: { seed: true, segment: "trip" }
    }
  });

  for (const user of users) {
    await prisma.spaceMember.upsert({
      where: {
        spaceId_userId: {
          spaceId: "space-floripa-mvp",
          userId: user.id
        }
      },
      update: {
        role: user.id === "user-arthur" ? MemberRole.organizer : MemberRole.member,
        status: MemberStatus.active,
        nickname: user.displayName
      },
      create: {
        id: memberIdsByUserId[user.id],
        spaceId: "space-floripa-mvp",
        userId: user.id,
        role: user.id === "user-arthur" ? MemberRole.organizer : MemberRole.member,
        status: MemberStatus.active,
        nickname: user.displayName,
        joinedAt: now,
        paymentPreferences: { pix: "not_configured" }
      }
    });
  }

  await prisma.expense.upsert({
    where: { id: "expense-airbnb" },
    update: {
      amountMinor: 48000,
      status: ExpenseStatus.confirmed
    },
    create: {
      id: "expense-airbnb",
      spaceId: "space-floripa-mvp",
      createdByUserId: "user-arthur",
      payerMemberId: "member-arthur",
      amountMinor: 48000,
      currency: "BRL",
      description: "Airbnb",
      category: "hospedagem",
      expenseDate: now,
      status: ExpenseStatus.confirmed,
      source: ExpenseSource.web,
      idempotencyKey: "seed-expense-airbnb",
      confirmedAt: now
    }
  });

  for (const memberId of ["member-arthur", "member-ana", "member-bruno", "member-caio"]) {
    await prisma.expenseSplit.upsert({
      where: {
        expenseId_memberId: {
          expenseId: "expense-airbnb",
          memberId
        }
      },
      update: {
        amountMinor: 12000
      },
      create: {
        id: `split-airbnb-${memberId}`,
        expenseId: "expense-airbnb",
        memberId,
        amountMinor: 12000,
        currency: "BRL",
        splitRule: SplitRule.equal
      }
    });
  }

  for (const debtorMemberId of ["member-ana", "member-bruno", "member-caio"]) {
    await prisma.ledgerEntry.upsert({
      where: { id: `ledger-airbnb-${debtorMemberId}-arthur` },
      update: {
        amountMinor: 12000
      },
      create: {
        id: `ledger-airbnb-${debtorMemberId}-arthur`,
        spaceId: "space-floripa-mvp",
        eventId: "event-expense-airbnb-confirmed",
        eventType: LedgerEventType.expense_confirmed,
        fromMemberId: debtorMemberId,
        toMemberId: "member-arthur",
        amountMinor: 12000,
        currency: "BRL",
        referenceType: LedgerReferenceType.expense,
        referenceId: "expense-airbnb",
        expenseId: "expense-airbnb",
        createdAt: now
      }
    });
  }

  await prisma.auditLog.upsert({
    where: { id: "audit-seed-airbnb" },
    update: {
      action: "expense.confirmed"
    },
    create: {
      id: "audit-seed-airbnb",
      actorUserId: "user-arthur",
      spaceId: "space-floripa-mvp",
      action: "expense.confirmed",
      objectType: "Expense",
      objectId: "expense-airbnb",
      after: { amountMinor: 48000, currency: "BRL", description: "Airbnb" },
      requestId: "seed-request"
    }
  });

  await prisma.conversationEvent.upsert({
    where: { providerMessageId: "seed-message-airbnb" },
    update: {
      processedAt: now
    },
    create: {
      id: "conversation-seed-airbnb",
      userId: "user-arthur",
      spaceId: "space-floripa-mvp",
      provider: "seed",
      providerMessageId: "seed-message-airbnb",
      direction: "inbound",
      messageType: "text",
      text: "Paguei R$ 480 no Airbnb pra todo mundo.",
      normalizedIntent: "create_expense",
      rawPayload: { seed: true },
      processedAt: now
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
