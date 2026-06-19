import type { ReactNode } from "react";

type PageHeaderProps = {
  actions?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
};

export function PageHeader({ actions, eyebrow, subtitle, title }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
