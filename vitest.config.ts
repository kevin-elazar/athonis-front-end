import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Testes do painel (Vitest + Testing Library).
 *
 * A cobertura mede o código da aplicação. Ficam de fora a landing page
 * (marketing, só animação), a vitrine de componentes em (dev), os tipos e os
 * arquivos de teste. O limite mínimo trava o CI se a cobertura cair.
 */
export default defineConfig({
  // JSX pelo esbuild do Vite, no modo automático do React 19.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // "server-only" quebra fora do Next; nos testes o módulo é vazio.
      "server-only": path.resolve(__dirname, "src/test/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/types/**",
        "src/features/landing/**",
        "src/app/(dev)/**",
        "src/app/(public)/**",
        "src/**/index.ts",
        "src/**/*.d.ts",
      ],
      thresholds: {
        lines: 30,
        statements: 30,
        functions: 25,
        branches: 25,
      },
    },
  },
});
