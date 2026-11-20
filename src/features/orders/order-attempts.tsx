"use client";

import { CheckCircle2, Clock, RotateCcw, Truck, XCircle, type LucideIcon } from "lucide-react";
import { Icon, Inline, Stack, Text } from "@/components/ui/primitives";
import { OCCURRENCE_LABEL } from "@/constants/domain";
import { cn } from "@/lib/utils/cn";
import type { OrderAttempt } from "@/types/domain";
import { useOrderAttempts } from "./hooks";

const STATUS_META: Record<
  OrderAttempt["status"],
  { label: string; icon: LucideIcon; className: string }
> = {
  planned: { label: "Planejada", icon: Clock, className: "text-muted bg-surface-muted" },
  in_route: { label: "Em rota", icon: Truck, className: "text-primary bg-primary/10" },
  delivered: { label: "Entregue", icon: CheckCircle2, className: "text-success bg-success/10" },
  failed: { label: "Não entregue", icon: XCircle, className: "text-danger bg-danger/10" },
  returned: {
    label: "Rota cancelada antes da visita",
    icon: RotateCcw,
    className: "text-warning bg-warning/10",
  },
};

function day(value: string | null): string {
  if (!value) return "—";
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR");
}

function time(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Linha do tempo das tentativas de entrega do pedido, da mais antiga à mais recente. */
export function OrderAttempts({ orderId }: { orderId: string }) {
  const { data, isPending, error } = useOrderAttempts(orderId);

  const tentativas = data?.filter((item) => item.attempt != null).length ?? 0;
  const falhas = data?.filter((item) => item.status === "failed").length ?? 0;

  return (
    <Stack gap={3}>
      <Inline justify="between" align="center">
        <Text weight="semibold">Tentativas de entrega</Text>
        {tentativas > 0 && (
          <Text size="caption" color="muted" data-testid="attempts-summary">
            {tentativas} {tentativas === 1 ? "tentativa" : "tentativas"}
            {falhas > 0 ? ` · ${falhas} sem sucesso` : ""}
          </Text>
        )}
      </Inline>

      {isPending && (
        <Text size="body-sm" color="muted">
          Carregando…
        </Text>
      )}
      {error && (
        <Text size="body-sm" className="text-danger">
          Não foi possível carregar as tentativas.
        </Text>
      )}
      {data && data.length === 0 && (
        <Text size="body-sm" color="muted">
          O pedido ainda não entrou em nenhuma rota.
        </Text>
      )}

      {data && data.length > 0 && (
        <ol className="border-border relative ml-3 flex flex-col gap-4 border-l pl-5">
          {data.map((item) => {
            const meta = STATUS_META[item.status];
            const quando = time(item.completedAt) ?? time(item.arrivedAt);
            return (
              <li key={item.routeId} className="relative" data-testid={`attempt-${item.routeId}`}>
                <span
                  className={cn(
                    "ring-background absolute top-0.5 -left-[2.05rem] flex size-6 items-center justify-center rounded-full ring-4",
                    meta.className,
                  )}
                >
                  <Icon icon={meta.icon} size="xs" />
                </span>
                <Stack gap={0.5}>
                  <Inline gap={2} align="center" wrap>
                    <Text size="body-sm" weight="semibold">
                      {item.attempt ? `${item.attempt}ª tentativa` : "Sem visita"}
                    </Text>
                    <Text size="caption" className={cn("rounded px-1.5 py-0.5", meta.className)}>
                      {meta.label}
                    </Text>
                  </Inline>
                  <Text size="caption" color="muted">
                    Rota #{item.routeId} · {day(item.plannedDate)}
                    {item.driverName ? ` · ${item.driverName}` : ""}
                    {item.vehiclePlate ? ` · ${item.vehiclePlate}` : ""}
                  </Text>
                  {item.status === "failed" && item.occurrenceType && (
                    <Text size="body-sm" className="text-danger">
                      {OCCURRENCE_LABEL[item.occurrenceType]}
                      {quando ? ` · ${quando}` : ""}
                    </Text>
                  )}
                  {item.status === "delivered" && quando && (
                    <Text size="body-sm" className="text-success">
                      Entregue em {quando}
                    </Text>
                  )}
                  {item.notes && (
                    <Text size="caption" color="muted">
                      “{item.notes}”
                    </Text>
                  )}
                </Stack>
              </li>
            );
          })}
        </ol>
      )}
    </Stack>
  );
}
