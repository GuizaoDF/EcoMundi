import { NextRequest } from "next/server";
import db from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const [rows]: any = await db.execute(
      "SELECT arquivo, arquivo_nome FROM ebooks WHERE id = ? AND ativo = 1",
      [id]
    );
    const row = (rows as any[])[0];
    if (!row?.arquivo) {
      return new Response(null, { status: 404 });
    }
    const filename = row.arquivo_nome ?? "ebook.pdf";
    return new Response(row.arquivo, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
