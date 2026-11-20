"use client";

/**
 * Mesma interface que `lib/mocks/api` expunha (list/create/update/remove),
 * agora servida pela API real através das Server Actions.
 *
 * O `predicate` de busca continua sendo aplicado no cliente, como antes — a
 * paginação e a ordenação seguem a cargo do DataTable.
 */

import * as actions from "./actions";
import { unwrapActionResult, type ActionResult } from "./errors";
import type {
  Company,
  Customer,
  Driver,
  DriverAccess,
  Order,
  OrderImportResult,
  Route,
  Vehicle,
} from "@/types/domain";
import type { CustomerFormInput } from "@/lib/validation/customer";
import type { DriverFormInput } from "@/lib/validation/driver";
import type { OrderFormInput } from "@/lib/validation/order";
import type { VehicleFormInput } from "@/lib/validation/vehicle";
import type { CompanyFormInput } from "@/lib/validation/company";

/**
 * As Server Actions devolvem `{ ok, data | message }`; aqui o resultado vira
 * dado ou `ApiError` com a mensagem real do backend, e o React Query e os
 * toasts seguem tratando a falha como exceção.
 */
async function run<T>(pending: Promise<ActionResult<T>>): Promise<T> {
  return unwrapActionResult(await pending);
}

function filtered<T>(items: T[], predicate?: (item: T) => boolean): T[] {
  return predicate ? items.filter(predicate) : items;
}

export const customersApi = {
  list: async (predicate?: (item: Customer) => boolean) =>
    filtered(await run(actions.listCustomers()), predicate),
  create: (input: CustomerFormInput) => run(actions.createCustomer(input)),
  update: (id: string, input: CustomerFormInput) => run(actions.updateCustomer(id, input)),
  remove: (id: string) => run(actions.deleteCustomer(id)),
};

export const driversApi = {
  list: async (predicate?: (item: Driver) => boolean) =>
    filtered(await run(actions.listDrivers()), predicate),
  create: (input: DriverFormInput) => run(actions.createDriver(input)),
  update: (id: string, input: DriverFormInput) => run(actions.updateDriver(id, input)),
  remove: (id: string) => run(actions.deleteDriver(id)),
};

export const vehiclesApi = {
  list: async (predicate?: (item: Vehicle) => boolean) =>
    filtered(await run(actions.listVehicles()), predicate),
  create: (input: VehicleFormInput) => run(actions.createVehicle(input)),
  update: (id: string, input: VehicleFormInput) => run(actions.updateVehicle(id, input)),
  remove: (id: string) => run(actions.deleteVehicle(id)),
};

export const ordersApi = {
  list: async (predicate?: (item: Order) => boolean) =>
    filtered(await run(actions.listOrders()), predicate),
  create: (input: OrderFormInput) => run(actions.createOrder(input)),
  update: (id: string, input: OrderFormInput) => run(actions.updateOrder(id, input)),
  remove: (id: string) => run(actions.deleteOrder(id)),
  import: (formData: FormData): Promise<OrderImportResult> => run(actions.importOrders(formData)),
};

export const routesApi = {
  list: async (predicate?: (item: Route) => boolean) =>
    filtered(await run(actions.listRoutes()), predicate),
  remove: (id: string) => run(actions.deleteRoute(id)),
  start: (id: string) => run(actions.startRoute(id)),
  complete: (id: string) => run(actions.completeRoute(id)),
  cancel: (id: string) => run(actions.cancelRoute(id)),
  duplicate: (id: string, input: { plannedDate?: string; driverId?: string; vehicleId?: string }) =>
    run(actions.duplicateRoute(id, input)),
  deliverStop: (routeId: string, orderId: string) => run(actions.deliverRouteStop(routeId, orderId)),
  optimize: (orderIds: string[], plannedDate?: string) =>
    run(actions.optimizeRoutes(orderIds, plannedDate)),
  validate: (orderIds: string[]) => run(actions.validateOrdersForRoute(orderIds)),
};

/** Empresa: só leitura e edição — a criação é feita no banco. */
export const companyApi = {
  get: (): Promise<Company> => run(actions.getCompany()),
  update: (input: CompanyFormInput): Promise<Company> => run(actions.updateCompany(input)),
};

/** Login do motorista no aplicativo de entregas. Só o admin administra. */
export const driverAccessApi = {
  get: (driverId: string): Promise<DriverAccess> => run(actions.getDriverAccess(driverId)),
  grant: (driverId: string, input: { email: string; password: string }): Promise<DriverAccess> =>
    run(actions.grantDriverAccess(driverId, input)),
  revoke: (driverId: string): Promise<void> => run(actions.revokeDriverAccess(driverId)),
};

/** Indicadores de execução em campo, calculados pelo backend. */
export const fieldAnalyticsApi = {
  overview: (range: actions.AnalyticsRange) => run(actions.getFieldOverview(range)),
  drivers: (range: actions.AnalyticsRange) => run(actions.getFieldDrivers(range)),
  regions: (range: actions.AnalyticsRange) => run(actions.getFieldRegions(range)),
  occurrences: (range: actions.AnalyticsRange) => run(actions.getFieldOccurrences(range)),
  routes: (range: actions.AnalyticsRange) => run(actions.getFieldRoutes(range)),
  comparison: (routeId: string) => run(actions.getRouteComparison(routeId)),
  live: () => run(actions.getLiveRoutes()),
};
