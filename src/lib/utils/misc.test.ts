import { describe, expect, it } from "vitest";
import { cn } from "./cn";
import { formatDateBr, formatDateString, parseDateString } from "./date";
import { deliveryWindowHours, deliveryWindowLabel, fullDayHours } from "./delivery-window";
import { vehicleLabel } from "./vehicle-label";

describe("datas", () => {
  it("converte texto em Date local sem deslocar o dia", () => {
    const data = parseDateString("2026-03-01");
    expect(data?.getDate()).toBe(1);
    expect(data?.getMonth()).toBe(2);
    expect(parseDateString("")).toBeNull();
    expect(parseDateString("abc")).toBeNull();
  });

  it("converte Date em texto e em DD/MM/AAAA", () => {
    expect(formatDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(formatDateString(null)).toBe("");
    expect(formatDateBr("2026-01-05")).toBe("05/01/2026");
    expect(formatDateBr(null)).toBe("—");
  });
});

describe("janela de entrega", () => {
  it("vazio é dia todo", () => {
    expect(deliveryWindowLabel("")).toBe("Dia todo");
    expect(deliveryWindowLabel("08:00 - 12:00")).toBe("08:00 - 12:00");
  });

  it("calcula a duração pelo texto, com hífen ou travessão", () => {
    expect(deliveryWindowHours("08:00 - 12:00", 8)).toBe(4);
    expect(deliveryWindowHours("13:30 – 17:00", 8)).toBe(3.5);
    expect(deliveryWindowHours("", 9)).toBe(9);
    expect(deliveryWindowHours("manhã", 9)).toBe(9);
    expect(deliveryWindowHours("12:00 - 08:00", 9)).toBe(9);
  });

  it("expediente padrão de 8h", () => {
    expect(fullDayHours()).toBe(8);
    expect(fullDayHours("07:00", "17:00")).toBe(10);
  });
});

describe("rótulo do veículo", () => {
  it("nome primeiro, placa depois", () => {
    expect(vehicleLabel({ name: "Van 1", plate: "ABC1D23", brand: "", model: "" })).toBe("Van 1 — ABC1D23");
    expect(vehicleLabel({ name: "", plate: "", brand: "Fiat", model: "Ducato" })).toBe("Fiat Ducato");
    expect(vehicleLabel({ name: "", plate: "ABC1234", brand: "", model: "" })).toBe("ABC1234");
    expect(vehicleLabel({ name: "", plate: "", brand: "", model: "" })).toBe("Veículo sem identificação");
  });
});

describe("cn", () => {
  it("mantém tamanho tipográfico e cor juntos", () => {
    expect(cn("text-heading-1", "text-primary")).toBe("text-heading-1 text-primary");
    expect(cn("p-2", false, "p-4")).toBe("p-4");
  });
});
