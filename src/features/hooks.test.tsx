import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/query-wrapper";

/**
 * Os hooks das telas sobre as Server Actions (mockadas): busca no cliente,
 * mutações e invalidação do cache para a lista recarregar.
 */
const actions = vi.hoisted(() => {
  const fn = (valor: unknown = undefined) => vi.fn(async () => valor);
  return {
    listCustomers: fn([
      { id: "1", name: "Loja Centro", city: "Jaraguá", document: "11222333000181", phone: "4733701234" },
      { id: "2", name: "Mercado", city: "Guaramirim", document: "52998224725", phone: "47991234567" },
    ]),
    createCustomer: fn({ id: "3" }),
    updateCustomer: fn({ id: "1" }),
    deleteCustomer: fn(),
    listDrivers: fn([
      { id: "1", name: "João", document: "52998224725", phone: "", cnh: "" },
      { id: "2", name: "Pedro", document: "", phone: "", cnh: "" },
    ]),
    createDriver: fn({ id: "3" }),
    updateDriver: fn({ id: "1" }),
    deleteDriver: fn(),
    listVehicles: fn([
      { id: "1", name: "Van", plate: "ABC1D23", brand: "Fiat", model: "Ducato" },
      { id: "2", name: "Caminhão", plate: "XYZ1234", brand: "VW", model: "Delivery" },
    ]),
    createVehicle: fn({ id: "3" }),
    updateVehicle: fn({ id: "1" }),
    deleteVehicle: fn(),
    listOrders: fn([
      { id: "1", title: "Caixas", customerName: "Loja", destination: "Rua A", status: "pending" },
      { id: "2", title: "Sacos", customerName: "Mercado", destination: "Rua B", status: "delivered" },
    ]),
    createOrder: fn({ id: "3" }),
    updateOrder: fn({ id: "1" }),
    deleteOrder: fn(),
    importOrders: fn({ quantidadeSucessos: 1 }),
    listRoutes: fn([
      { id: "5", name: "Rota #5", driverName: "João", region: "Centro", status: "planned", stops: [] },
      { id: "6", name: "Rota #6", driverName: "Pedro", region: "Norte", status: "completed", stops: [] },
    ]),
    deleteRoute: fn(),
    startRoute: fn({ id: "5" }),
    completeRoute: fn({ id: "5" }),
    cancelRoute: fn({ id: "5" }),
    duplicateRoute: fn({ id: "7" }),
    deliverRouteStop: fn({ id: "5" }),
    optimizeRoutes: fn({ totalRoutes: 1 }),
    validateOrdersForRoute: fn({ validOrders: [1], unassigned: [] }),
    getCompany: fn({ idCompany: 1, corporateName: "Athonis" }),
    updateCompany: fn({ idCompany: 1 }),
    getDriverAccess: fn({ hasAccess: false }),
    grantDriverAccess: fn({ hasAccess: true }),
    revokeDriverAccess: fn(),
    getFieldOverview: fn({ routesTotal: 2 }),
    getFieldDrivers: fn([]),
    getFieldRegions: fn([]),
    getFieldOccurrences: fn({ total: 0, byType: {}, recent: [] }),
    getFieldRoutes: fn([]),
    getRouteComparison: fn({ route: { routeId: "5" } }),
    getLiveRoutes: fn([]),
  };
});

vi.mock("@/lib/api/actions", () => actions);

import * as customers from "./customers/hooks";
import * as drivers from "./drivers/hooks";
import * as vehicles from "./vehicles/hooks";
import * as orders from "./orders/hooks";
import * as routes from "./routes/hooks";
import * as company from "./company/hooks";
import * as dashboard from "./dashboard/hooks";
import * as analytics from "./analytics/hooks";
import * as field from "./analytics/field-hooks";

beforeEach(() => {
  Object.values(actions).forEach((fn) => fn.mockClear());
});

async function lista<T>(hook: () => { data?: T; isSuccess: boolean }) {
  const { Wrapper } = createQueryWrapper();
  const { result } = renderHook(hook, { wrapper: Wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  return result.current.data as T;
}

async function mutar<V>(hook: () => { mutateAsync: (v: V) => Promise<unknown> }, valor: V) {
  const { Wrapper, client } = createQueryWrapper();
  const invalidar = vi.spyOn(client, "invalidateQueries");
  const { result } = renderHook(hook, { wrapper: Wrapper });
  await act(() => result.current.mutateAsync(valor));
  return invalidar;
}

describe("listas com busca", () => {
  it("clientes por nome, cidade e documento sem pontuação", async () => {
    expect(await lista(() => customers.useCustomers())).toHaveLength(2);
    expect(await lista(() => customers.useCustomers("guaramirim"))).toHaveLength(1);
    expect(await lista(() => customers.useCustomers("529.982"))).toEqual([expect.objectContaining({ id: "2" })]);
  });

  it("motoristas, veículos, pedidos e rotas", async () => {
    expect(await lista(() => drivers.useDrivers("pedro"))).toHaveLength(1);
    expect(await lista(() => drivers.useDrivers())).toHaveLength(2);
    expect(await lista(() => vehicles.useVehicles("abc1"))).toHaveLength(1);
    expect(await lista(() => vehicles.useVehicles())).toHaveLength(2);
    expect(await lista(() => orders.useOrders("rua b"))).toHaveLength(1);
    expect(await lista(() => orders.useOrders())).toHaveLength(2);
    expect(await lista(() => routes.useRoutes("norte"))).toHaveLength(1);
    expect(await lista(() => routes.useRoutes())).toHaveLength(2);
  });

  it("empresa, painel e análises", async () => {
    expect(await lista(() => company.useCompany())).toMatchObject({ corporateName: "Athonis" });
    expect(await lista(() => dashboard.useDashboardData())).toBeTruthy();
    expect(await lista(() => analytics.useAnalyticsData())).toBeTruthy();
  });
});

describe("mutações invalidam o cache", () => {
  it.each([
    ["cliente: criar", () => customers.useCreateCustomer(), {}],
    ["cliente: alterar", () => customers.useUpdateCustomer(), { id: "1", input: {} }],
    ["cliente: remover", () => customers.useDeleteCustomer(), "1"],
    ["motorista: criar", () => drivers.useCreateDriver(), {}],
    ["motorista: alterar", () => drivers.useUpdateDriver(), { id: "1", input: {} }],
    ["motorista: remover", () => drivers.useDeleteDriver(), "1"],
    ["veículo: criar", () => vehicles.useCreateVehicle(), {}],
    ["veículo: alterar", () => vehicles.useUpdateVehicle(), { id: "1", input: {} }],
    ["veículo: remover", () => vehicles.useDeleteVehicle(), "1"],
    ["pedido: criar", () => orders.useCreateOrder(), {}],
    ["pedido: alterar", () => orders.useUpdateOrder(), { id: "1", input: {} }],
    ["pedido: remover", () => orders.useDeleteOrder(), "1"],
    ["pedido: importar", () => orders.useImportOrders(), new FormData()],
    ["rota: otimizar", () => routes.useOptimizeRoutes(), { orderIds: ["1"] }],
    ["rota: remover", () => routes.useDeleteRoute(), "5"],
    ["rota: iniciar", () => routes.useStartRoute(), "5"],
    ["rota: concluir", () => routes.useCompleteRoute(), "5"],
    ["rota: cancelar", () => routes.useCancelRoute(), "5"],
    ["rota: duplicar", () => routes.useDuplicateRoute(), { id: "5", input: {} }],
    ["empresa: alterar", () => company.useUpdateCompany(), {}],
  ] as const)("%s", async (_nome, hook, valor) => {
    const invalidar = await mutar(hook as never, valor);
    expect(invalidar).toHaveBeenCalled();
  });

  it.each([
    ["iniciar", () => routes.useStartRoute(), "5"],
    ["duplicar", () => routes.useDuplicateRoute(), { id: "5", input: {} }],
  ] as const)("rota: %s atualiza também as telas de execução em campo", async (_nome, hook, valor) => {
    const invalidar = await mutar(hook as never, valor);
    const chaves = invalidar.mock.calls.map(([filtro]) => (filtro as { queryKey: unknown[] }).queryKey[0]);
    expect(chaves).toEqual(expect.arrayContaining(["live-routes", "field-analytics", "route-comparison"]));
  });

  it("validar pedidos não mexe no cache", async () => {
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => routes.useValidateOrdersForRoute(), { wrapper: Wrapper });
    await act(() => result.current.mutateAsync(["1"]));
    expect(actions.validateOrdersForRoute).toHaveBeenCalledWith(["1"]);
  });
});

describe("execução em campo", () => {
  it("período em dias termina hoje", () => {
    const { from, to } = field.rangeForDays(7);
    expect(to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(to).getTime() - new Date(from).getTime()).toBeGreaterThan(0);
  });

  it("carrega indicadores, comparação e rotas ao vivo", async () => {
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => ({
        indicadores: field.useFieldAnalytics(30),
        comparacao: field.useRouteComparison("5"),
        semRota: field.useRouteComparison(null),
        aoVivo: field.useLiveRoutes(),
      }),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.comparacao.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.aoVivo.isSuccess).toBe(true));
    expect(actions.getRouteComparison).toHaveBeenCalledWith("5");
    expect(actions.getFieldOverview).toHaveBeenCalled();
    expect(result.current.semRota.fetchStatus).toBe("idle");
  });
});
