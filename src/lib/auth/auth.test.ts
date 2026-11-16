import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => {
  const valores = new Map<string, string>();
  return {
    valores,
    get: vi.fn((nome: string) => (valores.has(nome) ? { value: valores.get(nome) } : undefined)),
    set: vi.fn((nome: string, valor: string) => valores.set(nome, valor)),
    delete: vi.fn((nome: string) => valores.delete(nome)),
  };
});

vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

const post = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api/client", () => ({ createApiClient: () => ({ post }) }));

import { decodeJwtPayload, isJwtExpired } from "./jwt";
import { createSession, getSession, getSessionToken, SESSION_COOKIE } from "./session";
import { getCurrentUser } from "./user";
import { hasRole, requireUser } from "./authorization";
import { login, logout } from "./authentication";

/** JWT sem assinatura válida: o painel só lê as claims. */
function jwt(payload: object) {
  const base64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `cabecalho.${base64}.assinatura`;
}

const daquiAUmaHora = Math.floor(Date.now() / 1000) + 3600;

beforeEach(() => {
  cookieStore.valores.clear();
  post.mockReset();
});

describe("jwt", () => {
  it("lê as claims e a expiração", () => {
    expect(decodeJwtPayload(jwt({ sub: "1" }))).toEqual({ sub: "1" });
    expect(decodeJwtPayload("sem-payload")).toBeNull();
    expect(decodeJwtPayload("a.%%%.c")).toBeNull();
    expect(isJwtExpired(null)).toBe(false);
    expect(isJwtExpired({ exp: 1 })).toBe(true);
    expect(isJwtExpired({ exp: daquiAUmaHora })).toBe(false);
  });
});

describe("sessão", () => {
  it("grava o cookie httpOnly e devolve o usuário", async () => {
    await createSession(jwt({ sub: 3, name: "Ana", email: "ana@x.com", role: "admin", exp: daquiAUmaHora }), 120);
    expect(cookieStore.set).toHaveBeenCalledWith(SESSION_COOKIE, expect.any(String), expect.objectContaining({ httpOnly: true, maxAge: 120 }));
    expect(await getSessionToken()).toBeTruthy();
    const usuario = await getCurrentUser();
    expect(usuario).toEqual({ id: "3", name: "Ana", email: "ana@x.com", role: "admin" });
    expect(hasRole(usuario, "admin")).toBe(true);
    expect(await requireUser()).toEqual(usuario);
  });

  it("sessão expirada ou ausente manda para o login", async () => {
    expect(await getSession()).toBeNull();
    cookieStore.valores.set(SESSION_COOKIE, jwt({ exp: 1 }));
    expect(await getCurrentUser()).toBeNull();
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
    expect(hasRole(null, "admin")).toBe(false);
  });

  it("usa padrões quando faltam claims", async () => {
    cookieStore.valores.set(SESSION_COOKIE, jwt({ email: "x@y.com" }));
    expect(await getCurrentUser()).toEqual({ id: "x@y.com", name: "x@y.com", email: "x@y.com", role: undefined });
  });
});

describe("login", () => {
  it("rejeita dados inválidos sem chamar a API", async () => {
    expect(await login({ email: "x", password: "" })).toEqual({ success: false, message: "Credenciais inválidas" });
    expect(post).not.toHaveBeenCalled();
  });

  it("cria a sessão com o token recebido", async () => {
    post.mockResolvedValue({ data: { access_token: jwt({ sub: 1 }), expires_in: 60 } });
    expect(await login({ email: "a@b.com", password: "123" })).toEqual({ success: true });
    expect(cookieStore.valores.get(SESSION_COOKIE)).toBeTruthy();
  });

  it.each([
    [{ isAxiosError: true, response: { status: 401 } }, "Email ou senha incorretos"],
    [{ isAxiosError: true, code: "ECONNABORTED" }, "Não foi possível conectar"],
    [{ isAxiosError: true, response: { status: 500 } }, "Erro ao autenticar"],
    [new Error("x"), "Erro ao autenticar"],
  ])("trata a falha %#", async (erro, mensagem) => {
    post.mockRejectedValue(erro);
    const resultado = await login({ email: "a@b.com", password: "123" });
    expect(resultado.success).toBe(false);
    expect(!resultado.success && resultado.message).toContain(mensagem);
  });

  it("recusa resposta sem token", async () => {
    post.mockResolvedValue({ data: {} });
    expect(await login({ email: "a@b.com", password: "123" })).toMatchObject({ success: false });
  });

  it("logout apaga o cookie e volta ao login", async () => {
    cookieStore.valores.set(SESSION_COOKIE, "x");
    await expect(logout()).rejects.toThrow("REDIRECT:/login");
    expect(cookieStore.valores.has(SESSION_COOKIE)).toBe(false);
  });
});
