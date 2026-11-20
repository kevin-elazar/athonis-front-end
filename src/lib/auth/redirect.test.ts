import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirect";

describe("destino depois do login", () => {
  it("aceita caminho do próprio painel", () => {
    expect(safeRedirectPath("/routes")).toBe("/routes");
    expect(safeRedirectPath("/orders?new=1#topo")).toBe("/orders?new=1#topo");
  });

  it.each([
    [null],
    [""],
    ["dashboard"],
    ["//evil.example"],
    ["/\\evil.example"],
    ["/\\/evil.example"],
    ["https://evil.example/x"],
    ["javascript:alert(1)"],
    ["/rota\\..\\evil"],
    ["/\tevil"],
    ["/\n/evil.example"],
  ])("recusa %s e volta ao painel", (value) => {
    expect(safeRedirectPath(value)).toBe("/dashboard");
  });
});
