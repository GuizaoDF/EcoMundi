import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const { nome, descricao, ordem, ativo } = await req.json();
    if (!nome) {
      return NextResponse.json({ success: false, message: "Nome é obrigatório." }, { status: 400 });
    }

    await db.execute(
      "UPDATE diagnostico_categorias SET nome = ?, descricao = ?, ordem = ?, ativo = ? WHERE id = ?",
      [nome, descricao || null, ordem ?? 0, ativo ? 1 : 0, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const [count] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM diagnostico_respostas dr
       JOIN diagnostico_perguntas p ON p.id = dr.pergunta_id
       WHERE p.categoria_id = ?`,
      [id]
    ) as any[];

    if (count[0].total > 0) {
      return NextResponse.json(
        { success: false, message: "Não é possível excluir uma categoria com respostas registradas. Desative-a." },
        { status: 409 }
      );
    }

    await db.execute("DELETE FROM diagnostico_categorias WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
