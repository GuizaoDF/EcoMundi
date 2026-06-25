import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT id, titulo, slug, resumo, criado_em,
             (imagem IS NOT NULL AND imagem != '') AS has_imagem
      FROM noticias
      WHERE publicado = 1
      ORDER BY criado_em DESC
    `);

    return Response.json({ success: true, data: rows });
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return Response.json(
      { success: false, message: "Erro ao buscar notícias." },
      { status: 500 }
    );
  }
}
