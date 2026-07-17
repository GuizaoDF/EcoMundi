import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { searchParams } = new URL(req.url);
  const categoriaId = searchParams.get("categoria_id");

  if (searchParams.get("all") === "true") {
    const excludeCatId = searchParams.get("exclude_categoria_id");
    try {
      const [perguntas] = await db.execute(
        excludeCatId
          ? `SELECT id, texto, ordem FROM diagnostico_perguntas WHERE categoria_id != ? AND ativo = 1 ORDER BY texto ASC`
          : `SELECT id, texto, ordem FROM diagnostico_perguntas WHERE ativo = 1 ORDER BY texto ASC`,
        excludeCatId ? [excludeCatId] : []
      ) as any[];

      if ((perguntas as any[]).length > 0) {
        const ids = (perguntas as any[]).map((p: any) => p.id);
        const placeholders = ids.map(() => "?").join(",");
        const [alternativas] = await db.execute(
          `SELECT id, pergunta_id, texto, pontuacao, ordem FROM diagnostico_alternativas WHERE pergunta_id IN (${placeholders}) ORDER BY pergunta_id ASC, ordem ASC`,
          ids
        ) as any[];
        const altsByPergunta: Record<number, any[]> = {};
        for (const a of alternativas as any[]) {
          if (!altsByPergunta[a.pergunta_id]) altsByPergunta[a.pergunta_id] = [];
          altsByPergunta[a.pergunta_id].push(a);
        }
        const data = (perguntas as any[]).map((p: any) => ({ ...p, alternativas: altsByPergunta[p.id] ?? [] }));
        return NextResponse.json({ success: true, data });
      }
      return NextResponse.json({ success: true, data: [] });
    } catch (error) {
      console.error("Erro ao listar todas perguntas:", error);
      return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
    }
  }

  if (!categoriaId) {
    return NextResponse.json(
      { success: false, message: "categoria_id é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const [perguntas] = await db.execute(
      `SELECT id, texto, ordem, ativo FROM diagnostico_perguntas
       WHERE categoria_id = ? ORDER BY ordem ASC`,
      [categoriaId]
    ) as any[];

    if (perguntas.length > 0) {
      const ids = perguntas.map((p: any) => p.id);
      const placeholders = ids.map(() => "?").join(",");
      const [alternativas] = await db.execute(
        `SELECT id, pergunta_id, texto, pontuacao, ordem
         FROM diagnostico_alternativas WHERE pergunta_id IN (${placeholders})
         ORDER BY pergunta_id ASC, ordem ASC`,
        ids
      ) as any[];

      const altsByPergunta: Record<number, any[]> = {};
      for (const a of alternativas) {
        if (!altsByPergunta[a.pergunta_id]) altsByPergunta[a.pergunta_id] = [];
        altsByPergunta[a.pergunta_id].push(a);
      }

      const data = perguntas.map((p: any) => ({
        ...p,
        alternativas: altsByPergunta[p.id] ?? [],
      }));
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Erro ao listar perguntas:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  try {
    const { categoria_id, texto, ordem, alternativas } = await req.json();
    if (!categoria_id || !texto) {
      return NextResponse.json(
        { success: false, message: "categoria_id e texto são obrigatórios." },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      "INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (?, ?, ?)",
      [categoria_id, texto, ordem ?? 0]
    ) as any[];

    const perguntaId = result.insertId;

    const altsValidas = Array.isArray(alternativas) ? alternativas.filter((a: any) => a.texto?.trim()) : [];
    if (altsValidas.length > 0) {
      const placeholders = altsValidas.map(() => "(?, ?, ?, ?)").join(",");
      const values = altsValidas.flatMap((a: any) => [
        perguntaId, a.texto, a.pontuacao ?? 0, a.ordem ?? 0,
      ]);
      await db.execute(
        `INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES ${placeholders}`,
        values
      );
    }

    return NextResponse.json({ success: true, id: perguntaId });
  } catch (error) {
    console.error("Erro ao criar pergunta:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
