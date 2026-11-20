import { NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api/client";

/**
 * Planilha modelo da importação, gerada pela API para a empresa logada (com
 * os motoristas e veículos dela). Passa por aqui porque o token da sessão
 * fica num cookie httpOnly, fora do alcance do navegador.
 */
export async function GET() {
  try {
    const api = await createAuthenticatedApiClient();
    const response = await api.get("/order-imports/template", { responseType: "arraybuffer" });
    return new NextResponse(response.data, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="modelo-importacao-pedidos.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "Não foi possível gerar a planilha modelo" }, { status: 502 });
  }
}
