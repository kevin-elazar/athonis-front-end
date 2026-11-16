import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone com o servidor Node e só as dependências usadas:
  // é o que a imagem Docker copia (ver Dockerfile).
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
