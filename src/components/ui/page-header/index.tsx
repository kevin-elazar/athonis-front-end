import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Heading, Inline, Stack, Text } from "@/components/ui/primitives";
import { LucideIcon } from "lucide-react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
  icon?: LucideIcon;
};

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
  icon,
}: PageHeaderProps) {
  const Icon = icon;
  return (
    <Stack gap={3} className={cn("pb-2", className)}>
      {breadcrumb}
      <Inline justify="between" align="start" gap={4} wrap>
        <Inline gap={4} align="center">
          {Icon && (
            <Inline className="from-primary to-primary-active text-primary-foreground ring-primary/20 size-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ring-4 shadow-[color-mix(in_srgb,var(--primary)_35%,transparent)]">
              <Icon size={28} strokeWidth={2} />
            </Inline>
          )}
          <Stack gap={1}>
            <Heading level={1}>{title}</Heading>
            {description && <Text color="muted">{description}</Text>}
          </Stack>
        </Inline>
        {actions && <Inline gap={2}>{actions}</Inline>}
      </Inline>
    </Stack>
  );
}

export type SectionHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <Inline justify="between" align="start" gap={4} wrap className={className}>
      <Stack gap={0.5}>
        <Heading level={3}>{title}</Heading>
        {description && (
          <Text size="body-sm" color="muted">
            {description}
          </Text>
        )}
      </Stack>
      {actions && <Inline gap={2}>{actions}</Inline>}
    </Inline>
  );
}
