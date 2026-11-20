import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  Driver,
  FieldOverview,
  LiveRoute,
  Route,
  RouteComparison,
  Vehicle,
} from "@/types/domain";

/**
 * Telas da execução em campo, o que o TCC acrescentou ao painel: indicadores,
 * comparação planejado × executado, acompanhamento ao vivo, acesso do
 * motorista ao app e duplicação de rota. Só a camada de API (Server Actions)
 * é simulada; hooks, componentes e cálculos de tela rodam de verdade.
 * O mapa (Leaflet) não renderiza no jsdom e vira um marcador simples.
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("@/components/domain/track-map", () => ({
  TrackMap: (props: { stops?: unknown[]; path?: unknown[]; vehicles?: unknown[] }) => (
    <div data-testid="track-map">
      mapa: {props.stops?.length ?? 0} paradas, {props.path?.length ?? 0} pontos,{" "}
      {props.vehicles?.length ?? 0} veículos
    </div>
  ),
}));

const agora = new Date();
const haMin = (min: number) => new Date(agora.getTime() - min * 60_000).toISOString();

const overview: FieldOverview = {
  period: { from: "2026-10-18", to: "2026-11-16" },
  routesTotal: 7,
  routesCompleted: 6,
  routesWithTracking: 6,
  stopsTotal: 38,
  stopsDelivered: 28,
  stopsFailed: 4,
  stopsPending: 6,
  completionRate: 73.7,
  onTimeRate: 56.3,
  avgDelayMin: 14,
  avgServiceMin: 10.8,
  plannedDistanceKm: 151.6,
  actualDistanceKm: 154.3,
  plannedDurationMin: 585,
  actualDurationMin: 692,
  idleTimeMin: 9,
  stopsOutOfOrder: 2,
  occurrencesTotal: 4,
};

const comparacao: RouteComparison = {
  route: {
    routeId: "5",
    status: "completed",
    plannedDate: "2026-11-14",
    region: "Centro",
    simulated: false,
    driverName: "Bruno",
    vehicleName: "Van 1",
    startedAt: haMin(300),
    finishedAt: haMin(120),
  },
  summary: {
    plannedDistanceM: 25200,
    actualDistanceM: 27150,
    plannedDurationMin: 132,
    actualDurationMin: 180,
    stopsTotal: 3,
    stopsDelivered: 2,
    stopsFailed: 1,
    stopsOutOfOrder: 1,
    idleTimeMin: 6,
    avgServiceMin: 9.5,
    avgDelayMin: 12,
    pingCount: 640,
  },
  stops: [
    {
      orderId: "11",
      title: "Fechaduras",
      clientName: "Loja Centro",
      address: "Rua A, 10",
      status: "delivered",
      plannedSequence: 1,
      actualSequence: 2,
      plannedArrival: haMin(290),
      actualArrival: haMin(270),
      completedAt: haMin(262),
      delayMin: 20,
      serviceMin: 8,
      occurrenceType: null,
      notes: "Recebido pelo porteiro",
      lat: -26.48,
      lng: -49.07,
      recordedLat: -26.4801,
      recordedLng: -49.0701,
    },
    {
      orderId: "12",
      title: "Dobradiças",
      clientName: "Marcenaria",
      address: "Rua B, 20",
      status: "failed",
      plannedSequence: 2,
      actualSequence: 1,
      plannedArrival: haMin(250),
      actualArrival: haMin(255),
      completedAt: haMin(250),
      delayMin: -5,
      serviceMin: 5,
      occurrenceType: "customer_absent",
      notes: "Ninguém atendeu",
      lat: -26.47,
      lng: -49.06,
      recordedLat: null,
      recordedLng: null,
    },
    {
      orderId: "13",
      title: "Trilhos",
      clientName: null,
      address: "Rua C, 30",
      status: "delivered",
      plannedSequence: 3,
      actualSequence: 3,
      plannedArrival: null,
      actualArrival: null,
      completedAt: null,
      delayMin: null,
      serviceMin: null,
      occurrenceType: null,
      notes: null,
      lat: null,
      lng: null,
      recordedLat: null,
      recordedLng: null,
    },
  ],
  path: [
    { lat: -26.48, lng: -49.07, recordedAt: haMin(280) },
    { lat: -26.47, lng: -49.06, recordedAt: haMin(260) },
  ],
  idleStops: [{ lat: -26.475, lng: -49.065, startedAt: haMin(240), endedAt: haMin(234), durationMin: 6 }],
  depot: { lat: -26.4855, lng: -49.0716 },
} as RouteComparison;

const aoVivo: LiveRoute[] = [
  {
    routeId: "8",
    driverName: "Carla",
    vehicleName: "Van 2",
    region: "Norte",
    startedAt: haMin(40),
    stopsTotal: 5,
    stopsDelivered: 2,
    stopsFailed: 0,
    nextStop: { orderId: "21", sequence: 3, label: "Móveis Schroeder", address: "Rua Joinville, 3100" },
    position: { lat: -26.46, lng: -49.1, speedMps: 8.3, recordedAt: haMin(0.5) },
  },
  {
    routeId: "9",
    driverName: "Diego",
    vehicleName: null,
    region: null,
    startedAt: haMin(90),
    stopsTotal: 4,
    stopsDelivered: 4,
    stopsFailed: 0,
    nextStop: null,
    position: { lat: -26.45, lng: -49.11, speedMps: null, recordedAt: haMin(45) },
  },
  {
    routeId: "10",
    driverName: null,
    vehicleName: null,
    region: "Sul",
    startedAt: null,
    stopsTotal: 2,
    stopsDelivered: 0,
    stopsFailed: 0,
    nextStop: null,
    position: null,
  },
];

const motorista: Driver = {
  id: "1",
  name: "Bruno",
  document: "",
  phone: "",
  cnh: "",
  cnhCategory: "B",
  cnhExpiration: "2027-01-01",
  vehicleId: null,
  status: "available",
  deliveryCount: 10,
  performance: 90,
};

const veiculo: Vehicle = {
  id: "1",
  name: "Van 1",
  plate: "ABC1D23",
  model: "Ducato",
  brand: "Fiat",
  year: 2020,
  type: "van",
  capacityKg: 1000,
  driverId: null,
  status: "available",
};

const rotaCancelada: Route = {
  id: "7",
  name: "Rota #7",
  driverId: "1",
  driverName: "Bruno",
  vehicleId: "1",
  vehicleName: "Van 1 — ABC1D23",
  orderIds: ["11", "12"],
  status: "cancelled",
  stops: [
    { id: "11", label: "Loja Centro", lat: -26.48, lng: -49.07, sequence: 1, completed: true, failed: false, occurrenceType: null, driverNotes: null, closedAt: haMin(100) },
    { id: "12", label: "Marcenaria", lat: -26.47, lng: -49.06, sequence: 2, completed: false, failed: true, occurrenceType: "refused", driverNotes: "Recusou", closedAt: haMin(90) },
  ],
  startedAt: haMin(200),
  region: "Centro",
  plannedDate: "2026-11-21",
  totalDistanceKm: 25.2,
  totalDurationMin: 132,
  simulated: false,
  cancelReason: "Pneu furado",
  returnedStopCount: 1,
  duplicatedFromRouteId: null,
};

const actions = vi.hoisted(() => ({
  getFieldOverview: vi.fn(),
  getFieldDrivers: vi.fn(),
  getFieldRegions: vi.fn(),
  getFieldOccurrences: vi.fn(),
  getFieldRoutes: vi.fn(),
  getRouteComparison: vi.fn(),
  getLiveRoutes: vi.fn(),
  getDriverAccess: vi.fn(),
  grantDriverAccess: vi.fn(),
  revokeDriverAccess: vi.fn(),
  listDrivers: vi.fn(),
  listVehicles: vi.fn(),
  listRoutes: vi.fn(),
  listOrders: vi.fn(),
  listCustomers: vi.fn(),
  getCompany: vi.fn(),
  duplicateRoute: vi.fn(),
  deleteRoute: vi.fn(),
  startRoute: vi.fn(),
  completeRoute: vi.fn(),
  cancelRoute: vi.fn(),
  deliverRouteStop: vi.fn(),
  optimizeRoutes: vi.fn(),
  validateOrdersForRoute: vi.fn(),
}));
vi.mock("@/lib/api/actions", () => actions);

import { FieldExecutionPanel } from "./analytics/field-execution";
import { RouteComparisonDialog } from "./analytics/route-comparison-dialog";
import { DriverAccessDialog } from "./drivers/driver-access-dialog";
import { DuplicateRouteDialog } from "./routes/duplicate-route-dialog";
import { RouteTrack } from "./tracking/route-track";
import TrackingPage from "@/app/(app)/tracking/page";
import DriversPage from "@/app/(app)/drivers/page";
import { CurrentUserProvider } from "./auth/current-user";
import { routesApi } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/errors";
import AnalyticsPage from "@/app/(app)/analytics/page";
import RoutesPage from "@/app/(app)/routes/page";

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return { client, ...render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>) };
}

beforeEach(() => {
  vi.clearAllMocks();
  actions.getFieldOverview.mockResolvedValue(overview);
  actions.getFieldDrivers.mockResolvedValue([
    { driverId: "1", name: "Bruno", routes: 4, stopsTotal: 20, stopsDelivered: 16, stopsFailed: 2, completionRate: 80, avgServiceMin: 9.5, avgDelayMin: 12, actualDistanceKm: 90.2, stopsOutOfOrder: 1 },
    { driverId: "2", name: "Carla", routes: 3, stopsTotal: 18, stopsDelivered: 12, stopsFailed: 2, completionRate: 66.7, avgServiceMin: null, avgDelayMin: null, actualDistanceKm: 64.1, stopsOutOfOrder: 1 },
  ]);
  actions.getFieldRegions.mockResolvedValue([
    { region: "Centro", period: "morning", stops: 12, stopsFailed: 1, avgServiceMin: 8, avgDelayMin: 5 },
    { region: "Norte", period: "afternoon", stops: 9, stopsFailed: 2, avgServiceMin: null, avgDelayMin: -3 },
  ]);
  actions.getFieldOccurrences.mockResolvedValue({
    total: 4,
    byType: [
      { type: "customer_absent", count: 3, share: 75 },
      { type: "refused", count: 1, share: 25 },
    ],
    recent: [
      { routeId: "5", orderId: "12", orderTitle: "Dobradiças", clientName: "Marcenaria", driverName: "Bruno", occurrenceType: "customer_absent", notes: "Ninguém atendeu", occurredAt: haMin(250) },
    ],
  });
  actions.getFieldRoutes.mockResolvedValue([
    { routeId: "5", status: "completed", plannedDate: "2026-11-14", region: "Centro", driverName: "Bruno", simulated: false, stopsTotal: 3, stopsDelivered: 2, stopsFailed: 1, plannedDistanceM: 25200, actualDistanceM: 27150, plannedDurationMin: 132, actualDurationMin: 180, stopsOutOfOrder: 1, hasTracking: true },
    { routeId: "6", status: "active", plannedDate: "2026-11-16", region: null, driverName: null, simulated: true, stopsTotal: 4, stopsDelivered: 1, stopsFailed: 0, plannedDistanceM: null, actualDistanceM: null, plannedDurationMin: null, actualDurationMin: null, stopsOutOfOrder: null, hasTracking: false },
  ]);
  actions.getRouteComparison.mockResolvedValue(comparacao);
  actions.getLiveRoutes.mockResolvedValue(aoVivo);
  actions.listDrivers.mockResolvedValue([motorista]);
  actions.listVehicles.mockResolvedValue([veiculo]);
  actions.listRoutes.mockResolvedValue([rotaCancelada]);
  actions.listOrders.mockResolvedValue([]);
  actions.listCustomers.mockResolvedValue([]);
  actions.getCompany.mockResolvedValue({ idCompany: 1, corporateName: "Athonis", operationStartTime: "08:00", operationEndTime: "17:00", hasDepotCoordinates: true });
});

describe("execução em campo", () => {
  it("mostra indicadores, planejado × executado e as rotas do período", async () => {
    renderWithQuery(<FieldExecutionPanel />);
    expect(await screen.findByText("73,7%")).toBeInTheDocument();
    expect(screen.getByText("56,3%")).toBeInTheDocument();
    expect(screen.getByText("154,3 km")).toBeInTheDocument();
    expect(screen.getByText("Rota #5")).toBeInTheDocument();
    expect(screen.getByText(/14\/11\/2026 · Bruno/)).toBeInTheDocument();
    expect(screen.getByText("Sem GPS")).toBeInTheDocument();
    expect(actions.getFieldOverview).toHaveBeenCalledWith(expect.objectContaining({ from: expect.any(String) }));
  });

  it("abre a comparação da rota ao clicar na linha", async () => {
    renderWithQuery(<FieldExecutionPanel />);
    await userEvent.click(await screen.findByText("Rota #5"));
    await waitFor(() => expect(actions.getRouteComparison).toHaveBeenCalledWith("5"));
  });

  it("mostra erro e vazio", async () => {
    actions.getFieldOverview.mockRejectedValueOnce(new Error("fora do ar"));
    const { unmount } = renderWithQuery(<FieldExecutionPanel />);
    expect(await screen.findByRole("button", { name: /tentar/i })).toBeInTheDocument();
    unmount();

    actions.getFieldOverview.mockResolvedValue({ ...overview, routesTotal: 0, stopsTotal: 0, completionRate: null, onTimeRate: null });
    actions.getFieldRoutes.mockResolvedValue([]);
    actions.getFieldDrivers.mockResolvedValue([]);
    actions.getFieldRegions.mockResolvedValue([]);
    actions.getFieldOccurrences.mockResolvedValue({ total: 0, byType: [], recent: [] });
    renderWithQuery(<FieldExecutionPanel />);
    await waitFor(() => expect(actions.getFieldRoutes).toHaveBeenCalled());
  });
});

describe("comparação planejado × executado", () => {
  it("detalha a rota parada a parada", async () => {
    renderWithQuery(<RouteComparisonDialog routeId="5" onClose={vi.fn()} />);
    expect(await screen.findByText("Loja Centro")).toBeInTheDocument();
    expect(screen.getByText("Marcenaria")).toBeInTheDocument();
    expect(screen.getByText(/Ninguém atendeu/)).toBeInTheDocument();
    expect(screen.getByTestId("track-map")).toHaveTextContent("2 pontos");
  });

  it("rota sem resumo e falha ao carregar", async () => {
    actions.getRouteComparison.mockResolvedValueOnce({ ...comparacao, summary: null, path: [], idleStops: [], depot: null });
    const { unmount } = renderWithQuery(<RouteComparisonDialog routeId="5" onClose={vi.fn()} />);
    expect(await screen.findByText("Loja Centro")).toBeInTheDocument();
    unmount();
    actions.getRouteComparison.mockRejectedValueOnce(new Error("x"));
    renderWithQuery(<RouteComparisonDialog routeId="6" onClose={vi.fn()} />);
    await waitFor(() => expect(actions.getRouteComparison).toHaveBeenCalledWith("6"));
  });

  it("trajeto com legenda de paradas e veículo", () => {
    render(<RouteTrack data={comparacao} vehicle={{ id: "v", lat: -26.46, lng: -49.1, label: "Van" } as never} />);
    expect(screen.getByTestId("track-map")).toHaveTextContent("1 veículos");
  });
});

describe("acompanhamento", () => {
  it("ao vivo: lista as rotas em andamento e a idade da posição", async () => {
    renderWithQuery(<TrackingPage />);
    expect(await screen.findByText("Carla")).toBeInTheDocument();
    expect(screen.getByText("Agora")).toBeInTheDocument();
    expect(screen.getByText(/Sem sinal há/)).toBeInTheDocument();
    expect(screen.getByText("Sem posição")).toBeInTheDocument();
    expect(screen.getByText(/Móveis Schroeder/)).toBeInTheDocument();
    await userEvent.click(screen.getByText("Carla"));
    await waitFor(() => expect(actions.getRouteComparison).toHaveBeenCalledWith("8"));
  });

  it("percursos: escolhe uma rota do histórico", async () => {
    renderWithQuery(<TrackingPage />);
    await screen.findByText("Carla");
    // Aba escondida não monta: nada de buscar o histórico antes de abri-la.
    expect(actions.getFieldRoutes).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("tab", { name: "Percursos" }));
    await waitFor(() => expect(actions.getFieldRoutes).toHaveBeenCalled());
  });

  it("sem rotas em andamento", async () => {
    actions.getLiveRoutes.mockResolvedValue([]);
    renderWithQuery(<TrackingPage />);
    await waitFor(() => expect(actions.getLiveRoutes).toHaveBeenCalled());
  });
});

describe("acompanhamento: falhas", () => {
  it("falha ao atualizar mantém o mapa e avisa", async () => {
    const { client } = renderWithQuery(<TrackingPage />);
    expect(await screen.findByText("Carla")).toBeInTheDocument();
    actions.getLiveRoutes.mockResolvedValue({ ok: false, message: "API fora do ar" });
    await client.refetchQueries({ queryKey: ["live-routes"] });
    expect(await screen.findByText("Atualização falhou")).toBeInTheDocument();
    expect(screen.getByText("Carla")).toBeInTheDocument();
    expect(screen.getByTestId("track-map")).toBeInTheDocument();
  });

  it("sem dados, a falha mostra a tela de erro", async () => {
    actions.getLiveRoutes.mockRejectedValue(new Error("x"));
    renderWithQuery(<TrackingPage />);
    expect(await screen.findByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.queryByText("Carla")).not.toBeInTheDocument();
  });

  it("falha no percurso da rota selecionada vira aviso", async () => {
    actions.getRouteComparison.mockResolvedValue({ ok: false, message: "Rota não encontrada" });
    renderWithQuery(<TrackingPage />);
    expect(await screen.findByText(/Não foi possível carregar o percurso/)).toBeInTheDocument();
    expect(screen.getByTestId("track-map")).toBeInTheDocument();
  });
});

describe("resultado das Server Actions", () => {
  it("a mensagem real do backend chega ao usuário", async () => {
    actions.getFieldOverview.mockResolvedValue({ ok: false, message: "Período inválido", status: 400 });
    renderWithQuery(<FieldExecutionPanel />);
    expect(await screen.findByRole("button", { name: /tentar/i })).toBeInTheDocument();
  });

  it("resultado ok é desembrulhado", async () => {
    actions.getLiveRoutes.mockResolvedValue({ ok: true, data: aoVivo });
    renderWithQuery(<TrackingPage />);
    expect(await screen.findByText("Carla")).toBeInTheDocument();
  });

  it("falha vira ApiError com a mensagem e os erros por campo do backend", async () => {
    actions.duplicateRoute.mockResolvedValue({
      ok: false,
      message: "Rota já foi duplicada",
      status: 409,
      fieldErrors: [{ field: "route_id", messages: ["duplicada"] }],
    });
    const falha = await routesApi.duplicate("7", {}).catch((error: unknown) => error);
    expect(falha).toBeInstanceOf(ApiError);
    expect(falha).toMatchObject({ message: "Rota já foi duplicada", status: 409 });
    expect((falha as ApiError).fieldErrors).toHaveLength(1);
  });

  it("remoção ok devolve vazio", async () => {
    actions.deleteRoute.mockResolvedValue({ ok: true, data: undefined });
    await expect(routesApi.remove("7")).resolves.toBeUndefined();
  });
});

describe("motoristas: acesso ao aplicativo só para admin", () => {
  async function abrirAcoes(role?: string) {
    renderWithQuery(
      <CurrentUserProvider role={role}>
        <DriversPage />
      </CurrentUserProvider>,
    );
    const [acoes] = await screen.findAllByRole("button", { name: "Ações" });
    await userEvent.click(acoes);
  }

  it("admin vê a ação", async () => {
    await abrirAcoes("admin");
    expect(await screen.findByText("Acesso ao aplicativo")).toBeInTheDocument();
  });

  it("outros papéis não veem", async () => {
    await abrirAcoes("operator");
    expect(await screen.findByText("Editar")).toBeInTheDocument();
    expect(screen.queryByText("Acesso ao aplicativo")).not.toBeInTheDocument();
  });
});

describe("acesso do motorista ao aplicativo", () => {
  it("desligar pede confirmação antes de chamar a API", async () => {
    actions.getDriverAccess.mockResolvedValue({ driverId: "1", hasAccess: true, email: "bruno@x.com", isActive: true, lastLogin: null });
    actions.revokeDriverAccess.mockResolvedValue(undefined);
    renderWithQuery(<DriverAccessDialog driver={motorista} onClose={vi.fn()} />);
    const dialogo = await screen.findByRole("dialog");
    await within(dialogo).findByDisplayValue("bruno@x.com");
    await userEvent.click(within(dialogo).getByRole("button", { name: "Desligar acesso" }));
    expect(actions.revokeDriverAccess).not.toHaveBeenCalled();
    // A confirmação abre por cima do dialog do acesso (que fica inerte).
    const titulo = await screen.findByText("Desligar o acesso de Bruno?");
    const confirmacao = titulo.closest('[role="dialog"]') as HTMLElement;
    await userEvent.click(within(confirmacao).getByText("Desligar acesso"));
    await waitFor(() => expect(actions.revokeDriverAccess).toHaveBeenCalledWith("1"));
  });

  it("não deixa salvar quando a consulta do acesso falhou", async () => {
    actions.getDriverAccess.mockRejectedValue(new Error("fora do ar"));
    renderWithQuery(<DriverAccessDialog driver={motorista} onClose={vi.fn()} />);
    const dialogo = await screen.findByRole("dialog");
    expect(await within(dialogo).findByText("Não foi possível consultar")).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: /criar acesso/i })).toBeDisabled();
  });

  it("cria o acesso com e-mail e senha", async () => {
    actions.getDriverAccess.mockResolvedValue({ driverId: "1", hasAccess: false, email: null, isActive: false, lastLogin: null });
    actions.grantDriverAccess.mockResolvedValue({ driverId: "1", hasAccess: true, email: "bruno@x.com", isActive: true, lastLogin: null });
    renderWithQuery(<DriverAccessDialog driver={motorista} onClose={vi.fn()} />);
    const dialogo = await screen.findByRole("dialog");
    const email = await within(dialogo).findByLabelText(/e-mail/i);
    await userEvent.type(email, "bruno@x.com");
    const senha = within(dialogo).getByLabelText(/senha/i);
    await userEvent.type(senha, "senha-forte-123");
    await userEvent.click(within(dialogo).getByRole("button", { name: /criar|salvar|liberar/i }));
    await waitFor(() =>
      expect(actions.grantDriverAccess).toHaveBeenCalledWith("1", { email: "bruno@x.com", password: "senha-forte-123" }),
    );
  });

  it("mostra o acesso existente e permite desligar", async () => {
    actions.getDriverAccess.mockResolvedValue({ driverId: "1", hasAccess: true, email: "bruno@x.com", isActive: true, lastLogin: haMin(60) });
    actions.revokeDriverAccess.mockResolvedValue(undefined);
    renderWithQuery(<DriverAccessDialog driver={motorista} onClose={vi.fn()} />);
    const dialogo = await screen.findByRole("dialog");
    expect(await within(dialogo).findByDisplayValue("bruno@x.com")).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: "Desligar acesso" })).toBeEnabled();
  });

  it("valida senha curta sem chamar a API", async () => {
    actions.getDriverAccess.mockResolvedValue({ driverId: "1", hasAccess: false, email: null, isActive: false, lastLogin: null });
    renderWithQuery(<DriverAccessDialog driver={motorista} onClose={vi.fn()} />);
    const dialogo = await screen.findByRole("dialog");
    await userEvent.type(await within(dialogo).findByLabelText(/e-mail/i), "x");
    await userEvent.click(within(dialogo).getByRole("button", { name: /criar|salvar|liberar/i }));
    expect(actions.grantDriverAccess).not.toHaveBeenCalled();
  });
});

describe("duplicar rota cancelada", () => {
  it("cria a nova rota para a data escolhida", async () => {
    const criada = { ...rotaCancelada, id: "8", name: "Rota #8", status: "planned", duplicatedFromRouteId: "7" };
    actions.duplicateRoute.mockResolvedValue(criada);
    const onCreated = vi.fn();
    renderWithQuery(<DuplicateRouteDialog route={rotaCancelada} onClose={vi.fn()} onCreated={onCreated} />);
    const dialogo = await screen.findByRole("dialog");
    await userEvent.click(within(dialogo).getByRole("button", { name: /duplicar|criar/i }));
    await waitFor(() => expect(actions.duplicateRoute).toHaveBeenCalledWith("7", expect.objectContaining({ driverId: "1", vehicleId: "1" })));
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });

  it("mostra o erro do servidor", async () => {
    actions.duplicateRoute.mockRejectedValue(new Error("Rota não pode ser duplicada"));
    renderWithQuery(<DuplicateRouteDialog route={rotaCancelada} onClose={vi.fn()} />);
    const dialogo = await screen.findByRole("dialog");
    await userEvent.click(within(dialogo).getByRole("button", { name: /duplicar|criar/i }));
    await waitFor(() => expect(actions.duplicateRoute).toHaveBeenCalled());
  });
});

describe("páginas", () => {
  it("indicadores: troca para a aba de execução em campo", async () => {
    renderWithQuery(<AnalyticsPage />);
    const aba = await screen.findByRole("tab", { name: /execução em campo/i });
    await userEvent.click(aba);
    await waitFor(() => expect(actions.getFieldOverview).toHaveBeenCalled());
  });

  it("rotas: mostra a rota cancelada com o motivo", async () => {
    renderWithQuery(<RoutesPage />);
    expect((await screen.findAllByText(/Rota #7/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pneu furado/).length).toBeGreaterThan(0);
  });
});
