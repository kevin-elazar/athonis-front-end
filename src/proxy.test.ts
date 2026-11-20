import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

function jwt(payload: object) {
  return `h.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.s`;
}

function requisicao(caminho: string, token?: string) {
  const req = new NextRequest(new URL(caminho, "https://app.exemplo.com"));
  if (token) req.cookies.set("auth_token", token);
  return req;
}

const valido = jwt({ exp: Math.floor(Date.now() / 1000) + 3600 });

describe("proxy de autenticação", () => {
  it("manda para o login quem acessa área protegida sem sessão", () => {
    const resposta = proxy(requisicao("/routes/5"));
    expect(resposta.status).toBe(307);
    expect(resposta.headers.get("location")).toBe("https://app.exemplo.com/login?redirect=%2Froutes%2F5");
  });

  it("apaga o cookie expirado", () => {
    const resposta = proxy(requisicao("/dashboard", jwt({ exp: 1 })));
    expect(resposta.headers.get("location")).toContain("/login");
    expect(resposta.headers.get("set-cookie")).toContain("auth_token=;");
  });

  it("quem já está logado não vê a tela de login", () => {
    const resposta = proxy(requisicao("/login", valido));
    expect(resposta.headers.get("location")).toBe("https://app.exemplo.com/dashboard");
  });

  it("deixa passar o resto", () => {
    expect(proxy(requisicao("/dashboard", valido)).headers.get("x-middleware-next")).toBe("1");
    expect(proxy(requisicao("/privacidade")).headers.get("x-middleware-next")).toBe("1");
  });
});
