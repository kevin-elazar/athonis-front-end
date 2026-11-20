import * as Sentry from "@sentry/nextjs";

/**
 * Erros do navegador no Sentry. Sem DSN (desenvolvimento local, testes,
 * build de CI) o SDK nem é iniciado.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    // O SDK não envia IP, cookies nem corpo de formulário por padrão (LGPD).
    tracesSampleRate: 0.1,
  });
}
