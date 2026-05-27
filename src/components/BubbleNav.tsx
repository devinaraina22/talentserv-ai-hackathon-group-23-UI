"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export type BubbleNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  testId: string;
};

export function BubbleNav({ items }: { items: BubbleNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="cute-dock no-print" aria-label="Main navigation">
      <div className="cute-dock-inner">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
              className={`cute-dock-item ${active ? "cute-dock-item-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="cute-dock-icon-wrap">
                <Icon className="h-[20px] w-[20px]" strokeWidth={active ? 2.25 : 1.85} />
              </span>
              <span className="cute-dock-label">{item.label}</span>
              <span className="cute-dock-desc">{item.description}</span>
              {active && <span className="cute-dock-dot" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
