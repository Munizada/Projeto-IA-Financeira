import { Button } from "../components/button";
import { Card } from "../components/card";
import { routes } from "../lib/routes";

const benefits = [
  {
    title: "Despesas compartilhadas",
    description: "Registre gastos do grupo em um espaco unico, sem depender de planilha."
  },
  {
    title: "Saldos claros",
    description: "Veja quem recebe, quem paga e o impacto de cada despesa com contexto."
  },
  {
    title: "Acerto final",
    description: "O sistema organiza o fechamento e sugere os pagamentos necessarios."
  },
  {
    title: "Pensado para WhatsApp",
    description: "A web apoia a conversa. O fluxo principal continua leve e conversacional."
  }
];

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero__panel">
          <p className="hero__eyebrow">Contae MVP</p>
          <h1>Mande o gasto. A IA divide. O Pix quita.</h1>
          <p className="section-copy">
            Uma interface web minima para revisar espacos, acompanhar despesas e fechar o grupo com
            clareza. O WhatsApp continua sendo o canal principal; a web entra quando a tela ajuda a
            enxergar melhor o contexto financeiro.
          </p>
          <div className="hero__actions">
            <Button href={routes.spaces}>Ver espacos demo</Button>
            <Button href={routes.spaces} kind="secondary">
              Ver como funciona
            </Button>
          </div>
        </div>
        <aside className="hero__aside">
          <h2>O que ja esta pronto</h2>
          <ul className="list-plain">
            <li>Espacos demo com dados coerentes ao seed do projeto.</li>
            <li>Saldos e acerto exibidos sem calculo financeiro no cliente.</li>
            <li>Fallback automatico para mocks quando a API nao responde.</li>
          </ul>
          <p className="notice">
            No MVP, o Pix ainda e manual. O sistema organiza o acerto, mas o pagamento acontece no
            banco do usuario.
          </p>
        </aside>
      </section>

      <section className="grid-4">
        {benefits.map((benefit) => (
          <Card key={benefit.title} title={benefit.title}>
            <p>{benefit.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
