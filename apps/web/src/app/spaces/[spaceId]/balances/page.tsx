import { notFound } from "next/navigation";

import { Card } from "../../../../components/card";
import { DataTable } from "../../../../components/data-table";
import { Money } from "../../../../components/money";
import { PageHeader } from "../../../../components/page-header";
import { StatusBadge } from "../../../../components/status-badge";
import { getSpace, getSpaceBalances } from "../../../../lib/api-client";
import { describeBalance } from "../../../../lib/money";

type SpaceBalancesPageProps = {
  params: Promise<{
    spaceId: string;
  }>;
};

export default async function SpaceBalancesPage({ params }: SpaceBalancesPageProps) {
  const { spaceId } = await params;
  const [space, balances] = await Promise.all([getSpace(spaceId), getSpaceBalances(spaceId)]);

  if (!space) {
    notFound();
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Saldos"
        subtitle="A tela apenas exibe os saldos ja calculados pela API ou pelos mocks de desenvolvimento."
        title={`Saldos de ${space.name}`}
      />

      <Card>
        <DataTable
          columns={[
            {
              header: "Membro",
              render: (balance) => balance.memberName
            },
            {
              header: "Situacao",
              render: (balance) => {
                const kind = describeBalance(balance.balanceMinor);

                return (
                  <StatusBadge
                    label={kind}
                    tone={kind === "recebe" ? "positive" : kind === "paga" ? "warning" : "neutral"}
                  />
                );
              }
            },
            {
              header: "Valor",
              render: (balance) => (
                <Money
                  amountMinor={Math.abs(balance.balanceMinor)}
                  tone={
                    balance.balanceMinor > 0
                      ? "positive"
                      : balance.balanceMinor < 0
                        ? "negative"
                        : "default"
                  }
                />
              )
            }
          ]}
          items={balances}
        />
      </Card>
    </div>
  );
}
