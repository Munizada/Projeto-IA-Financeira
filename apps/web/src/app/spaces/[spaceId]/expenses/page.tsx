import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { Button } from "../../../../components/button";
import { Card } from "../../../../components/card";
import { DataTable } from "../../../../components/data-table";
import { EmptyState } from "../../../../components/empty-state";
import { Money } from "../../../../components/money";
import { PageHeader } from "../../../../components/page-header";
import { StatusBadge } from "../../../../components/status-badge";
import { createExpense, getSpace, getSpaceExpenses } from "../../../../lib/api-client";
import { buildEqualSplitExpensePayload } from "../../../../lib/product-flow";
import { routes } from "../../../../lib/routes";
import { seedUsers } from "../../../../lib/seed-users";

type SpaceExpensesPageProps = {
  params: Promise<{
    spaceId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function createExpenseAction(spaceId: string, formData: FormData) {
  "use server";

  let target = `${routes.spaceExpenses(spaceId)}?expenseError=1`;

  try {
    await createExpense(spaceId, buildEqualSplitExpensePayload(formData));
    revalidatePath(routes.space(spaceId));
    revalidatePath(routes.spaceExpenses(spaceId));
    revalidatePath(routes.spaceBalances(spaceId));
    revalidatePath(routes.spaceSettlement(spaceId));
    target = `${routes.spaceExpenses(spaceId)}?expenseCreated=1`;
  } catch {
    target = `${routes.spaceExpenses(spaceId)}?expenseError=1`;
  }

  redirect(target);
}

export default async function SpaceExpensesPage({ params, searchParams }: SpaceExpensesPageProps) {
  const { spaceId } = await params;
  const [space, expenses] = await Promise.all([getSpace(spaceId), getSpaceExpenses(spaceId)]);
  const currentParams = (await searchParams) ?? {};

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
          </div>
        }
        eyebrow="Despesas"
        subtitle="Lista de despesas confirmadas do espaco com resumo dos splits."
        title={`Despesas de ${space.name}`}
      />

      {currentParams.expenseCreated ? (
        <p className="notice notice--success">Despesa criada e ledger atualizado.</p>
      ) : null}
      {currentParams.expenseError ? (
        <p className="notice notice--error">Nao foi possivel criar a despesa.</p>
      ) : null}

      <Card title="Nova despesa equal split">
        <form action={createExpenseAction.bind(null, space.id)} className="form-grid">
          <label>
            Criado por
            <select defaultValue="user-arthur" name="createdByUserId" required>
              {seedUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Pagador
            <select name="payerMemberId" required>
              {space.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Valor em reais
            <input inputMode="decimal" name="amountReais" placeholder="48,00" required />
          </label>
          <label>
            Moeda
            <input name="currency" readOnly value={space.currency} />
          </label>
          <label>
            Descricao
            <input name="description" placeholder="Jantar" required />
          </label>
          <label>
            Categoria
            <input name="category" placeholder="alimentacao" />
          </label>
          <label>
            Data
            <input name="expenseDate" required type="date" />
          </label>
          <fieldset className="checkbox-group">
            <legend>Participantes</legend>
            {space.members.map((member) => (
              <label key={member.id}>
                <input defaultChecked name="participants" type="checkbox" value={member.id} />
                {member.name}
              </label>
            ))}
          </fieldset>
          <input name="splitRule" type="hidden" value="equal" />
          <div className="form-actions">
            <button className="button button--primary" type="submit">
              Criar despesa
            </button>
          </div>
        </form>
      </Card>

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
