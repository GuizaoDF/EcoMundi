import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  try {
    const [rows] = await db.execute(`
      SELECT
        e.id, e.titulo, e.descricao,
        e.arquivo_nome, e.arquivo_tamanho,
        (e.imagem_capa IS NOT NULL) AS has_capa,
        e.ativo, e.criado_em, e.atualizado_em,
        COUNT(d.id) AS total_downloads
      FROM ebooks e
      LEFT JOIN ebook_downloads d ON d.ebook_id = e.id
      GROUP BY e.id
      ORDER BY e.criado_em DESC
    `);
    return Response.json({ success: true, data: rows });
  } catch (error) {
    console.error("Erro ao listar e-books:", error);
    return Response.json({ success: false, message: "Erro ao listar e-books." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  try {
    const formData = await req.formData();
    const titulo = (formData.get("titulo") as string)?.trim();
    const descricao = (formData.get("descricao") as string)?.trim() || null;
    const ativo = formData.get("ativo") === "1" ? 1 : 0;
    const imagemBase64 = formData.get("imagem_capa") as string | null;
    const pdfFile = formData.get("pdf") as File | null;

    if (!titulo) {
      return Response.json({ success: false, message: "Título é obrigatório." }, { status: 400 });
    }

    let pdfBuffer: Buffer | null = null;
    let arquivoNome: string | null = null;
    let arquivoTamanho: number | null = null;

    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.size > 10 * 1024 * 1024) {
        return Response.json({ success: false, message: "O PDF deve ter no máximo 10MB." }, { status: 400 });
      }
      pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
      arquivoNome = pdfFile.name;
      arquivoTamanho = pdfFile.size;
    }

    let capaBuffer: Buffer | null = null;
    if (imagemBase64) {
      const base64Data = imagemBase64.replace(/^data:[^;]+;base64,/, "");
      capaBuffer = Buffer.from(base64Data, "base64");
      if (capaBuffer.length > 5 * 1024 * 1024) {
        return Response.json({ success: false, message: "A imagem de capa deve ter no máximo 5MB." }, { status: 400 });
      }
    }

    const [result]: any = await db.execute(
      `INSERT INTO ebooks (titulo, descricao, arquivo, arquivo_nome, arquivo_tamanho, imagem_capa, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descricao, pdfBuffer, arquivoNome, arquivoTamanho, capaBuffer, ativo]
    );

    return Response.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Erro ao criar e-book:", error);
    return Response.json({ success: false, message: "Erro ao criar e-book." }, { status: 500 });
  }
}
