import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Box, Heading, Icon, Inline, Text } from "@/components/ui/primitives";

export type MetricCardTrend = {
  direction: "up" | "down";
  label: string;
};

export type MetricCardProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: MetricCardTrend;
  loading?: boolean;
  className?: string;
};

export function MetricCard({ label, value, icon, trend, loading, className }: MetricCardProps) {
  return (
    <Box
      surface="surface"
      border="default"
      radius="lg"
      padding={5}
      className={cn(
        "hover:border-primary/40 group relative flex flex-col gap-3 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <span
        aria-hidden
        className="from-primary/0 via-primary/60 to-primary/0 absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100"
      />
      <Inline justify="between" align="start">
        <Text size="body-sm" color="muted">
          {label}
        </Text>
        {icon && (
          <span className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-9 items-center justify-center rounded-lg transition-colors">
            <Icon icon={icon} size="sm" />
          </span>
        )}
      </Inline>

      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded-md bg-surface-muted" />
      ) : (
        <Heading level={2}>{value}</Heading>
      )}

      {!loading && trend && (
        <Inline gap={1}>
          <Icon
            icon={trend.direction === "up" ? TrendingUp : TrendingDown}
            size="xs"
            color={trend.direction === "up" ? "success" : "danger"}
          />
          <Text size="caption" color={trend.direction === "up" ? "success" : "danger"}>
            {trend.label}
          </Text>
        </Inline>
      )}
    </Box>
  );
}
