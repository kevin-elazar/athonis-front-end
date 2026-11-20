"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/primitives";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrandMark } from "@/components/domain/brand-mark";
import { NAV_ITEMS, NAV_SECTIONS, type NavItem } from "@/constants/navigation";

export type SidebarProps = {
  /** Nome da empresa logada, exibido abaixo da marca. */
  brandName?: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  showToggle?: boolean;
  onNavigate?: () => void;
  className?: string;
};

function isActive(pathname: string | null, item: NavItem) {
  return pathname === item.href || pathname?.startsWith(`${item.href}/`) === true;
}

/**
 * Menu lateral do painel. Fica sempre escuro (azul-marinho da marca), nos
 * dois temas: separa a navegação do conteúdo e dá identidade ao painel.
 */
export function Sidebar({
  brandName = "ATHONIS",
  collapsed = false,
  onToggleCollapsed,
  showToggle = true,
  onNavigate,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col overflow-hidden border-r border-white/5 bg-gradient-to-b from-blue-950 via-[#0c1838] to-[#070d22] text-white transition-[width] duration-200 ease-out",
        collapsed ? "w-[4.5rem]" : "w-64",
        className,
      )}
    >
      {/* Brilho azul atrás da marca. */}
      <div
        aria-hidden
        className="bg-primary/30 pointer-events-none absolute -top-24 -left-16 size-56 rounded-full blur-3xl"
      />

      <Link
        href="/dashboard"
        onClick={onNavigate}
        className={cn(
          "relative flex h-16 shrink-0 items-center gap-3 px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <BrandMark size={36} className="drop-shadow-[0_4px_12px_rgba(47,93,227,0.45)]" />
        {!collapsed && (
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-body font-bold tracking-[0.18em]">ATHONIS</span>
            <span className="truncate text-xs text-blue-200/70">{brandName}</span>
          </span>
        )}
      </Link>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <nav className="relative flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, index) => {
          const items = NAV_ITEMS.filter((item) => item.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section} className="flex flex-col gap-1">
              {collapsed ? (
                index > 0 && <div className="mx-auto mb-1 h-px w-6 bg-white/10" />
              ) : (
                <span className="mb-1 px-3 text-[0.68rem] font-semibold tracking-[0.14em] text-blue-200/45 uppercase">
                  {section}
                </span>
              )}
              {items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          );
        })}
      </nav>

      {showToggle && (
        <div className="relative border-t border-white/5 p-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className={cn(
              "text-body-sm flex w-full items-center gap-3 rounded-lg px-3 py-2 text-blue-100/60 transition-colors hover:bg-white/5 hover:text-white",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon icon={collapsed ? PanelLeftOpen : PanelLeftClose} size="sm" />
            {!collapsed && <span>Recolher menu</span>}
          </button>
        </div>
      )}
    </aside>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group text-body-sm relative flex items-center gap-3 rounded-lg px-2.5 py-2 font-medium transition-all duration-150",
        collapsed && "justify-center px-0",
        active
          ? "bg-gradient-to-r from-primary/35 to-primary/10 text-white shadow-[inset_0_0_0_1px_rgba(122,155,245,0.25)]"
          : "text-blue-100/70 hover:bg-white/[0.06] hover:text-white",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#7a9bf5] shadow-[0_0_12px_rgba(122,155,245,0.8)]"
        />
      )}
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
          active
            ? "bg-primary text-white shadow-[0_4px_14px_rgba(47,93,227,0.5)]"
            : "bg-white/[0.04] text-blue-100/70 group-hover:bg-white/10 group-hover:text-white",
        )}
      >
        <Icon icon={item.icon} size="sm" />
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <TooltipRoot positioning={{ placement: "right" }}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent>{item.label}</TooltipContent>
    </TooltipRoot>
  );
}
