/**
 * Escapa texto para entrar em HTML montado como string (balões e rótulos do
 * Leaflet usam innerHTML). Nome de cliente, motorista ou observação vêm do
 * cadastro e não podem virar marcação.
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
