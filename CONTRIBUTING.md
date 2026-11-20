# Como contribuir

1. Abra uma issue (bug ou melhoria) descrevendo o problema — há modelos em *New issue*.
2. Crie uma branch a partir de `desenvMobile`: `feat/<assunto>` ou `fix/<assunto>`.
3. Rode localmente antes de abrir o PR:
   ```bash
   npm run lint
   npm run typecheck   # gera os tipos do Next e roda o tsc
   npm run test:cov    # Vitest com limite mínimo de cobertura
   npm run build
   ```
4. Abra o Pull Request para `desenvMobile` preenchendo o template. O CI (lint, tipos, testes,
   build e SonarCloud) precisa ficar verde e o PR precisa de uma revisão aprovada.
5. Mensagens de commit no formato `tipo(escopo): descrição`
   (ex.: `feat(tracking): ...`, `fix(routes): ...`).

Telas novas seguem os componentes de `src/components/ui` e chamam a API só pelas Server Actions
de `src/lib/api/actions.ts` (o token nunca vai para o navegador). Escreva o teste ao lado do
arquivo (`*.test.ts(x)`).
