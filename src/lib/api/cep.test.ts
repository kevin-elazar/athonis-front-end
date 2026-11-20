import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupCep } from "./cep";

const resposta = (corpo: object, status = 200) => new Response(JSON.stringify(corpo), { status });

afterEach(() => vi.restoreAllMocks());

describe("consulta de CEP", () => {
  it("não consulta CEP incompleto", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    expect(await lookupCep("8925")).toEqual({ found: false, message: "CEP incompleto" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("converte o endereço do ViaCEP", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      resposta({ cep: "89251-000", logradouro: "Rua A", bairro: "Centro", localidade: "Jaraguá do Sul", uf: "sc" }),
    );
    expect(await lookupCep("89251-000")).toEqual({
      found: true,
      address: { zipCode: "89251-000", street: "Rua A", district: "Centro", city: "Jaraguá do Sul", state: "SC" },
    });
  });

  it("trata CEP inexistente, erro HTTP e falha de rede", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(resposta({ erro: true }));
    expect(await lookupCep("00000000")).toEqual({ found: false, message: "CEP não encontrado" });
    fetchMock.mockResolvedValueOnce(resposta({}, 500));
    expect((await lookupCep("89251000")).found).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error("rede"));
    expect(await lookupCep("89251000")).toMatchObject({ found: false, message: expect.stringContaining("consultar") });
  });
});
