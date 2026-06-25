import db from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [rows]: any = await db.execute(
      `SELECT id, titulo, slug, resumo, conteudo, imagem, criado_em
       FROM noticias
       WHERE slug = ? AND publicado = 1`,
      [slug]
    );

    if (rows.length === 0) {
      return Response.json(
        { success: false, message: "Notícia não encontrada." },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Erro ao buscar notícia:", error);
    return Response.json(
      { success: false, message: "Erro ao buscar notícia." },
      { status: 500 }
    );
  }
}
