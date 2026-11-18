import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Order } from "@/types/domain";
import { GenerateRouteDialog } from "./generate-route-dialog";

/**
 * Um pedido pertence a uma rota só: o diálogo não deixa escolher de novo um
 * pedido que já está em rota e diz em qual está.
 */
const pedido = (id: string, extra: Partial<Order> = {}): Order =>
  ({
    id,
    title: `Pedido ${id}`,
    customerName: "Cliente",
    destination: "Rua A, 1",
    street: "Rua A",
    city: "Jaraguá do Sul",
    state: "SC",
    driverId: "1",
    vehicleId: "1",
    routeId: null,
    status: "pending",
    ...extra,
  }) as Order;

describe("gerar rota", () => {
  it("pedido já em rota fica bloqueado, no fim da lista, com o número da rota", async () => {
    const onGenerate = vi.fn();
    render(
      <GenerateRouteDialog
        orders={[pedido("1", { routeId: "7", status: "planned" }), pedido("2"), pedido("3", { driverId: null })]}
        onGenerate={onGenerate}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Não roteirizável: Já está na Rota #7")).toBeInTheDocument();
    expect(screen.getByText("Não roteirizável: Sem motorista")).toBeInTheDocument();
    expect(screen.getByText("0 de 1 selecionado(s)")).toBeInTheDocument();

    const titulos = screen.getAllByText(/^Pedido \d$/).map((el) => el.textContent);
    expect(titulos[0]).toBe("Pedido 2");

    await userEvent.click(screen.getByRole("button", { name: "Selecionar todos" }));
    await userEvent.click(screen.getByRole("button", { name: /gerar/i }));
    expect(onGenerate).toHaveBeenCalledWith(["2"]);
  });
});
