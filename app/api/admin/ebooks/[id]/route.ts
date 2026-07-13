import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  const { id } = await params;
  try {
    const [rows]: any = await db.execute(
      `SELECT id, titulo, descricao, arquivo_nome, arquivo_tamanho,
              (imagem_capa IS NOT NULL) AS has_capa, ativo, criado_em
       FROM ebooks WHERE id = ?`,
      [id]
    );
    const row = (rows as any[])[0];
    if (!row) return Response.json({ success: false, message: "E-book não encontrado." }, { status: 404 });
    return Response.json({ success: true, data: row });
  } catch {
    return Response.json({ success: false, message: "Erro ao buscar e-book." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  const { id } = await params;
  try {
    const formData = await req.formData();
    const titulo = (formData.get("titulo") as string)?.trim();
    const descricao = (formData.get("descricao") as string)?.trim() || null;
    const ativo = formData.get("ativo") === "1" ? 1 : 0;
    const imagemBase64 = formData.get("imagem_capa") as string | null;
    const removerCapa = formData.get("remover_capa") === "1";
    const pdfFile = formData.get("pdf") as File | null;

    if (!titulo) {
      return Response.json({ success: false, message: "Título é obrigatório." }, { status: 400 });
    }

    const sets: string[] = ["titulo = ?", "descricao = ?", "ativo = ?", "atualizado_em = NOW()"];
    const values: any[] = [titulo, descricao, ativo];

    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.size > 10 * 1024 * 1024) {
        return Response.json({ success: false, message: "O PDF deve ter no máximo 10MB." }, { status: 400 });
      }
      sets.push("arquivo = ?", "arquivo_nome = ?", "arquivo_tamanho = ?");
      values.push(Buffer.from(await pdfFile.arrayBuffer()), pdfFile.name, pdfFile.size);
    }

    if (imagemBase64) {
      const base64Data = imagemBase64.replace(/^data:[^;]+;base64,/, "");
      const buf = Buffer.from(base64Data, "base64");
      if (buf.length > 5 * 1024 * 1024) {
        return Response.json({ success: false, message: "A imagem de capa deve ter no máximo 5MB." }, { status: 400 });
      }
      sets.push("imagem_capa = ?");
      values.push(buf);
    } else if (removerCapa) {
      sets.push("imagem_capa = NULL");
    }

    values.push(id);
    await db.execute(`UPDATE ebooks SET ${sets.join(", ")} WHERE id = ?`, values);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar e-book:", error);
    return Response.json({ success: false, message: "Erro ao atualizar e-book." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  const { id } = await params;
  try {
    await db.execute("DELETE FROM ebooks WHERE id = ?", [id]);
    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, message: "Erro ao excluir e-book." }, { status: 500 });
  }
}
