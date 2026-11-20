import { describe, expect, it } from "vitest";
import { ApiError, extractApiError, toApiErrorMessage } from "./errors";

describe("erros da API", () => {
  it("usa a mensagem do backend, inclusive em lista", () => {
    expect(extractApiError({ response: { status: 400, data: { message: "Inválido" } } })).toEqual({
      message: "Inválido",
      status: 400,
      fieldErrors: undefined,
    });
    expect(extractApiError({ response: { status: 400, data: { message: ["a", "b"] } } }).message).toBe("a, b");
  });

  it.each([
    [{ code: "ECONNABORTED" }, "Não foi possível conectar"],
    [{ message: "x" }, "Não foi possível conectar"],
    [{ response: { status: 401 } }, "Sessão expirada"],
    [{ response: { status: 403 } }, "permissão"],
    [{ response: { status: 404 } }, "não encontrado"],
    [{ message: "Request failed", response: { status: 500 } }, "Request failed"],
    [{ response: { status: 500 } }, "Erro inesperado"],
  ])("mensagem padrão para %o", (erro, trecho) => {
    expect(extractApiError(erro).message).toContain(trecho);
  });

  it("junta os erros por campo numa mensagem só", () => {
    const erro = {
      response: {
        status: 400,
        data: { message: "Dados inválidos", errors: [{ field: "email", messages: ["inválido", "obrigatório"] }] },
      },
    };
    expect(toApiErrorMessage(erro)).toBe("Dados inválidos — email: inválido, obrigatório");
    expect(toApiErrorMessage({ response: { status: 404 } })).toBe("Registro não encontrado.");
  });

  it("ApiError carrega status e campos", () => {
    const erro = new ApiError({ message: "x", status: 422, fieldErrors: [] });
    expect(erro).toBeInstanceOf(Error);
    expect(erro.name).toBe("ApiError");
    expect(erro.status).toBe(422);
  });
});
