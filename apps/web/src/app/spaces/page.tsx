import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Button } from "../../components/button";
import { Card } from "../../components/card";
import { EmptyState } from "../../components/empty-state";
import { Money } from "../../components/money";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { createSpace, getSpaces } from "../../lib/api-client";
import { routes } from "../../lib/routes";
import { seedUsers } from "../../lib/seed-users";

type SpacesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function createSpaceAction(formData: FormData) {
  "use server";

  let target = `${routes.spaces}?spaceError=1`;

  try {
    const created = await createSpace({
      creatorUserId: getRequiredFormValue(formData, "creatorUserId"),
      currency: "BRL",
      name: getRequiredFormValue(formData, "name"),
      type: getRequiredFormValue(formData, "type") as Parameters<typeof createSpace>[0]["type"]
    });

    revalidatePath(routes.spaces);
    target = created.id ? routes.space(created.id) : `${routes.spaces}?spaceCreated=1`;
  } catch {
    target = `${routes.spaces}?spaceError=1`;
  }

  redirect(target);
}

export default async function SpacesPage({ searchParams }: SpacesPageProps) {
  const spaces = await getSpaces();
  const params = (await searchParams) ?? {};

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

      {params.spaceCreated ? (
        <p className="notice notice--success">Espaco criado com sucesso.</p>
      ) : null}
      {params.spaceError ? (
        <p className="notice notice--error">Nao foi possivel criar o espaco agora.</p>
      ) : null}

      <Card title="Criar espaco">
        <form action={createSpaceAction} className="form-grid">
          <label>
            Nome
            <input name="name" placeholder="Runtime Test - viagem" required />
          </label>
          <label>
            Tipo
            <select defaultValue="trip" name="type" required>
              <option value="trip">Viagem</option>
              <option value="home">Casa</option>
              <option value="couple">Casal</option>
              <option value="event">Evento</option>
              <option value="restaurant">Restaurante</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            Moeda
            <input name="currency" readOnly value="BRL" />
          </label>
          <label>
            Criador
            <select defaultValue="user-arthur" name="creatorUserId" required>
              {seedUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button className="button button--primary" type="submit">
              Criar espaco
            </button>
          </div>
        </form>
      </Card>

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

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing form field: ${key}`);
  }

  return value.trim();
}
