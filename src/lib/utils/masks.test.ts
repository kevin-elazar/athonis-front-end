import { describe, expect, it } from "vitest";
import {
  digitsInclude,
  isCompleteCep,
  isValidCnh,
  isValidCnpj,
  isValidCpf,
  isValidDocument,
  isValidPhone,
  isValidPlate,
  maskCep,
  maskCnh,
  maskCnpj,
  maskCpf,
  maskDocument,
  maskPhone,
  maskPlate,
  onlyDigits,
} from "./masks";

describe("máscaras", () => {
  it("remove tudo que não é dígito", () => {
    expect(onlyDigits("529.982.247-25")).toBe("52998224725");
    expect(onlyDigits(undefined as unknown as string)).toBe("");
  });

  it.each([
    ["529", "529"],
    ["529982", "529.982"],
    ["529982247", "529.982.247"],
    ["52998224725999", "529.982.247-25"],
  ])("CPF %s vira %s", (entrada, saida) => {
    expect(maskCpf(entrada)).toBe(saida);
  });

  it.each([
    ["11", "11"],
    ["11222", "11.222"],
    ["11222333", "11.222.333"],
    ["112223330001", "11.222.333/0001"],
    ["11222333000181", "11.222.333/0001-81"],
  ])("CNPJ %s vira %s", (entrada, saida) => {
    expect(maskCnpj(entrada)).toBe(saida);
  });

  it("escolhe a máscara pelo tipo do cliente", () => {
    expect(maskDocument("52998224725", "F")).toBe("529.982.247-25");
    expect(maskDocument("11222333000181", "J")).toBe("11.222.333/0001-81");
  });

  it.each([
    ["", ""],
    ["47", "(47"],
    ["473370", "(47) 3370"],
    ["4733701234", "(47) 3370-1234"],
    ["47991234567", "(47) 99123-4567"],
  ])("telefone %s vira %s", (entrada, saida) => {
    expect(maskPhone(entrada)).toBe(saida);
  });

  it("formata CEP, CNH e placa", () => {
    expect(maskCep("89251")).toBe("89251");
    expect(maskCep("89251000")).toBe("89251-000");
    expect(maskCnh("123.456.789-01x")).toBe("12345678901");
    expect(maskPlate("abc-1d23")).toBe("ABC1D23");
  });
});

describe("validações", () => {
  it("valida CPF pelo dígito verificador", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("529.982.247-26")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });

  it("valida CNPJ pelo dígito verificador", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11.222.333/0001-82")).toBe(false);
    expect(isValidCnpj("00000000000000")).toBe(false);
    expect(isValidCnpj("1122")).toBe(false);
  });

  it("valida documento conforme o tipo", () => {
    expect(isValidDocument("52998224725", "F")).toBe(true);
    expect(isValidDocument("11222333000181", "J")).toBe(true);
    expect(isValidDocument("11222333000181", "F")).toBe(false);
  });

  it("valida telefone, CEP, CNH e placa", () => {
    expect(isValidPhone("(47) 3370-1234")).toBe(true);
    expect(isValidPhone("(47) 99123-4567")).toBe(true);
    expect(isValidPhone("3370-1234")).toBe(false);
    expect(isCompleteCep("89251-000")).toBe(true);
    expect(isCompleteCep("8925")).toBe(false);
    expect(isValidCnh("12345678901")).toBe(true);
    expect(isValidCnh("1234")).toBe(false);
    expect(isValidPlate("ABC1234")).toBe(true);
    expect(isValidPlate("abc1d23")).toBe(true);
    expect(isValidPlate("AB12345")).toBe(false);
  });

  it("compara campos pontuados pelos dígitos", () => {
    expect(digitsInclude("52998224725", "529.982")).toBe(true);
    expect(digitsInclude("529.982.247-25", "98224")).toBe(true);
    expect(digitsInclude("52998224725", "abc")).toBe(false);
  });
});
