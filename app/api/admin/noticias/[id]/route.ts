import db from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows]: any = await db.execute(
      `SELECT * FROM noticias WHERE id = ?`,
      [id]
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Toggle rápido de publicado (quando só envia { publicado })
    if (Object.keys(body).length === 1 && "publicado" in body) {
      await db.execute(
        `UPDATE noticias SET publicado = ? WHERE id = ?`,
        [body.publicado ? 1 : 0, id]
      );
      return Response.json({ success: true, message: "Status atualizado." });
    }

    const { titulo, slug, resumo, conteudo, imagem, publicado } = body;

    if (!titulo?.trim() || !slug?.trim()) {
      return Response.json(
        { success: false, message: "Título e slug são obrigatórios." },
        { status: 400 }
      );
    }

    await db.execute(
      `UPDATE noticias
       SET titulo = ?, slug = ?, resumo = ?, conteudo = ?, imagem = ?, publicado = ?
       WHERE id = ?`,
      [titulo, slug, resumo || null, conteudo || null, imagem || null, publicado ? 1 : 0, id]
    );

    return Response.json({ success: true, message: "Notícia atualizada com sucesso." });
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      return Response.json(
        { success: false, message: "Já existe uma notícia com este slug." },
        { status: 409 }
      );
    }
    console.error("Erro ao atualizar notícia:", error);
    return Response.json(
      { success: false, message: "Erro ao atualizar notícia." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.execute(`DELETE FROM noticias WHERE id = ?`, [id]);

    return Response.json({ success: true, message: "Notícia excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir notícia:", error);
    return Response.json(
      { success: false, message: "Erro ao excluir notícia." },
      { status: 500 }
    );
  }
}
