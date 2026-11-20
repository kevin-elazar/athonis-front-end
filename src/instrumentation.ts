import * as Sentry from "@sentry/nextjs";

/**
 * Erros do servidor Next (Server Components, Server Actions e rotas) no
 * Sentry. O DSN é o mesmo do navegador; sem ele nada é enviado.
 */
export function register() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
