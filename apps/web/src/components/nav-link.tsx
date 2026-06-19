"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = {
  children: ReactNode;
  href: string;
};

export function NavLink({ children, href }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link className={`nav-link${isActive ? " nav-link--active" : ""}`} href={href}>
      {children}
    </Link>
  );
}
