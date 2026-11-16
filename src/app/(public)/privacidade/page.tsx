import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | Athonis",
  description:
    "Quais dados o Athonis coleta, para quê, por quanto tempo e como pedir acesso ou remoção (LGPD).",
};

const ATUALIZADA_EM = "16/11/2026";
const CONTATO = "kevin.azal@catolicasc.edu.br";

/**
 * Política de privacidade pública, exigida pela LGPD (Lei 13.709/2018) e
 * pelas diretrizes de lojas de aplicativo para quem coleta localização.
 * O app do motorista abre esta página na tela de consentimento e no "Sobre".
 */
export default function PrivacidadePage() {
  return (
    <main className="bg-background text-foreground mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-primary text-sm hover:underline">
        ← Voltar para o início
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Política de Privacidade</h1>
      <p className="text-muted-foreground mt-2 text-sm">Atualizada em {ATUALIZADA_EM}</p>

      <div className="mt-8 space-y-8 leading-relaxed [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_li]:py-0.5">
        <section>
          <h2>Quem somos</h2>
          <p>
            O Athonis é um sistema de roteirização e acompanhamento de entregas, composto por este painel
            web e pelo aplicativo do motorista. Foi desenvolvido como Trabalho de Conclusão de Curso de
            Engenharia de Software no Centro Universitário Católica de Santa Catarina e é usado em
            piloto por uma empresa parceira. A empresa que contrata o Athonis é a controladora dos dados
            dos seus clientes e motoristas; o Athonis trata esses dados em nome dela.
          </p>
        </section>

        <section>
          <h2>Quais dados coletamos</h2>
          <ul>
            <li>
              <strong>Usuários do painel:</strong> nome, e-mail e senha (guardada só como hash).
            </li>
            <li>
              <strong>Clientes da empresa:</strong> nome ou razão social, CPF ou CNPJ, telefone, e-mail e
              endereço de entrega.
            </li>
            <li>
              <strong>Motoristas:</strong> nome, CPF, telefone, número, categoria e validade da CNH, e o
              e-mail de acesso ao aplicativo.
            </li>
            <li>
              <strong>Localização do motorista:</strong> latitude, longitude, precisão, velocidade e
              horário, lidos a cada 15 segundos ou 50 metros{" "}
              <strong>somente enquanto uma rota está em andamento</strong>. A coleta começa quando o
              motorista inicia a rota e para quando ele a encerra; fora disso o aplicativo não lê a
              posição. No Android, enquanto a rota está ativa, uma notificação fixa avisa que a
              localização está sendo usada.
            </li>
            <li>
              <strong>Eventos da entrega:</strong> baixa de cada parada, ocorrências (cliente ausente,
              endereço não encontrado etc.), observações digitadas pelo motorista e os horários de cada
              evento.
            </li>
            <li>
              <strong>Dados técnicos:</strong> registros de erro (sem conteúdo de formulários) e métricas
              de desempenho do servidor, usados para manter o sistema no ar.
            </li>
          </ul>
        </section>

        <section>
          <h2>Para que usamos</h2>
          <ul>
            <li>Planejar as rotas e mostrar ao motorista a sequência de entregas.</li>
            <li>Acompanhar a rota em tempo real no painel da empresa.</li>
            <li>
              Comparar o planejado com o executado (distância, tempo, atrasos e paradas fora de ordem) para
              melhorar o planejamento das próximas rotas.
            </li>
            <li>Registrar a prova de que cada entrega foi feita ou o motivo de não ter sido.</li>
          </ul>
          <p className="mt-3">
            A base legal é a execução do contrato entre a empresa e seus clientes e motoristas e o legítimo
            interesse na gestão da operação de entregas (LGPD, art. 7º, V e IX). A localização só é lida
            depois que o motorista consente, na tela que explica o motivo antes do pedido de permissão do
            sistema. Os dados não são vendidos nem usados para publicidade.
          </p>
        </section>

        <section>
          <h2>Com quem compartilhamos</h2>
          <ul>
            <li>
              <strong>Google Maps Platform:</strong> recebe os endereços e coordenadas das paradas para
              calcular rotas e geocodificar endereços.
            </li>
            <li>
              <strong>ViaCEP:</strong> recebe apenas o CEP digitado, para preencher o endereço.
            </li>
            <li>
              <strong>Sentry:</strong> recebe registros de erro técnicos, para correção de falhas.
            </li>
            <li>
              <strong>Hospedagem:</strong> os dados ficam num servidor privado virtual (VPS) contratado
              para o projeto, com acesso protegido por HTTPS.
            </li>
          </ul>
        </section>

        <section>
          <h2>Por quanto tempo guardamos</h2>
          <p>
            Os dados ficam guardados enquanto a empresa usar o Athonis. Ao fim do piloto ou do contrato,
            a empresa pode pedir a exclusão de todos os seus dados, que são removidos do banco e das
            cópias de segurança em até 30 dias (as cópias diárias são mantidas por 14 dias).
          </p>
        </section>

        <section>
          <h2>Segurança</h2>
          <p>
            Todo o tráfego usa HTTPS. As senhas são guardadas como hash; o acesso é por token com validade
            limitada, guardado num cookie httpOnly no painel e no armazenamento seguro do aparelho no
            aplicativo. Cada empresa só enxerga os próprios dados.
          </p>
        </section>

        <section>
          <h2>Seus direitos</h2>
          <p>
            Pela LGPD (art. 18), você pode pedir a confirmação de que tratamos seus dados, acesso a eles,
            correção, anonimização ou exclusão, e revogar o consentimento da localização a qualquer momento
            (nas configurações de permissão do aparelho). Motoristas e clientes podem fazer o pedido à
            empresa com quem trabalham ou diretamente ao responsável pelo projeto:{" "}
            <a href={`mailto:${CONTATO}`} className="text-primary hover:underline">
              {CONTATO}
            </a>
            . Respondemos em até 15 dias.
          </p>
        </section>

        <section>
          <h2>Mudanças nesta política</h2>
          <p>
            Quando esta política mudar, a data no topo é atualizada. Mudanças que afetem a coleta de
            localização são avisadas no aplicativo antes de valerem.
          </p>
        </section>
      </div>
    </main>
  );
}
