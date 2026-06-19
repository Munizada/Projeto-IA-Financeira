import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "../lib/routes";
import { NavLink } from "./nav-link";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <Link href={routes.home}>Contae MVP</Link>
          <span>Web de apoio para despesas compartilhadas</span>
        </div>
        <nav className="topbar__nav" aria-label="Principal">
          <NavLink href={routes.home}>Inicio</NavLink>
          <NavLink href={routes.spaces}>Espacos</NavLink>
        </nav>
      </header>
      <main className="page-container">{children}</main>
    </div>
  );
}
