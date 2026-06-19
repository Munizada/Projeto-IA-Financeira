import { Button } from "../../components/button";
import { Card } from "../../components/card";
import { EmptyState } from "../../components/empty-state";
import { Money } from "../../components/money";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { getSpaces } from "../../lib/api-client";
import { routes } from "../../lib/routes";

export default async function SpacesPage() {
  const spaces = await getSpaces();

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <Button href={routes.home} kind="secondary">
            Voltar ao produto
          </Button>
        }
        eyebrow="Espacos"
        subtitle="Lista de espacos compartilhados disponiveis no MVP com fallback seguro para dados mockados."
        title="Espacos demo"
      />

      {spaces.length === 0 ? (
        <EmptyState
          action={<Button href={routes.home}>Voltar ao inicio</Button>}
          description="Nenhum espaco disponivel no momento."
          title="Sem espacos"
        />
      ) : (
        <div className="grid-2">
          {spaces.map((space) => (
            <Card key={space.id} title={space.name}>
              <div className="page-stack">
                <div className="inline-list">
                  <StatusBadge label={space.type} />
                  <StatusBadge
                    label={space.status}
                    tone={space.status === "active" ? "positive" : "warning"}
                  />
                  <StatusBadge label={space.currency} />
                </div>
                <p>{space.summary}</p>
                <div className="metric">
                  <span className="metric__label">Seu saldo resumido</span>
                  <span className="metric__value">
                    <Money
                      amountMinor={space.yourBalanceMinor}
                      tone={space.yourBalanceMinor >= 0 ? "positive" : "negative"}
                    />
                  </span>
                </div>
                <div className="definition-list">
                  <div>
                    <dt>Membros</dt>
                    <dd>{space.members.length}</dd>
                  </div>
                  <div>
                    <dt>Total registrado</dt>
                    <dd>
                      <Money amountMinor={space.totalExpensesMinor} />
                    </dd>
                  </div>
                </div>
                <div className="button-group">
                  <Button href={routes.space(space.id)}>Ver detalhe</Button>
                  <Button href={routes.spaceExpenses(space.id)} kind="secondary">
                    Ver despesas
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
