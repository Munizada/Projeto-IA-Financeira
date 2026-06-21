import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { Button } from "../../../components/button";
import { Card } from "../../../components/card";
import { Money } from "../../../components/money";
import { PageHeader } from "../../../components/page-header";
import { StatusBadge } from "../../../components/status-badge";
import { addSpaceMember, getSpace } from "../../../lib/api-client";
import { routes } from "../../../lib/routes";
import { seedUsers } from "../../../lib/seed-users";

type SpaceDetailPageProps = {
  params: Promise<{
    spaceId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function addMemberAction(spaceId: string, formData: FormData) {
  "use server";

  let target = `${routes.space(spaceId)}?memberError=1`;

  try {
    const nickname = getOptionalFormValue(formData, "nickname");

    await addSpaceMember(spaceId, {
      userId: getRequiredFormValue(formData, "userId"),
      role: getRequiredFormValue(formData, "role") as "organizer" | "member",
      ...(nickname ? { nickname } : {})
    });
    revalidatePath(routes.space(spaceId));
    target = `${routes.space(spaceId)}?memberCreated=1`;
  } catch {
    target = `${routes.space(spaceId)}?memberError=1`;
  }

  redirect(target);
}

export default async function SpaceDetailPage({ params, searchParams }: SpaceDetailPageProps) {
  const { spaceId } = await params;
  const space = await getSpace(spaceId);
  const currentParams = (await searchParams) ?? {};

  if (!space) {
    notFound();
  }

  const existingUserIds = new Set(space.members.map((member) => member.userId).filter(Boolean));
  const availableUsers = seedUsers.filter((user) => !existingUserIds.has(user.id));

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
            <Button href={routes.spaceActivity(space.id)} kind="secondary">
              Historico
            </Button>
            <Button href={routes.spaceSettlement(space.id)}>Ver acerto</Button>
          </div>
        }
        eyebrow="Espaco compartilhado"
        subtitle={space.summary}
        title={space.name}
      />

      {currentParams.memberCreated ? (
        <p className="notice notice--success">Membro adicionado com sucesso.</p>
      ) : null}
      {currentParams.memberError ? (
        <p className="notice notice--error">Nao foi possivel adicionar o membro.</p>
      ) : null}

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
        <Card title="Adicionar membro">
          {availableUsers.length === 0 ? (
            <p className="helper-text">Todos os usuarios seedados ja estao neste espaco.</p>
          ) : (
            <form action={addMemberAction.bind(null, space.id)} className="form-grid">
              <label>
                Usuario
                <select name="userId" required>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Papel
                <select defaultValue="member" name="role" required>
                  <option value="member">Membro</option>
                  <option value="organizer">Organizador</option>
                </select>
              </label>
              <label>
                Apelido
                <input name="nickname" placeholder="Opcional" />
              </label>
              <div className="form-actions">
                <button className="button button--primary" type="submit">
                  Adicionar membro
                </button>
              </div>
            </form>
          )}
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
            <Button href={routes.spaceActivity(space.id)} kind="secondary">
              Historico
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
