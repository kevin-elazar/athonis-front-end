# Athonis Web — painel da operação

[![CI](https://github.com/kevin-elazar/athonis-front-end/actions/workflows/ci.yml/badge.svg?branch=desenvMobile)](https://github.com/kevin-elazar/athonis-front-end/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=kevin-elazar_athonis-front-end&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kevin-elazar_athonis-front-end)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=kevin-elazar_athonis-front-end&metric=coverage)](https://sonarcloud.io/summary/new_code?id=kevin-elazar_athonis-front-end)

Painel web do **Athonis**, sistema de roteirização e acompanhamento de entregas B2B. É por aqui que a
empresa cadastra clientes, motoristas, veículos e pedidos, gera as rotas otimizadas, acompanha os
motoristas em tempo real e compara o planejado com o executado em campo.

Faz parte do TCC de Engenharia de Software (Católica SC). Os outros repositórios:

| Repositório | Papel |
|---|---|
| [AthonisMobile](https://github.com/kevin-elazar/AthonisMobile) | App do motorista (Expo / React Native) — repositório principal, com a [Wiki](https://github.com/kevin-elazar/AthonisMobile/wiki) do projeto |
| [AthonisBackend](https://github.com/kevin-elazar/AthonisBackend) | API (NestJS + PostgreSQL) e infraestrutura |
| **athonis-front-end** | Este painel |

## Funcionalidades

- Cadastros com validação de CPF/CNPJ, CNH, placa e preenchimento de endereço pelo CEP
- Importação de pedidos por planilha, com relatório das linhas rejeitadas
- Geração de rotas otimizadas (Google Route Optimization) e duplicação de rotas
- Acompanhamento ao vivo: posição do motorista e próxima parada
- Execução em campo: entregas no horário, atrasos, ocorrências, paradas fora de ordem e a comparação
  planejado × executado de cada rota, com o trajeto real no mapa
- Acesso do motorista ao aplicativo (criar, trocar e revogar o login)
- [Política de privacidade](src/app/(public)/privacidade/page.tsx) pública em `/privacidade` (LGPD)

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query ·
React Hook Form + Zod · Leaflet · Recharts · Vitest + Testing Library · Sentry

O token de acesso fica num cookie httpOnly e nunca chega ao navegador: as chamadas à API passam pelas
Server Actions (`src/lib/api/actions.ts`).

## Como rodar

Pré-requisitos: Node 22 e a [API](https://github.com/kevin-elazar/AthonisBackend) rodando (padrão
`http://localhost:8080`).

```bash
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000
```

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run lint` | ESLint |
| `npm test` | Testes (Vitest) |
| `npm run test:cov` | Testes com cobertura (falha abaixo do mínimo definido em `vitest.config.ts`) |
| `npm run build` | Build de produção (`output: "standalone"`) |

### Docker

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.exemplo.com -t athonis-web .
docker run -p 3000:3000 athonis-web
```

## Testes

Os testes ficam ao lado do código (`*.test.ts(x)`): regras de documento e CNH, esquemas de validação,
conversão entre o formato da API e o da tela, Server Actions com a API simulada, sessão e proxy de
autenticação, hooks do React Query e os formulários de cadastro. A cobertura mede o código da aplicação,
sem a landing page de marketing e a vitrine de componentes.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`): lint → typecheck → testes com cobertura → build →
SonarCloud → imagem no GitHub Container Registry. Push em `desenvMobile` publica em **staging**;
`master` publica em **produção**. O deploy roda no runner self-hosted da VPS
(`.github/workflows/deploy.yml`), descrito no [README da infraestrutura](https://github.com/kevin-elazar/AthonisBackend/blob/master/infra/README.md).

## Autoria

O painel foi criado por [@GustavoJRoss](https://github.com/GustavoJRoss): a primeira versão, a partir
de novembro de 2025, e a interface atual (design system, tokens, componentes, telas com dados simulados
e troca de tema), entre agosto e setembro de 2026. Neste TCC, de
[@kevin-elazar](https://github.com/kevin-elazar), entraram: a ligação da nova interface com a API real,
as máscaras e validações brasileiras (CPF/CNPJ, CNH, placa, CEP), a importação de pedidos, o ciclo da
rota (iniciar, concluir, baixa, cancelamento e duplicação), o acesso do motorista ao aplicativo, o
acompanhamento ao vivo, a execução em campo com a comparação planejado × executado, os testes, a
política de privacidade, a observabilidade (Sentry), o Docker e o CI/CD. O histórico de commits
preserva a autoria de cada parte.

## Licença

[MIT](LICENSE)
