import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { searchParams } = new URL(req.url);
  const formularioId = searchParams.get("formulario_id");
  const classificacao = searchParams.get("classificacao");
  const busca = searchParams.get("busca");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") ?? "20", 10)));
  const offset = (page - 1) * perPage;

  try {
    const conditions: string[] = [];
    const values: any[] = [];

    if (formularioId) {
      conditions.push("r.formulario_id = ?");
      values.push(formularioId);
    }
    if (classificacao) {
      conditions.push("r.classificacao = ?");
      values.push(classificacao);
    }
    if (busca) {
      conditions.push("(r.nome LIKE ? OR r.email LIKE ? OR r.razao_social LIKE ?)");
      const like = `%${busca}%`;
      values.push(like, like, like);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM diagnostico_resultados r ${where}`,
      values
    ) as any[];

    const total = countRows[0].total;
    const totalPaginas = Math.ceil(total / perPage);

    const [rows] = await db.execute(
      `SELECT r.id, r.nome, r.email, r.razao_social, r.cnpj,
              r.classificacao, r.percentual, r.pontuacao_total, r.pontuacao_maxima,
              r.email_enviado, r.criado_em,
              f.nome AS formulario_nome,
              IF(c.id IS NOT NULL, 'convite', 'site') AS origem
       FROM diagnostico_resultados r
       JOIN diagnostico_formularios f ON f.id = r.formulario_id
       LEFT JOIN diagnostico_convites c ON c.resultado_id = r.id
       ${where}
       ORDER BY r.criado_em DESC
       LIMIT ? OFFSET ?`,
      [...values, perPage, offset]
    ) as any[];

    return NextResponse.json({
      success: true,
      data: rows.map((r: any) => ({ ...r, percentual: parseFloat(r.percentual) })),
      total,
      pagina: page,
      total_paginas: totalPaginas,
    });
  } catch (error) {
    console.error("Erro ao listar resultados:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
