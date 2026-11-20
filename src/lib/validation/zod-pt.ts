import { z } from "zod";

/**
 * Mensagens do Zod em português para todos os formulários.
 *
 * Campo que nunca recebeu valor (undefined) vira "Campo obrigatório" em vez do
 * texto técnico "Invalid input: expected string, received undefined". Os
 * demais casos sem mensagem própria usam o idioma português do Zod.
 */
z.config({
  ...z.locales.pt(),
  customError: (issue) =>
    issue.code === "invalid_type" && issue.input === undefined ? "Campo obrigatório" : undefined,
});
