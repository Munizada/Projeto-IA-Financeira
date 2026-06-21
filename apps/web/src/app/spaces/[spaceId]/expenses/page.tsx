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
import {
  adjustExpense,
  cancelExpense,
  createExpense,
  getSpace,
  getSpaceExpenses
} from "../../../../lib/api-client";
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
    revalidatePath(routes.spaceActivity(spaceId));
    target = `${routes.spaceExpenses(spaceId)}?expenseCreated=1`;
  } catch {
    target = `${routes.spaceExpenses(spaceId)}?expenseError=1`;
  }

  redirect(target);
}

async function cancelExpenseAction(spaceId: string, expenseId: string, formData: FormData) {
  "use server";

  let target = `${routes.spaceExpenses(spaceId)}?cancelError=1`;

  try {
    const reason = getOptionalFormValue(formData, "reason");

    await cancelExpense(spaceId, expenseId, {
      actorUserId: getRequiredFormValue(formData, "actorUserId"),
      ...(reason ? { reason } : {})
    });
    revalidatePath(routes.space(spaceId));
    revalidatePath(routes.spaceExpenses(spaceId));
    revalidatePath(routes.spaceBalances(spaceId));
    revalidatePath(routes.spaceSettlement(spaceId));
    revalidatePath(routes.spaceActivity(spaceId));
    target = `${routes.spaceExpenses(spaceId)}?expenseCancelled=1`;
  } catch {
    target = `${routes.spaceExpenses(spaceId)}?cancelError=1`;
  }

  redirect(target);
}

async function adjustExpenseAction(spaceId: string, expenseId: string, formData: FormData) {
  "use server";

  let target = `${routes.spaceExpenses(spaceId)}?adjustError=1`;

  try {
    const reason = getOptionalFormValue(formData, "reason");

    await adjustExpense(spaceId, expenseId, {
      ...buildEqualSplitExpensePayload(formData),
      actorUserId: getRequiredFormValue(formData, "actorUserId"),
      ...(reason ? { reason } : {})
    });
    revalidatePath(routes.space(spaceId));
    revalidatePath(routes.spaceExpenses(spaceId));
    revalidatePath(routes.spaceBalances(spaceId));
    revalidatePath(routes.spaceSettlement(spaceId));
    revalidatePath(routes.spaceActivity(spaceId));
    target = `${routes.spaceExpenses(spaceId)}?expenseAdjusted=1`;
  } catch {
    target = `${routes.spaceExpenses(spaceId)}?adjustError=1`;
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
      {currentParams.expenseCancelled ? (
        <p className="notice notice--success">Despesa cancelada e ledger revertido.</p>
      ) : null}
      {currentParams.expenseAdjusted ? (
        <p className="notice notice--success">Despesa ajustada com nova versao.</p>
      ) : null}
      {currentParams.expenseError ? (
        <p className="notice notice--error">Nao foi possivel criar a despesa.</p>
      ) : null}
      {currentParams.cancelError ? (
        <p className="notice notice--error">Nao foi possivel cancelar a despesa.</p>
      ) : null}
      {currentParams.adjustError ? (
        <p className="notice notice--error">Nao foi possivel ajustar a despesa.</p>
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
                render: (expense) => (
                  <div>
                    <StatusBadge
                      label={expense.status}
                      tone={getExpenseStatusTone(expense.status)}
                    />
                    {expense.status === "cancelled" ? (
                      <div className="helper-text">Despesa cancelada</div>
                    ) : null}
                    {expense.status === "adjusted" ? (
                      <div className="helper-text">Original preservada; veja a nova versao.</div>
                    ) : null}
                    {expense.version ? (
                      <div className="helper-text">Versao {expense.version}</div>
                    ) : null}
                  </div>
                )
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
              },
              {
                header: "Acoes",
                render: (expense) => {
                  const selectedParticipantIds = new Set(
                    expense.splits.map((split) => split.memberId)
                  );
                  const dateValue = expense.expenseDate.slice(0, 10);

                  if (expense.status === "cancelled") {
                    return <span className="helper-text">Despesa cancelada.</span>;
                  }

                  if (expense.status === "adjusted") {
                    return <span className="helper-text">Ajuste ja criado.</span>;
                  }

                  return (
                    <div className="page-stack">
                      <form action={cancelExpenseAction.bind(null, space.id, expense.id)}>
                        <input name="actorUserId" type="hidden" value="user-arthur" />
                        <input name="reason" placeholder="Motivo do cancelamento" />
                        <div className="form-actions">
                          <button className="button button--secondary" type="submit">
                            Cancelar
                          </button>
                        </div>
                      </form>
                      <form
                        action={adjustExpenseAction.bind(null, space.id, expense.id)}
                        className="form-grid"
                      >
                        <input name="actorUserId" type="hidden" value="user-arthur" />
                        <input name="createdByUserId" type="hidden" value="user-arthur" />
                        <input name="splitRule" type="hidden" value="equal" />
                        <label>
                          Pagador
                          <select
                            defaultValue={expense.payerMemberId}
                            name="payerMemberId"
                            required
                          >
                            {space.members.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Valor em reais
                          <input
                            defaultValue={(expense.amountMinor / 100).toFixed(2).replace(".", ",")}
                            inputMode="decimal"
                            name="amountReais"
                            required
                          />
                        </label>
                        <label>
                          Descricao
                          <input defaultValue={expense.description} name="description" required />
                        </label>
                        <label>
                          Categoria
                          <input defaultValue={expense.category} name="category" />
                        </label>
                        <label>
                          Data
                          <input defaultValue={dateValue} name="expenseDate" required type="date" />
                        </label>
                        <label>
                          Motivo
                          <input name="reason" placeholder="Motivo do ajuste" />
                        </label>
                        <fieldset className="checkbox-group">
                          <legend>Participantes</legend>
                          {space.members.map((member) => (
                            <label key={member.id}>
                              <input
                                defaultChecked={selectedParticipantIds.has(member.id)}
                                name="participants"
                                type="checkbox"
                                value={member.id}
                              />
                              {member.name}
                            </label>
                          ))}
                        </fieldset>
                        <div className="form-actions">
                          <button className="button button--primary" type="submit">
                            Ajustar
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }
              }
            ]}
            items={expenses}
          />
        </Card>
      )}
    </div>
  );
}

function getExpenseStatusTone(status: string): "positive" | "warning" | "neutral" {
  if (status === "confirmed") {
    return "positive";
  }

  if (status === "cancelled" || status === "adjusted") {
    return "warning";
  }

  return "neutral";
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing form field: ${key}`);
  }

  return value.trim();
}

function getOptionalFormValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return value.trim();
}
