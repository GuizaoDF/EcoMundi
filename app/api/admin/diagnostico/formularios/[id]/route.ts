import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const [rows] = await db.execute(
      `SELECT f.id, f.nome, f.descricao, f.campos_perfil, f.ativo, f.criado_em,
              COUNT(DISTINCT c.id) AS total_categorias,
              COUNT(DISTINCT r.id) AS total_resultados
       FROM diagnostico_formularios f
       LEFT JOIN diagnostico_categorias c ON c.formulario_id = f.id
       LEFT JOIN diagnostico_resultados r ON r.formulario_id = f.id
       WHERE f.id = ?
       GROUP BY f.id`,
      [id]
    ) as any[];

    if (!rows.length) {
      return NextResponse.json({ success: false, message: "Não encontrado." }, { status: 404 });
    }
    const row = rows[0];
    if (row.campos_perfil && typeof row.campos_perfil === "string") {
      row.campos_perfil = JSON.parse(row.campos_perfil);
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error("Erro ao buscar formulário:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const updates: string[] = [];
    const values: any[] = [];

    if (body.nome !== undefined) {
      if (!body.nome) {
        return NextResponse.json({ success: false, message: "Nome é obrigatório." }, { status: 400 });
      }
      updates.push("nome = ?");
      values.push(body.nome);
    }
    if (body.descricao !== undefined) {
      updates.push("descricao = ?");
      values.push(body.descricao || null);
    }
    if (body.campos_perfil !== undefined) {
      updates.push("campos_perfil = ?");
      values.push(body.campos_perfil !== null ? JSON.stringify(body.campos_perfil) : null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, message: "Nenhum campo para atualizar." }, { status: 400 });
    }

    values.push(id);
    await db.execute(
      `UPDATE diagnostico_formularios SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const [count] = await db.execute(
      "SELECT COUNT(*) AS total FROM diagnostico_resultados WHERE formulario_id = ?",
      [id]
    ) as any[];

    if (count[0].total > 0) {
      return NextResponse.json(
        { success: false, message: "Não é possível excluir um formulário com resultados registrados." },
        { status: 409 }
      );
    }

    await db.execute("DELETE FROM diagnostico_formularios WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir formulário:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
