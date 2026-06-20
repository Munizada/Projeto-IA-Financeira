import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { Card } from "../../../../components/card";
import { DataTable } from "../../../../components/data-table";
import { Money } from "../../../../components/money";
import { PageHeader } from "../../../../components/page-header";
import { StatusBadge } from "../../../../components/status-badge";
import { confirmPayment, getSpace, getSpaceSettlement } from "../../../../lib/api-client";
import { routes } from "../../../../lib/routes";
import { seedUsers } from "../../../../lib/seed-users";

type SpaceSettlementPageProps = {
  params: Promise<{
    spaceId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function confirmPaymentAction(spaceId: string, formData: FormData) {
  "use server";

  let target = `${routes.spaceSettlement(spaceId)}?paymentError=1`;

  try {
    await confirmPayment(spaceId, {
      amountMinor: Number.parseInt(getRequiredFormValue(formData, "amountMinor"), 10),
      createdByUserId: getRequiredFormValue(formData, "createdByUserId"),
      currency: "BRL",
      payerMemberId: getRequiredFormValue(formData, "payerMemberId"),
      receiverMemberId: getRequiredFormValue(formData, "receiverMemberId")
    });
    revalidatePath(routes.space(spaceId));
    revalidatePath(routes.spaceBalances(spaceId));
    revalidatePath(routes.spaceSettlement(spaceId));
    target = `${routes.spaceSettlement(spaceId)}?paymentConfirmed=1`;
  } catch {
    target = `${routes.spaceSettlement(spaceId)}?paymentError=1`;
  }

  redirect(target);
}

export default async function SpaceSettlementPage({
  params,
  searchParams
}: SpaceSettlementPageProps) {
  const { spaceId } = await params;
  const [space, settlement] = await Promise.all([getSpace(spaceId), getSpaceSettlement(spaceId)]);
  const currentParams = (await searchParams) ?? {};

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

      {currentParams.paymentConfirmed ? (
        <p className="notice notice--success">Pagamento manual confirmado.</p>
      ) : null}
      {currentParams.paymentError ? (
        <p className="notice notice--error">Nao foi possivel confirmar o pagamento.</p>
      ) : null}

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
            },
            {
              header: "Acao",
              render: (payment) => (
                <form action={confirmPaymentAction.bind(null, space.id)} className="inline-form">
                  <input name="payerMemberId" type="hidden" value={payment.fromMemberId} />
                  <input name="receiverMemberId" type="hidden" value={payment.toMemberId} />
                  <input name="amountMinor" type="hidden" value={payment.amountMinor} />
                  <label>
                    Registrado por
                    <select defaultValue="user-arthur" name="createdByUserId" required>
                      {seedUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="button button--secondary" type="submit">
                    Marcar como pago
                  </button>
                </form>
              )
            }
          ]}
          items={settlement}
        />
      </Card>
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
