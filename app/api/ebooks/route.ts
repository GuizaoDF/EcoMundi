import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT
        e.id, e.titulo, e.descricao,
        (e.imagem_capa IS NOT NULL) AS has_capa,
        e.arquivo_nome, e.arquivo_tamanho, e.criado_em,
        COUNT(d.id) AS total_downloads
      FROM ebooks e
      LEFT JOIN ebook_downloads d ON d.ebook_id = e.id
      WHERE e.ativo = 1
      GROUP BY e.id
      ORDER BY e.criado_em DESC
    `);
    return Response.json({ success: true, data: rows });
  } catch (error) {
    console.error("Erro ao buscar e-books:", error);
    return Response.json({ success: false, message: "Erro ao buscar e-books." }, { status: 500 });
  }
}
