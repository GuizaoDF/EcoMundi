import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const [rows] = await db.execute(
      `SELECT r.*, f.nome AS formulario_nome
       FROM diagnostico_resultados r
       JOIN diagnostico_formularios f ON f.id = r.formulario_id
       WHERE r.id = ?`,
      [id]
    ) as any[];

    if (!rows.length) {
      return NextResponse.json({ success: false, message: "Não encontrado." }, { status: 404 });
    }

    const resultado = rows[0];

    const [scores] = await db.execute(
      `SELECT sc.categoria_id, sc.pontuacao, sc.pontuacao_max, sc.percentual, c.nome
       FROM diagnostico_scores_categoria sc
       JOIN diagnostico_categorias c ON c.id = sc.categoria_id
       WHERE sc.resultado_id = ?
       ORDER BY sc.percentual ASC`,
      [id]
    ) as any[];

    const [respostas] = await db.execute(
      `SELECT dr.pergunta_id, dr.pontuacao, p.texto AS pergunta_texto,
              a.texto AS alternativa_texto, c.nome AS categoria_nome
       FROM diagnostico_respostas dr
       JOIN diagnostico_perguntas p ON p.id = dr.pergunta_id
       JOIN diagnostico_alternativas a ON a.id = dr.alternativa_id
       JOIN diagnostico_categorias c ON c.id = p.categoria_id
       WHERE dr.resultado_id = ?
       ORDER BY c.ordem ASC, p.ordem ASC`,
      [id]
    ) as any[];

    return NextResponse.json({
      success: true,
      data: {
        ...resultado,
        percentual: parseFloat(resultado.percentual),
        scores_categoria: scores.map((s: any) => ({ ...s, percentual: parseFloat(s.percentual) })),
        respostas,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar resultado:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const { desbloqueado } = await req.json();
    await db.execute(
      "UPDATE diagnostico_resultados SET desbloqueado = ? WHERE id = ?",
      [desbloqueado ? 1 : 0, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar desbloqueio:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    await db.execute("DELETE FROM diagnostico_resultados WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir resultado:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
