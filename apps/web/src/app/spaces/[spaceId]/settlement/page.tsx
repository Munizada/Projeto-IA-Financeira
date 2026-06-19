import { notFound } from "next/navigation";

import { Card } from "../../../../components/card";
import { DataTable } from "../../../../components/data-table";
import { Money } from "../../../../components/money";
import { PageHeader } from "../../../../components/page-header";
import { StatusBadge } from "../../../../components/status-badge";
import { getSpace, getSpaceSettlement } from "../../../../lib/api-client";

type SpaceSettlementPageProps = {
  params: Promise<{
    spaceId: string;
  }>;
};

export default async function SpaceSettlementPage({ params }: SpaceSettlementPageProps) {
  const { spaceId } = await params;
  const [space, settlement] = await Promise.all([getSpace(spaceId), getSpaceSettlement(spaceId)]);

  if (!space) {
    notFound();
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Acerto final"
        subtitle="No MVP, o Pix e manual. O sistema apenas organiza o acerto e deixa claro quem paga quem."
        title={`Acerto de ${space.name}`}
      />

      <Card title="Aviso do MVP">
        <p className="notice">
          No MVP, o Pix e manual. O sistema apenas organiza o acerto e registra o status dentro do
          espaco.
        </p>
      </Card>

      <Card>
        <DataTable
          columns={[
            {
              header: "Quem paga",
              render: (payment) => payment.fromMemberName
            },
            {
              header: "Quem recebe",
              render: (payment) => payment.toMemberName
            },
            {
              header: "Valor",
              render: (payment) => <Money amountMinor={payment.amountMinor} />
            },
            {
              header: "Status",
              render: (payment) => <StatusBadge label={payment.status} tone="warning" />
            }
          ]}
          items={settlement}
        />
      </Card>
    </div>
  );
}
