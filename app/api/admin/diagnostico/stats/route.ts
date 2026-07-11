import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { searchParams } = new URL(req.url);
  const formularioId = searchParams.get("formulario_id");

  const filterClause = formularioId ? "WHERE r.formulario_id = ?" : "";
  const filterValues = formularioId ? [formularioId] : [];

  try {
    const [totais] = await db.execute(
      `SELECT COUNT(*) AS total, AVG(r.percentual) AS media_percentual
       FROM diagnostico_resultados r ${filterClause}`,
      filterValues
    ) as any[];

    const [porClassificacao] = await db.execute(
      `SELECT r.classificacao, COUNT(*) AS total
       FROM diagnostico_resultados r ${filterClause}
       GROUP BY r.classificacao`,
      filterValues
    ) as any[];

    const catFilter = formularioId
      ? "WHERE c.formulario_id = ? AND r.formulario_id = ?"
      : "";
    const catValues = formularioId ? [formularioId, formularioId] : [];

    const [porCategoria] = await db.execute(
      `SELECT c.nome, AVG(sc.percentual) AS media_percentual
       FROM diagnostico_scores_categoria sc
       JOIN diagnostico_categorias c ON c.id = sc.categoria_id
       JOIN diagnostico_resultados r ON r.id = sc.resultado_id
       ${catFilter}
       GROUP BY c.id, c.nome
       ORDER BY c.ordem ASC`,
      catValues
    ) as any[];

    const mesFilter = formularioId ? "AND r.formulario_id = ?" : "";
    const mesValues = formularioId ? [formularioId] : [];

    const [porMes] = await db.execute(
      `SELECT DATE_FORMAT(r.criado_em, '%Y-%m') AS mes, COUNT(*) AS total
       FROM diagnostico_resultados r
       WHERE r.criado_em >= DATE_SUB(NOW(), INTERVAL 12 MONTH) ${mesFilter}
       GROUP BY mes
       ORDER BY mes ASC`,
      mesValues
    ) as any[];

    return NextResponse.json({
      success: true,
      total: totais[0].total,
      media_percentual: totais[0].media_percentual
        ? parseFloat(parseFloat(totais[0].media_percentual).toFixed(1))
        : 0,
      por_classificacao: porClassificacao,
      media_por_categoria: porCategoria.map((r: any) => ({
        nome: r.nome,
        media_percentual: parseFloat(parseFloat(r.media_percentual).toFixed(1)),
      })),
      resultados_por_mes: porMes,
    });
  } catch (error) {
    console.error("Erro ao buscar stats do diagnóstico:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
