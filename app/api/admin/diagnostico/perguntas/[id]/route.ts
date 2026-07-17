import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const [perguntas] = await db.execute(
      "SELECT id, categoria_id, texto, ordem, ativo FROM diagnostico_perguntas WHERE id = ?",
      [id]
    ) as any[];

    if (!perguntas.length) {
      return NextResponse.json({ success: false, message: "Não encontrado." }, { status: 404 });
    }

    const [alternativas] = await db.execute(
      "SELECT id, texto, pontuacao, ordem FROM diagnostico_alternativas WHERE pergunta_id = ? ORDER BY ordem ASC",
      [id]
    ) as any[];

    return NextResponse.json({ success: true, data: { ...perguntas[0], alternativas } });
  } catch (error) {
    console.error("Erro ao buscar pergunta:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const { texto, ordem, ativo, alternativas } = await req.json();
    if (!texto) {
      return NextResponse.json({ success: false, message: "Texto é obrigatório." }, { status: 400 });
    }

    await db.execute(
      "UPDATE diagnostico_perguntas SET texto = ?, ordem = ?, ativo = ? WHERE id = ?",
      [texto, ordem ?? 0, ativo ? 1 : 0, id]
    );

    if (Array.isArray(alternativas)) {
      for (const alt of alternativas) {
        const textoVazio = !alt.texto?.trim();
        if (alt.id) {
          if (textoVazio) {
            await db.execute(
              "DELETE FROM diagnostico_alternativas WHERE id = ? AND pergunta_id = ?",
              [alt.id, id]
            );
          } else {
            await db.execute(
              "UPDATE diagnostico_alternativas SET texto = ?, pontuacao = ?, ordem = ? WHERE id = ? AND pergunta_id = ?",
              [alt.texto, alt.pontuacao ?? 0, alt.ordem ?? 0, alt.id, id]
            );
          }
        } else if (!textoVazio) {
          await db.execute(
            "INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES (?, ?, ?, ?)",
            [id, alt.texto, alt.pontuacao ?? 0, alt.ordem ?? 0]
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar pergunta:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const [count] = await db.execute(
      "SELECT COUNT(*) AS total FROM diagnostico_respostas WHERE pergunta_id = ?",
      [id]
    ) as any[];

    if (count[0].total > 0) {
      await db.execute(
        "UPDATE diagnostico_perguntas SET ativo = 0 WHERE id = ?",
        [id]
      );
      return NextResponse.json({ success: true, desativada: true });
    }

    await db.execute("DELETE FROM diagnostico_perguntas WHERE id = ?", [id]);
    return NextResponse.json({ success: true, desativada: false });
  } catch (error) {
    console.error("Erro ao excluir pergunta:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
