import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/query-wrapper";
import { mapOrder, mapOrderAttempt, type ApiOrder } from "@/lib/api/mappers";
import type { OrderAttempt } from "@/types/domain";
import { OrderAttempts } from "./order-attempts";

/**
 * Um pedido pode passar por várias rotas: cada passagem é uma tentativa, e o
 * detalhe do pedido mostra todas, com o resultado e o motivo de cada uma.
 */

const mockAttempts = vi.fn<(id: string) => Promise<OrderAttempt[]>>();
vi.mock("@/lib/api/resources", () => ({
  ordersApi: { attempts: (id: string) => mockAttempts(id) },
}));

function renderAttempts() {
  const { Wrapper } = createQueryWrapper();
  return render(
    <Wrapper>
      <OrderAttempts orderId="60" />
    </Wrapper>,
  );
}

beforeEach(() => mockAttempts.mockReset());

describe("tentativas de entrega", () => {
  it("lista as tentativas com resultado, motivo e observação", async () => {
    mockAttempts.mockResolvedValue(
      [
        {
          attempt: null,
          route_id: 9,
          route_status: "cancelled",
          planned_date: "2026-11-16",
          driver_name: null,
          vehicle_plate: null,
          status: "returned" as const,
          arrived_at: null,
          completed_at: null,
          occurrence_type: null,
          notes: null,
        },
        {
          attempt: 1,
          route_id: 11,
          route_status: "completed",
          planned_date: "2026-11-18",
          driver_name: "Carla",
          vehicle_plate: "ABC1D23",
          status: "failed" as const,
          arrived_at: "2026-11-18T13:00:00Z",
          completed_at: "2026-11-18T13:05:00Z",
          occurrence_type: "customer_absent",
          notes: "Portão fechado",
        },
        {
          attempt: 2,
          route_id: 12,
          route_status: "completed",
          planned_date: "2026-11-19",
          driver_name: "Carla",
          vehicle_plate: null,
          status: "delivered" as const,
          arrived_at: null,
          completed_at: "2026-11-19T12:00:00Z",
          occurrence_type: null,
          notes: null,
        },
      ].map(mapOrderAttempt),
    );
    renderAttempts();

    expect(await screen.findByText("1ª tentativa")).toBeInTheDocument();
    expect(screen.getByTestId("attempts-summary")).toHaveTextContent("2 tentativas · 1 sem sucesso");
    expect(screen.getByText("Sem visita")).toBeInTheDocument();
    expect(screen.getByText("Rota cancelada antes da visita")).toBeInTheDocument();
    expect(screen.getByTestId("attempt-11")).toHaveTextContent("Rota #11 · 18/11/2026 · Carla · ABC1D23");
    expect(screen.getByTestId("attempt-11")).toHaveTextContent("Cliente ausente");
    expect(screen.getByTestId("attempt-11")).toHaveTextContent("“Portão fechado”");
    expect(screen.getByTestId("attempt-12")).toHaveTextContent("Entregue em");
    expect(mockAttempts).toHaveBeenCalledWith("60");
  });

  it("pedido que ainda não entrou em rota", async () => {
    mockAttempts.mockResolvedValue([]);
    renderAttempts();
    expect(await screen.findByText("O pedido ainda não entrou em nenhuma rota.")).toBeInTheDocument();
  });
});

describe("pedido com tentativas", () => {
  it("traz o número de tentativas e a última falha", () => {
    const pedido = mapOrder({
      order_id: 60,
      title: "Pedido",
      quantity: 1,
      delivery_street: "Rua A",
      delivery_number: "1",
      delivery_district: "Centro",
      delivery_city: "Jaraguá do Sul",
      delivery_state: "SC",
      delivery_zipcode: "89251-000",
      attempts: 2,
      last_failure: { route_id: 11, occurred_at: "2026-11-18T13:05:00Z", occurrence_type: "refused" },
    } as ApiOrder);
    expect(pedido.attempts).toBe(2);
    expect(pedido.lastFailure).toEqual({
      routeId: "11",
      occurredAt: "2026-11-18T13:05:00Z",
      occurrenceType: "refused",
    });
    expect(mapOrder({ order_id: 1, title: "x", quantity: 1 } as ApiOrder)).toMatchObject({
      attempts: 0,
      lastFailure: null,
    });
  });
});
