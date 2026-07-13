import { NextRequest } from "next/server";
import db from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const [rows]: any = await db.execute(
      "SELECT imagem_capa FROM ebooks WHERE id = ? AND ativo = 1",
      [id]
    );
    const row = (rows as any[])[0];
    if (!row?.imagem_capa) {
      return new Response(null, { status: 404 });
    }
    return new Response(row.imagem_capa, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
