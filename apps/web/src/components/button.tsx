import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  href?: string;
  kind?: "primary" | "secondary" | "ghost";
};

export function Button({ children, disabled = false, href, kind = "primary" }: ButtonProps) {
  const className = `button button--${kind}${disabled ? " button--disabled" : ""}`;

  if (href && !disabled) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} disabled={disabled} type="button">
      {children}
    </button>
  );
}
