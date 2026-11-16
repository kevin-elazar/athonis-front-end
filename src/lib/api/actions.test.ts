import { beforeEach, describe, expect, it, vi } from "vitest";

const api = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("./client", () => ({
  createAuthenticatedApiClient: vi.fn(async () => api),
  createApiClient: vi.fn(() => api),
}));
vi.mock("@/lib/auth/session", () => ({ getSessionToken: vi.fn(async () => "tok") }));

import * as actions from "./actions";

const pagina = <T,>(items: T[]) => ({ data: { items } });

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
});

describe("cadastros", () => {
  it("lista e converte clientes, motoristas, veículos e pedidos", async () => {
    api.get.mockImplementation(async (url: string) => {
      switch (url) {
        case "/clients":
          return pagina([{ client_id: 1, name: "Loja", type: "J" }]);
        case "/drivers":
          return pagina([{ driver_id: 2, name: "João" }]);
        case "/vehicles":
          return pagina([{ vehicle_id: 3, name: "Van" }]);
        case "/orders":
          return { data: {} };
        case "/routes":
          return { data: [{ route_id: 9, status: "planned", orders: [] }] };
        case "/company":
          return { data: { id_company: 1, corporate_name: "Athonis", document: "1" } };
        default:
          throw new Error(url);
      }
    });

    expect((await actions.listCustomers())[0].id).toBe("1");
    expect((await actions.listDrivers())[0].name).toBe("João");
    expect((await actions.listVehicles())[0].id).toBe("3");
    expect(await actions.listOrders()).toEqual([]);
    expect((await actions.listRoutes())[0].name).toBe("Rota #9");
    expect((await actions.getCompany()).corporateName).toBe("Athonis");
  });

  it("cria, altera e remove pela rota certa", async () => {
    api.post.mockResolvedValue({ data: { client_id: 1, name: "Loja" } });
    api.patch.mockResolvedValue({ data: { driver_id: 2, name: "João" } });
    api.delete.mockResolvedValue({ data: null });

    await actions.createCustomer({ name: "Loja", document: "1", phone: "", zipCode: "", state: "SC" } as never);
    expect(api.post).toHaveBeenCalledWith("/clients", expect.objectContaining({ name: "Loja" }));

    await actions.updateDriver("2", { name: "João" });
    expect(api.patch).toHaveBeenCalledWith("/drivers/2", expect.objectContaining({ name: "João" }));

    await actions.deleteVehicle("3");
    await actions.deleteOrder("4");
    await actions.deleteRoute("5");
    await actions.revokeDriverAccess("2");
    expect(api.delete.mock.calls.map((c) => c[0])).toEqual(["/vehicles/3", "/orders/4", "/routes/5", "/drivers/2/access"]);
  });

  it("transforma a falha do backend numa mensagem legível", async () => {
    api.get.mockRejectedValue({ response: { status: 404 } });
    await expect(actions.listCustomers()).rejects.toThrow("Registro não encontrado.");
  });
});

describe("rotas", () => {
  const rota = { data: { route_id: 5, status: "in_progress", orders: [] } };

  it("ações sobre a rota", async () => {
    api.post.mockResolvedValue(rota);
    await actions.startRoute("5");
    await actions.completeRoute("5");
    await actions.cancelRoute("5");
    await actions.deliverRouteStop("5", "7");
    expect(api.post.mock.calls.map((c) => c[0])).toEqual([
      "/routes/5/start",
      "/routes/5/complete",
      "/routes/5/cancel",
      "/routes/5/orders/7/deliver",
    ]);
  });

  it("valida e otimiza com IDs numéricos", async () => {
    api.post.mockResolvedValueOnce({ data: { validOrders: [1] } }).mockResolvedValueOnce({ data: null });
    expect(await actions.validateOrdersForRoute(["1", "2"])).toEqual({ validOrders: [1], unassigned: [] });
    expect(api.post).toHaveBeenCalledWith("/optimization-routes/validate-orders", { orderIds: [1, 2] });
    expect(await actions.optimizeRoutes(["1"])).toEqual({ totalRoutes: 0, simulated: false, message: "", unassignedOrders: [] });
  });
});

describe("acesso do motorista", () => {
  it("consulta e concede", async () => {
    const acesso = { data: { driver_id: 2, has_access: true, email: "m@x.com", is_active: true, last_login: null } };
    api.get.mockResolvedValue(acesso);
    api.put.mockResolvedValue(acesso);
    expect(await actions.getDriverAccess("2")).toEqual({ driverId: "2", hasAccess: true, email: "m@x.com", isActive: true, lastLogin: null });
    await actions.grantDriverAccess("2", { email: "m@x.com", password: "segredo" });
    expect(api.put).toHaveBeenCalledWith("/drivers/2/access", { email: "m@x.com", password: "segredo" });
  });
});

describe("análise de campo", () => {
  it("converte os indicadores", async () => {
    api.get.mockImplementation(async (url: string) => {
      if (url === "/analytics/overview") return { data: { routes_total: 4, completion_rate: 90 } };
      if (url === "/analytics/drivers") return { data: [{ driver_id: 2, name: "João", routes: 3 }] };
      if (url === "/analytics/regions") return { data: [{ region: "Centro", stops: 5 }] };
      if (url === "/analytics/occurrences") return { data: { total: 1, by_type: {}, recent: [{ route_id: 5, order_id: null }] } };
      if (url === "/analytics/routes") return { data: [{ route_id: 5, has_tracking: true }] };
      if (url === "/analytics/live")
        return { data: [{ route_id: 5, next_stop: { order_id: 7, sequence: 1 }, position: { latitude: 1, longitude: 2 } }, { route_id: 6 }] };
      if (url === "/analytics/routes/5/comparison")
        return {
          data: {
            route: { route_id: 5 },
            summary: { ping_count: 10 },
            stops: [{ order_id: 7, latitude: 1, longitude: 2 }],
            path: [{ latitude: 1, longitude: 2, recorded_at: "t" }],
            idle_stops: [{ latitude: 1, longitude: 2, duration_min: 4 }],
            depot: { latitude: 3, longitude: 4 },
          },
        };
      throw new Error(url);
    });

    expect((await actions.getFieldOverview({})).routesTotal).toBe(4);
    expect((await actions.getFieldDrivers({}))[0].driverId).toBe("2");
    expect((await actions.getFieldRegions({}))[0].region).toBe("Centro");
    expect((await actions.getFieldOccurrences({})).recent[0]).toMatchObject({ routeId: "5", orderId: null });
    expect((await actions.getFieldRoutes({}))[0].hasTracking).toBe(true);
    const ao_vivo = await actions.getLiveRoutes();
    expect(ao_vivo[0].nextStop?.orderId).toBe("7");
    expect(ao_vivo[1].position).toBeNull();
    const comparacao = await actions.getRouteComparison("5");
    expect(comparacao.summary?.pingCount).toBe(10);
    expect(comparacao.depot).toEqual({ lat: 3, lng: 4 });
    expect(comparacao.idleStops[0].durationMin).toBe(4);
  });
});

describe("importação de pedidos", () => {
  it("exige arquivo", async () => {
    await expect(actions.importOrders(new FormData())).rejects.toThrow("Nenhum arquivo foi enviado");
  });

  it("envia o arquivo com o token e trata erro", async () => {
    const form = new FormData();
    form.append("file", new File(["a,b"], "pedidos.csv"));
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ imported: 2 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Arquivo inválido" }), { status: 400 }));

    expect(await actions.importOrders(form)).toEqual({ imported: 2 });
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ Authorization: "Bearer tok" });
    await expect(actions.importOrders(form)).rejects.toThrow("Arquivo inválido");
    fetchMock.mockRestore();
  });
});
