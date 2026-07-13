import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT
        id, titulo, slug, resumo,
        (imagem IS NOT NULL AND imagem != '') AS has_imagem,
        publicado, newsletter_enviado_em, criado_em, atualizado_em
      FROM noticias
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

export async function POST(request: Request) {
  try {
    const { titulo, slug, resumo, conteudo, imagem, publicado } =
      await request.json();

    if (!titulo?.trim() || !slug?.trim()) {
      return Response.json(
        { success: false, message: "Título e slug são obrigatórios." },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `INSERT INTO noticias (titulo, slug, resumo, conteudo, imagem, publicado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, slug, resumo || null, conteudo || null, imagem || null, publicado ? 1 : 0]
    );

    return Response.json({
      success: true,
      message: "Notícia criada com sucesso.",
      id: result.insertId,
    });
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      return Response.json(
        { success: false, message: "Já existe uma notícia com este slug." },
        { status: 409 }
      );
    }
    console.error("Erro ao criar notícia:", error);
    return Response.json(
      { success: false, message: "Erro ao criar notícia." },
      { status: 500 }
    );
  }
}
