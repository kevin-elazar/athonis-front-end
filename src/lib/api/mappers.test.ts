import { describe, expect, it } from "vitest";
import {
  formatDeliveryAddress,
  mapCompany,
  mapCustomer,
  mapDriver,
  mapOrder,
  mapRoute,
  mapVehicle,
  toApiClient,
  toApiCompany,
  toApiDriver,
  toApiOrder,
  toApiVehicle,
  type ApiOrder,
} from "./mappers";

describe("empresa", () => {
  it("converte e aplica os padrões dos parâmetros", () => {
    const empresa = mapCompany({
      id_company: 1,
      corporate_name: "Athonis",
      document: "11222333000181",
      depot_latitude: "-26.48",
      depot_longitude: -49.07,
    });
    expect(empresa).toMatchObject({
      idCompany: 1,
      corporateName: "Athonis",
      tradeName: "",
      costPerKm: 1,
      costPerHour: 50,
      stopDurationMinutes: 30,
      defaultVehicleCapacityKg: 1000,
      timezone: "America/Sao_Paulo",
      isActive: true,
      depotLatitude: -26.48,
      hasDepotCoordinates: true,
    });
    expect(mapCompany({ id_company: 1, corporate_name: "x", document: "" }).hasDepotCoordinates).toBe(false);
  });

  it("envia campos vazios como null e documentos só com dígitos", () => {
    const corpo = toApiCompany({
      corporateName: "Athonis",
      tradeName: " ",
      document: "11.222.333/0001-81",
      phone: "(47) 3370-1234",
      depotState: "sc",
      depotZipCode: "89251-000",
      costPerKm: 2,
      costPerHour: 60,
      stopDurationMinutes: 10,
      defaultVehicleCapacityKg: 800,
    });
    expect(corpo).toMatchObject({
      trade_name: null,
      document: "11222333000181",
      phone: "4733701234",
      depot_state: "SC",
      depot_zip_code: "89251000",
      depot_latitude: undefined,
    });
  });
});

describe("cliente", () => {
  it("converte ida e volta", () => {
    const cliente = mapCustomer({
      client_id: 7,
      name: "Loja",
      document: "11222333000181",
      type: "J",
      street: "Rua A",
      number: "10",
      neighborhood: "Centro",
      city: "Jaraguá",
      state: "SC",
      zip_code: "89251000",
      order_count: 3,
      last_order_date: "2026-11-10 14:00:00",
    });
    expect(cliente).toMatchObject({ id: "7", district: "Centro", address: "Rua A, 10", orderCount: 3, lastOrderDate: "2026-11-10", status: "active" });
    expect(mapCustomer({ client_id: 1, name: "x", last_order_date: "lixo" } as never).lastOrderDate).toBe("");

    const corpo = toApiClient({
      type: "F",
      name: "Maria",
      document: "529.982.247-25",
      phone: "(47) 99123-4567",
      email: "",
      zipCode: "89251-000",
      street: "Rua",
      number: "1",
      district: "Centro",
      city: "Jaraguá",
      state: "sc",
      status: "active",
    });
    expect(corpo).toMatchObject({ document: "52998224725", phone: "47991234567", email: undefined, state: "SC", zip_code: "89251000", neighborhood: "Centro" });
  });
});

describe("motorista e veículo", () => {
  it("converte motorista", () => {
    expect(mapDriver({ driver_id: 2, name: "João", vehicle_id: 0, cnh_expiration: "2027-01-01" })).toMatchObject({
      id: "2",
      vehicleId: null,
      cnhExpiration: "2027-01-01",
      status: "available",
    });
    expect(toApiDriver({ name: "João", document: "", phone: "(47) 99123-4567", cnhCategory: null })).toMatchObject({
      document: undefined,
      phone: "47991234567",
      cnh_category: undefined,
    });
  });

  it("converte veículo", () => {
    expect(mapVehicle({ vehicle_id: 3, name: "Van", driver_id: 5 })).toMatchObject({ id: "3", type: "van", driverId: "5", capacityKg: null });
    expect(toApiVehicle({ name: " Van ", type: "van", driverId: "5", plate: "" })).toMatchObject({ name: "Van", driver_id: 5, plate: undefined });
  });
});

describe("pedido", () => {
  const pedido: ApiOrder = {
    order_id: 10,
    client_id: 7,
    client: { name: "Loja" },
    title: "Caixas",
    urgency: "high",
    quantity: 2,
    value: "150.5",
    delivery_date: "2026-11-20T00:00:00Z",
    delivery_street: "Rua A",
    delivery_number: "10",
    delivery_district: "Centro",
    delivery_city: "Jaraguá",
    delivery_state: "SC",
    delivery_zipcode: "89251000",
  };

  it("monta endereço e converte valores", () => {
    expect(formatDeliveryAddress(pedido)).toBe("Rua A, 10, Centro, Jaraguá, SC");
    expect(mapOrder(pedido)).toMatchObject({ id: "10", customerId: "7", customerName: "Loja", value: 150.5, status: "pending", date: "2026-11-20", origin: "Depósito" });
  });

  it("envia janela vazia como ausente", () => {
    const corpo = toApiOrder({
      customerId: null,
      title: "Caixas",
      quantity: 1,
      urgency: "normal",
      status: "pending",
      date: "2026-11-20",
      deliveryWindow: " ",
      driverId: "4",
      vehicleId: null,
      street: "Rua",
      number: "1",
      district: "Centro",
      city: "Jaraguá",
      state: "sc",
      zipCode: "89251000",
    });
    expect(corpo).toMatchObject({ client_id: undefined, delivery_window: undefined, driver_id: 4, vehicle_id: undefined, delivery_state: "SC" });
  });
});

describe("rota", () => {
  it("ordena as paradas pela sequência e marca a baixa", () => {
    const rota = mapRoute({
      route_id: 5,
      status: "active",
      driver_id: 2,
      driver: { name: "João" },
      vehicle: { name: "Van", plate: "ABC1D23" },
      total_distance_m: 12500,
      orders: [
        { order_id: 2, title: "B", status: "failed", stop_sequence: 2, delivery_city: "Jaraguá" },
        { order_id: 1, title: "", status: "delivered", stop_sequence: 1, client: { name: "Loja" }, delivery_city: "Guaramirim" },
        { order_id: 3, title: "", status: "pending", delivery_street: "Rua C", delivery_number: "3" },
      ],
    });
    expect(rota.name).toBe("Rota #5");
    expect(rota.vehicleName).toBe("Van — ABC1D23");
    expect(rota.orderIds).toEqual(["3", "1", "2"]);
    expect(rota.stops.map((s) => s.label)).toEqual(["Rua C, 3", "Loja", "B"]);
    expect(rota.stops[1].completed).toBe(true);
    expect(rota.stops[2].failed).toBe(true);
    expect(rota.totalDistanceKm).toBe(12.5);
    expect(rota.region).toBe("—");
  });
});
