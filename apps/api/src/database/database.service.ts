import { Injectable, Optional, type OnModuleDestroy } from "@nestjs/common";
import { prisma } from "@ia-financeira/database";

export type DatabaseOperationClient = Pick<
  typeof prisma,
  "auditLog" | "expense" | "ledgerEntry" | "payment" | "space" | "spaceMember" | "user"
>;

export type DatabaseClient = DatabaseOperationClient &
  Pick<typeof prisma, "$disconnect" | "$transaction">;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(@Optional() private readonly client: DatabaseClient = prisma as DatabaseClient) {}

  get auditLog() {
    return this.client.auditLog;
  }

  get expense() {
    return this.client.expense;
  }

  get ledgerEntry() {
    return this.client.ledgerEntry;
  }

  get payment() {
    return this.client.payment;
  }

  get space() {
    return this.client.space;
  }

  get spaceMember() {
    return this.client.spaceMember;
  }

  get user() {
    return this.client.user;
  }

  async transaction<TValue>(
    operation: (database: DatabaseOperationClient) => Promise<TValue>
  ): Promise<TValue> {
    return this.client.$transaction((transactionClient) =>
      operation(transactionClient as unknown as DatabaseOperationClient)
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
