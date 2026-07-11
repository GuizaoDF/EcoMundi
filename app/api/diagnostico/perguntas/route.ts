import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const formularioId = searchParams.get("formulario_id");

    let formulario: any;
    if (formularioId) {
      const [rows] = await db.execute(
        "SELECT id, nome, descricao, campos_perfil FROM diagnostico_formularios WHERE id = ?",
        [formularioId]
      ) as any[];
      formulario = rows[0];
    } else {
      const [rows] = await db.execute(
        "SELECT id, nome, descricao, campos_perfil FROM diagnostico_formularios WHERE ativo = 1 LIMIT 1"
      ) as any[];
      formulario = rows[0];
    }
    if (formulario && formulario.campos_perfil && typeof formulario.campos_perfil === "string") {
      formulario.campos_perfil = JSON.parse(formulario.campos_perfil);
    }

    if (!formulario) {
      return Response.json({ success: true, ativo: false });
    }

    const [categorias] = await db.execute(
      `SELECT id, nome, descricao, ordem
       FROM diagnostico_categorias
       WHERE formulario_id = ? AND ativo = 1
       ORDER BY ordem ASC`,
      [formulario.id]
    ) as any[];

    if (!categorias.length) {
      return Response.json({
        success: true,
        ativo: true,
        formulario,
        categorias: [],
      });
    }

    const categoriaIds = categorias.map((c: any) => c.id);
    const placeholders = categoriaIds.map(() => "?").join(",");

    const [perguntas] = await db.execute(
      `SELECT id, categoria_id, texto, ordem
       FROM diagnostico_perguntas
       WHERE categoria_id IN (${placeholders}) AND ativo = 1
       ORDER BY categoria_id ASC, ordem ASC`,
      categoriaIds
    ) as any[];

    const perguntaIds = perguntas.map((p: any) => p.id);
    let alternativas: any[] = [];

    if (perguntaIds.length > 0) {
      const altPlaceholders = perguntaIds.map(() => "?").join(",");
      const [alts] = await db.execute(
        `SELECT id, pergunta_id, texto, pontuacao, ordem
         FROM diagnostico_alternativas
         WHERE pergunta_id IN (${altPlaceholders})
         ORDER BY pergunta_id ASC, ordem ASC`,
        perguntaIds
      ) as any[];
      alternativas = alts;
    }

    const altsByPergunta: Record<number, any[]> = {};
    for (const alt of alternativas) {
      if (!altsByPergunta[alt.pergunta_id]) altsByPergunta[alt.pergunta_id] = [];
      altsByPergunta[alt.pergunta_id].push({
        id: alt.id,
        texto: alt.texto,
        pontuacao: alt.pontuacao,
        ordem: alt.ordem,
      });
    }

    const perguntasByCategoria: Record<number, any[]> = {};
    for (const p of perguntas) {
      if (!perguntasByCategoria[p.categoria_id]) perguntasByCategoria[p.categoria_id] = [];
      perguntasByCategoria[p.categoria_id].push({
        id: p.id,
        texto: p.texto,
        ordem: p.ordem,
        alternativas: altsByPergunta[p.id] ?? [],
      });
    }

    const result = categorias.map((cat: any) => ({
      id: cat.id,
      nome: cat.nome,
      descricao: cat.descricao,
      perguntas: perguntasByCategoria[cat.id] ?? [],
    }));

    return Response.json({
      success: true,
      ativo: true,
      formulario: { id: formulario.id, nome: formulario.nome, descricao: formulario.descricao, campos_perfil: formulario.campos_perfil ?? [] },
      categorias: result,
    });
  } catch (error) {
    console.error("Erro ao buscar perguntas do diagnóstico:", error);
    return Response.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
