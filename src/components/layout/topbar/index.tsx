"use client";

import { Bell, LogOutIcon, Menu, Search, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Icon, Text } from "@/components/ui/primitives";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeMenu } from "@/components/ui/theme-menu";
import { UserMenu } from "@/components/ui/user-menu";
import type { MenuAction } from "@/components/ui/dropdown-menu";

export type TopbarProps = {
  breadcrumb?: BreadcrumbItem[];
  onOpenMobileSidebar: () => void;
  onOpenCommandMenu: () => void;
  userName: string;
  userEmail?: string;
  userMenuItems?: MenuAction[];
  onUserMenuSelect?: (value: string) => void;
  className?: string;
};

const DEFAULT_USER_MENU_ITEMS: MenuAction[] = [
  { value: "settings", label: "Configurações", icon: SettingsIcon },
  { separator: true },
  { value: "logout", label: "Sair", icon: LogOutIcon },
];

export function Topbar({
  breadcrumb,
  onOpenMobileSidebar,
  onOpenCommandMenu,
  userName,
  userEmail,
  userMenuItems = DEFAULT_USER_MENU_ITEMS,
  onUserMenuSelect,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "border-border-subtle bg-surface/70 supports-[backdrop-filter]:bg-surface/60 flex h-16 shrink-0 backdrop-blur-md items-center justify-between gap-4 border-b px-4",
        className,
      )}
    >
      <div className="flex w-full items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Abrir menu"
          className="text-muted hover:bg-surface-hover flex size-9 items-center justify-center rounded-md lg:hidden"
        >
          <Icon icon={Menu} size="sm" />
        </button>
        {breadcrumb && breadcrumb.length > 0 && (
          <Breadcrumb items={breadcrumb} className="hidden md:flex" />
        )}
      </div>

      <button
        type="button"
        onClick={onOpenCommandMenu}
        className="border-border bg-background text-body-sm text-muted hover:border-primary/50 hover:text-foreground focus-visible:ring-primary/40 flex min-w-sm flex-1 items-center gap-2 rounded-lg border px-3 py-2 shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <Icon icon={Search} size="sm" />
        <span className="flex-1 text-left">Buscar pedidos, telas e ações...</span>
        <kbd className="border-border bg-surface-muted text-caption rounded border px-1.5 py-0.5 font-mono">Ctrl K</kbd>
      </button>

      <div className="flex w-full items-center justify-end gap-2">
        <PopoverRoot positioning={{ placement: "bottom-end" }}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Notificações"
              className="text-muted hover:bg-surface-hover hover:text-foreground relative flex size-9 items-center justify-center rounded-md"
            >
              <Icon icon={Bell} size="sm" />
              <span className="bg-danger absolute top-2 right-2 size-1.5 rounded-full" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <Text size="body-sm" weight="medium">
              Notificações
            </Text>
            <Text size="body-sm" color="muted" className="mt-2">
              Nenhuma notificação nova.
            </Text>
          </PopoverContent>
        </PopoverRoot>

        <ThemeMenu />

        <UserMenu
          name={userName}
          email={userEmail}
          items={userMenuItems}
          onSelect={onUserMenuSelect}
        />
      </div>
    </header>
  );
}
