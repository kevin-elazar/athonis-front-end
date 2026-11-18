import { describe, expect, it } from "vitest";
import { loginSchema } from "./auth";
import { companyFormSchema } from "./company";
import { customerFormSchema } from "./customer";
import { driverFormSchema } from "./driver";
import { orderFormSchema } from "./order";
import { vehicleFormSchema } from "./vehicle";

type Resultado = { error?: { issues: { path: PropertyKey[]; message: string }[] } };

/** Mensagens de erro por campo, para comparar com o que a tela mostra. */
const mensagens = (resultado: Resultado): Record<string, string> =>
  Object.fromEntries((resultado.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));

describe("login", () => {
  it("exige email válido e senha", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    const r = loginSchema.safeParse({ email: "a", password: "" });
    expect(mensagens(r)).toMatchObject({ email: "Informe um email válido", password: "Informe sua senha" });
  });
});

describe("cliente", () => {
  const valido = {
    type: "F" as const,
    name: "Maria",
    document: "529.982.247-25",
    phone: "(47) 99123-4567",
    email: "maria@exemplo.com",
    zipCode: "89251-000",
    street: "Rua A",
    number: "10",
    district: "Centro",
    city: "Jaraguá do Sul",
    state: "SC",
    status: "active" as const,
  };

  it("aceita cliente completo", () => {
    expect(customerFormSchema.safeParse(valido).success).toBe(true);
  });

  it("rejeita CPF, CNPJ, telefone e CEP inválidos", () => {
    const pf = customerFormSchema.safeParse({
      ...valido,
      document: "111.111.111-11",
      phone: "123",
      zipCode: "89251-0000",
    });
    expect(mensagens(pf)).toMatchObject({
      document: "CPF inválido",
      phone: expect.stringContaining("DDD"),
      zipCode: "CEP deve ter 8 dígitos",
    });
    const pj = customerFormSchema.safeParse({ ...valido, type: "J" });
    expect(mensagens(pj).document).toBe("CNPJ inválido");
  });
});

describe("motorista", () => {
  it("só o nome é obrigatório", () => {
    expect(driverFormSchema.safeParse({ name: "João" }).success).toBe(true);
  });

  it("valida os complementos quando preenchidos", () => {
    const r = driverFormSchema.safeParse({
      name: "João",
      document: "123",
      phone: "1",
      cnh: "12",
      cnhCategory: "B",
    });
    expect(mensagens(r)).toMatchObject({
      document: "CPF inválido",
      phone: expect.any(String),
      cnh: "A CNH tem 11 dígitos",
      cnhExpiration: "Informe a validade da CNH",
    });
    const semCategoria = driverFormSchema.safeParse({ name: "João", cnhExpiration: "2027-01-01" });
    expect(mensagens(semCategoria).cnhCategory).toBe("Informe a categoria da CNH");
  });
});

describe("veículo", () => {
  it("valida placa e ano quando preenchidos", () => {
    expect(
      vehicleFormSchema.safeParse({ name: "Van", type: "van", year: "", capacityKg: "" }).success,
    ).toBe(true);
    const r = vehicleFormSchema.safeParse({ name: "Van", type: "van", plate: "XX", year: 1900 });
    expect(mensagens(r)).toMatchObject({
      plate: expect.stringContaining("Mercosul"),
      year: expect.stringContaining("1950"),
    });
  });
});

describe("pedido", () => {
  const pedido = {
    title: "Entrega",
    quantity: "2",
    urgency: "normal",
    status: "pending",
    value: "",
    date: "2026-11-20",
    driverId: "1",
    vehicleId: "2",
    street: "Rua A",
    number: "1",
    district: "Centro",
    city: "Jaraguá",
    state: "SC",
    zipCode: "89251000",
  };

  it("converte quantidade e deixa valor vazio como ausente", () => {
    const r = orderFormSchema.safeParse(pedido);
    expect(r.success).toBe(true);
    expect(r.data?.quantity).toBe(2);
    expect(r.data?.value).toBeUndefined();
  });

  it("exige motorista e veículo", () => {
    const erros = mensagens(orderFormSchema.safeParse({ ...pedido, driverId: null, vehicleId: null }));
    expect(erros.driverId).toBe("Selecione o motorista");
    expect(erros.vehicleId).toBe("Selecione o veículo");
  });

  it("rejeita valor negativo", () => {
    expect(mensagens(orderFormSchema.safeParse({ ...pedido, value: -1 })).value).toBe(
      "O valor não pode ser negativo",
    );
  });
});

describe("empresa", () => {
  it("valida horários e coordenadas", () => {
    const base = {
      corporateName: "Athonis",
      document: "11222333000181",
      costPerKm: 1,
      costPerHour: 50,
      stopDurationMinutes: 10,
      defaultVehicleCapacityKg: 1000,
    };
    expect(companyFormSchema.safeParse(base).success).toBe(true);
    const r = companyFormSchema.safeParse({ ...base, operationStartTime: "25:00", depotLatitude: 100 });
    expect(mensagens(r)).toMatchObject({
      operationStartTime: "Use o formato HH:mm",
      depotLatitude: expect.stringContaining("Latitude"),
    });
  });
});
