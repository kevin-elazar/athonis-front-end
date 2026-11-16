import { describe, expect, it } from "vitest";
import { categoriaMinima, podeDirigir, validadeCnh, validadeCnhLabel } from "./cnh";

describe("categoria da CNH", () => {
  it("exige A para moto, B para van e C para caminhão", () => {
    expect(categoriaMinima("motorcycle")).toBe("A");
    expect(categoriaMinima("van")).toBe("B");
    expect(categoriaMinima("truck")).toBe("C");
  });

  it.each([
    ["A", "motorcycle", true],
    ["B", "motorcycle", false],
    ["AB", "motorcycle", true],
    ["B", "van", true],
    ["A", "van", false],
    ["B", "truck", false],
    ["E", "truck", true],
    ["AD", "utility", true],
  ] as const)("%s dirige %s? %s", (categoria, veiculo, esperado) => {
    expect(podeDirigir(categoria, veiculo)).toBe(esperado);
  });
});

describe("validade da CNH", () => {
  const hoje = new Date(2026, 10, 16);

  it("sem data ou com data inválida", () => {
    expect(validadeCnh(null, hoje)).toEqual({ estado: "sem_data" });
    expect(validadeCnh("xx", hoje)).toEqual({ estado: "sem_data" });
  });

  it("classifica vencida, vencendo e válida", () => {
    expect(validadeCnh("2026-11-15", hoje)).toEqual({ estado: "vencida", dias: 1 });
    expect(validadeCnh("2026-11-16", hoje)).toEqual({ estado: "vence_em_breve", dias: 0 });
    expect(validadeCnh("2026-12-01", hoje)).toEqual({ estado: "vence_em_breve", dias: 15 });
    expect(validadeCnh("2027-06-01T00:00:00Z", hoje)).toMatchObject({ estado: "valida" });
  });

  it("gera o texto do aviso", () => {
    expect(validadeCnhLabel({ estado: "vencida", dias: 1 })).toBe("CNH vencida ontem");
    expect(validadeCnhLabel({ estado: "vencida", dias: 5 })).toBe("CNH vencida há 5 dias");
    expect(validadeCnhLabel({ estado: "vence_em_breve", dias: 0 })).toBe("CNH vence hoje");
    expect(validadeCnhLabel({ estado: "vence_em_breve", dias: 1 })).toBe("CNH vence amanhã");
    expect(validadeCnhLabel({ estado: "vence_em_breve", dias: 9 })).toBe("CNH vence em 9 dias");
    expect(validadeCnhLabel({ estado: "valida", dias: 90 })).toBeNull();
    expect(validadeCnhLabel({ estado: "sem_data" })).toBeNull();
  });
});
