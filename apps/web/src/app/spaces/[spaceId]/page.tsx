import { notFound } from "next/navigation";

import { Button } from "../../../components/button";
import { Card } from "../../../components/card";
import { Money } from "../../../components/money";
import { PageHeader } from "../../../components/page-header";
import { StatusBadge } from "../../../components/status-badge";
import { getSpace } from "../../../lib/api-client";
import { routes } from "../../../lib/routes";

type SpaceDetailPageProps = {
  params: Promise<{
    spaceId: string;
  }>;
};

export default async function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  const { spaceId } = await params;
  const space = await getSpace(spaceId);

  if (!space) {
    notFound();
  }

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <div className="button-group">
            <Button href={routes.spaceExpenses(space.id)} kind="secondary">
              Ver despesas
            </Button>
            <Button href={routes.spaceBalances(space.id)} kind="secondary">
              Ver saldos
            </Button>
            <Button href={routes.spaceSettlement(space.id)}>Ver acerto</Button>
          </div>
        }
        eyebrow="Espaco compartilhado"
        subtitle={space.summary}
        title={space.name}
      />

      <div className="grid-4">
        <Card title="Status">
          <StatusBadge
            label={space.status}
            tone={space.status === "active" ? "positive" : "warning"}
          />
        </Card>
        <Card title="Moeda">
          <StatusBadge label={space.currency} />
        </Card>
        <Card title="Total de despesas">
          <div className="metric__value">
            <Money amountMinor={space.totalExpensesMinor} />
          </div>
        </Card>
        <Card title="Seu saldo resumido">
          <div className="metric__value">
            <Money
              amountMinor={space.yourBalanceMinor}
              tone={space.yourBalanceMinor >= 0 ? "positive" : "negative"}
            />
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Membros">
          <ul className="list-plain">
            {space.members.map((member) => (
              <li key={member.id}>
                <strong>{member.name}</strong> ·{" "}
                {member.role === "organizer" ? "organizador" : "membro"}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Navegacao do espaco">
          <div className="subnav">
            <Button href={routes.spaceExpenses(space.id)} kind="secondary">
              Despesas
            </Button>
            <Button href={routes.spaceBalances(space.id)} kind="secondary">
              Saldos
            </Button>
            <Button href={routes.spaceSettlement(space.id)} kind="secondary">
              Acerto
            </Button>
          </div>
          <p className="helper-text">
            A web exibe os dados estruturados do espaco. O registro conversacional continua sendo
            puxado pelo WhatsApp no roadmap do MVP.
          </p>
        </Card>
      </div>
    </div>
  );
}
