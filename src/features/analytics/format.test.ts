import { describe, expect, it } from "vitest";
import {
  dash,
  formatClock,
  formatKm,
  formatMinutes,
  formatPercent,
  formatSignedMinutes,
} from "./format";

describe("formatação dos indicadores", () => {
  it("nulo vira travessão, nunca zero", () => {
    for (const fn of [dash, formatPercent, formatKm, formatMinutes, formatSignedMinutes]) {
      expect(fn(null)).toBe("—");
    }
    expect(formatClock(null)).toBe("—");
  });

  it("formata valores", () => {
    expect(dash(3)).toBe("3");
    expect(formatPercent(92.5)).toBe("92,5%");
    expect(formatKm(12345)).toBe("12,3 km");
    expect(formatMinutes(12.34)).toBe("12,3 min");
    expect(formatMinutes(120)).toBe("2 h");
    expect(formatMinutes(135)).toBe("2 h 15 min");
    expect(formatSignedMinutes(0.2)).toBe("No horário");
    expect(formatSignedMinutes(12)).toBe("+12 min");
    expect(formatSignedMinutes(-5)).toBe("−5 min");
    expect(formatClock("invalido")).toBe("—");
    expect(formatClock("2026-11-16T13:05:00")).toMatch(/13:05/);
  });
});
