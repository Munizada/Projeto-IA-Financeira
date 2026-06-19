import { notFound } from "next/navigation";

import { Button } from "../../../../components/button";
import { Card } from "../../../../components/card";
import { DataTable } from "../../../../components/data-table";
import { EmptyState } from "../../../../components/empty-state";
import { Money } from "../../../../components/money";
import { PageHeader } from "../../../../components/page-header";
import { StatusBadge } from "../../../../components/status-badge";
import { getSpace, getSpaceExpenses } from "../../../../lib/api-client";
import { routes } from "../../../../lib/routes";

type SpaceExpensesPageProps = {
  params: Promise<{
    spaceId: string;
  }>;
};

export default async function SpaceExpensesPage({ params }: SpaceExpensesPageProps) {
  const { spaceId } = await params;
  const [space, expenses] = await Promise.all([getSpace(spaceId), getSpaceExpenses(spaceId)]);

  if (!space) {
    notFound();
  }

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <div className="button-group">
            <Button disabled kind="secondary">
              Nova despesa em breve
            </Button>
            <Button href={routes.space(space.id)} kind="ghost">
              Voltar ao espaco
            </Button>
          </div>
        }
        eyebrow="Despesas"
        subtitle="Lista de despesas confirmadas do espaco com resumo dos splits."
        title={`Despesas de ${space.name}`}
      />

      {expenses.length === 0 ? (
        <EmptyState
          description="Nenhuma despesa foi registrada neste espaco ainda."
          title="Sem despesas"
        />
      ) : (
        <Card>
          <DataTable
            columns={[
              {
                header: "Descricao",
                render: (expense) => (
                  <div>
                    <strong>{expense.description}</strong>
                    <div className="helper-text">{expense.category}</div>
                  </div>
                )
              },
              {
                header: "Valor",
                render: (expense) => <Money amountMinor={expense.amountMinor} />
              },
              {
                header: "Pagador",
                render: (expense) => expense.payerMemberName
              },
              {
                header: "Data",
                render: (expense) => new Date(expense.expenseDate).toLocaleDateString("pt-BR")
              },
              {
                header: "Status",
                render: (expense) => <StatusBadge label={expense.status} tone="positive" />
              },
              {
                header: "Splits",
                render: (expense) => (
                  <div className="helper-text">
                    {expense.splits
                      .map((split) => `${split.memberName}: ${split.amountMinor / 100}`)
                      .join(" · ")}
                  </div>
                )
              }
            ]}
            items={expenses}
          />
        </Card>
      )}
    </div>
  );
}
