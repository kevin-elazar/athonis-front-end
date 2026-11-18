import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Company, Customer, Driver, Vehicle } from "@/types/domain";

const navegacao = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }));
const busca = vi.hoisted(() => ({ query: "redirect=/routes" }));
vi.mock("next/navigation", () => ({
  useRouter: () => navegacao,
  useSearchParams: () => new URLSearchParams(busca.query),
  usePathname: () => "/",
}));

const login = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/authentication", () => ({ login, logout: vi.fn() }));

const lookupCep = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api/cep", () => ({ lookupCep }));

import { LoginForm } from "./auth/login-form";
import { CustomerForm } from "./customers/customer-form";
import { DriverForm } from "./drivers/driver-form";
import { VehicleForm } from "./vehicles/vehicle-form";
import { OrderForm } from "./orders/order-form";
import { CompanyForm } from "./company/company-form";

const motorista: Driver = {
  id: "1",
  name: "João",
  document: "",
  phone: "",
  cnh: "",
  cnhCategory: "B",
  cnhExpiration: "2027-01-01",
  vehicleId: null,
  status: "available",
  deliveryCount: 0,
  performance: 0,
};

const veiculo: Vehicle = {
  id: "1",
  name: "Van",
  plate: "ABC1D23",
  model: "Ducato",
  brand: "Fiat",
  year: 2020,
  type: "van",
  capacityKg: 1000,
  driverId: null,
  status: "available",
};

const cliente = {
  id: "1",
  name: "Loja Centro",
  document: "11222333000181",
  phone: "4733701234",
  email: "loja@x.com",
  type: "J",
  street: "Rua A",
  number: "10",
  district: "Centro",
  zipCode: "89251000",
  complement: "",
  address: "Rua A, 10",
  city: "Jaraguá do Sul",
  state: "SC",
  orderCount: 0,
  lastOrderDate: null,
  status: "active",
} as Customer;

beforeEach(() => {
  vi.clearAllMocks();
  lookupCep.mockResolvedValue({
    found: true,
    address: { zipCode: "89251-000", street: "Rua B", district: "Centro", city: "Jaraguá do Sul", state: "SC" },
  });
});

describe("login", () => {
  it("mostra os erros de validação", async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));
    expect(await screen.findByText("Informe um email válido")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("mostra a mensagem do servidor e redireciona quando dá certo", async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "admin@athonis.com");
    await userEvent.type(screen.getByLabelText("Senha"), "123");

    login.mockResolvedValueOnce({ success: false, message: "Email ou senha incorretos" });
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));
    expect(await screen.findByText("Email ou senha incorretos")).toBeInTheDocument();

    login.mockResolvedValueOnce({ success: true });
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() => expect(navegacao.push).toHaveBeenCalledWith("/routes"));
  });

  it.each(["//evil.example", "/\\evil.example", "https://evil.example"])(
    "não segue redirect para fora do painel (%s)",
    async (destino) => {
      busca.query = `redirect=${encodeURIComponent(destino)}`;
      try {
        render(<LoginForm />);
        await userEvent.type(screen.getByLabelText("Email"), "admin@athonis.com");
        await userEvent.type(screen.getByLabelText("Senha"), "123");
        login.mockResolvedValueOnce({ success: true });
        await userEvent.click(screen.getByRole("button", { name: /entrar/i }));
        await waitFor(() => expect(navegacao.push).toHaveBeenLastCalledWith("/dashboard"));
      } finally {
        busca.query = "redirect=/routes";
      }
    },
  );
});

describe("cadastros", () => {
  it("cliente: valida e preenche o endereço pelo CEP", async () => {
    const onSubmit = vi.fn();
    render(<CustomerForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /salvar|cadastrar|criar/i }));
    expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    const cep = screen.getByLabelText(/cep/i);
    await userEvent.type(cep, "89251000");
    await waitFor(() => expect(lookupCep).toHaveBeenCalledWith("89251000"));
    await waitFor(() => expect(screen.getByDisplayValue("Rua B")).toBeInTheDocument());
  });

  it("cliente: edição envia os valores", async () => {
    const onSubmit = vi.fn();
    render(<CustomerForm defaultValues={{ ...cliente, type: "J" }} onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />);
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: "Loja Centro", type: "J" });
  });

  it("motorista: só o nome é obrigatório", async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<DriverForm onSubmit={onSubmit} onCancel={onCancel} submitLabel="Salvar" />);
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/nome/i), "Pedro");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("motorista: edição mostra a CNH", () => {
    render(<DriverForm defaultValues={motorista} isEditing onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByDisplayValue("João")).toBeInTheDocument();
  });

  it("veículo: valida placa", async () => {
    const onSubmit = vi.fn();
    render(<VehicleForm drivers={[motorista]} onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />);
    await userEvent.type(screen.getByLabelText(/nome/i), "Van 2");
    await userEvent.type(screen.getByLabelText(/placa/i), "XX");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText(/Mercosul/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("veículo: edição envia", async () => {
    const onSubmit = vi.fn();
    render(<VehicleForm drivers={[motorista]} defaultValues={{ ...veiculo, year: 2020, capacityKg: 1000, driverId: null }} isEditing onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />);
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it("pedido: mostra os campos obrigatórios", async () => {
    const onSubmit = vi.fn();
    render(
      <OrderForm customers={[cliente]} drivers={[motorista]} vehicles={[veiculo]} onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Informe o título do pedido")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("pedido: edição envia", async () => {
    const onSubmit = vi.fn();
    render(
      <OrderForm
        customers={[cliente]}
        drivers={[motorista]}
        vehicles={[veiculo]}
        isEditing
        defaultValues={{
          customerId: "1",
          title: "Caixas",
          quantity: 2,
          urgency: "normal",
          status: "pending",
          date: "2026-11-20",
          deliveryWindow: "",
          driverId: null,
          vehicleId: null,
          street: "Rua A",
          number: "10",
          district: "Centro",
          city: "Jaraguá do Sul",
          state: "SC",
          zipCode: "89251000",
        }}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitLabel="Salvar"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});

describe("empresa", () => {
  const empresa: Company = {
    idCompany: 1,
    corporateName: "Athonis Demonstração",
    tradeName: "Athonis",
    document: "11222333000181",
    stateRegistration: "",
    municipalRegistration: "",
    email: "",
    phone: "",
    website: "",
    depotStreet: "Rua A",
    depotNumber: "1",
    depotComplement: "",
    depotDistrict: "Centro",
    depotCity: "Jaraguá do Sul",
    depotState: "SC",
    depotZipCode: "89251000",
    depotLatitude: null,
    depotLongitude: null,
    costPerKm: 1,
    costPerHour: 50,
    stopDurationMinutes: 10,
    defaultVehicleCapacityKg: 1000,
    operationStartTime: "08:00",
    operationEndTime: "18:00",
    logoUrl: "",
    timezone: "America/Sao_Paulo",
    isActive: true,
    hasDepotCoordinates: false,
  };

  it("salva os parâmetros", async () => {
    const onSubmit = vi.fn();
    render(<CompanyForm company={empresa} onSubmit={onSubmit} />);
    expect(screen.getByDisplayValue("Athonis Demonstração")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it("somente leitura para quem não é admin", () => {
    render(<CompanyForm company={{ ...empresa, hasDepotCoordinates: true, depotLatitude: -26.4, depotLongitude: -49.0 }} onSubmit={vi.fn()} canEdit={false} />);
    expect(screen.queryByRole("button", { name: /salvar/i })).toBeNull();
  });
});
