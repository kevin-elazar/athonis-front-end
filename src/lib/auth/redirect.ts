const FALLBACK = "/dashboard";
// Origem fictícia só para o parser de URL; nunca é acessada.
const BASE = "https://athonis.invalid";

function hasControlChar(value: string): boolean {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/**
 * Destino depois do login, vindo de `?redirect=`. Só aceita caminho relativo
 * do próprio painel ("/rotas?x=1"); "//outro.site", "/\outro.site" e URL
 * absoluta levariam o usuário recém-logado para fora (open redirect).
 */
export function safeRedirectPath(value: string | null | undefined, fallback = FALLBACK): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  // Barra invertida e caracteres de controle são normalizados pelo navegador
  // de formas que podem virar outro host ("/\outro.site" vira "//outro.site").
  if (value.includes("\\") || hasControlChar(value)) return fallback;

  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
