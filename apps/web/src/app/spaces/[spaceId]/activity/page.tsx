import { notFound } from "next/navigation";

import { Button } from "../../../../components/button";
import { Card } from "../../../../components/card";
import { EmptyState } from "../../../../components/empty-state";
import { PageHeader } from "../../../../components/page-header";
import { StatusBadge } from "../../../../components/status-badge";
import { getSpace, getSpaceActivity } from "../../../../lib/api-client";
import { routes } from "../../../../lib/routes";

type SpaceActivityPageProps = {
  params: Promise<{
    spaceId: string;
  }>;
};

export default async function SpaceActivityPage({ params }: SpaceActivityPageProps) {
  const { spaceId } = await params;
  const [space, activity] = await Promise.all([getSpace(spaceId), getSpaceActivity(spaceId)]);

  if (!space) {
    notFound();
  }

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <div className="button-group">
            <Button href={routes.space(space.id)} kind="ghost">
              Voltar ao espaco
            </Button>
            <Button href={routes.spaceExpenses(space.id)} kind="secondary">
              Despesas
            </Button>
          </div>
        }
        eyebrow="Historico"
        subtitle="Linha do tempo de eventos gravados no audit log do espaco."
        title={`Historico de ${space.name}`}
      />

      {activity.length === 0 ? (
        <EmptyState
          description="Nenhuma atividade foi registrada neste espaco ainda."
          title="Sem historico"
        />
      ) : (
        <div className="page-stack">
          {activity.map((item) => (
            <Card key={item.id}>
              <div className="page-stack">
                <div>
                  <strong>{item.summary}</strong>
                  <p className="helper-text">
                    {new Date(item.createdAt).toLocaleString("pt-BR")} · {item.objectType}
                    {item.objectId ? ` ${item.objectId}` : ""}
                  </p>
                </div>
                <StatusBadge label={item.action} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
