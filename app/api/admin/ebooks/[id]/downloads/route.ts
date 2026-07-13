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
    const [rows] = await db.execute(
      `SELECT id, nome, email, inscrito_newsletter, criado_em
       FROM ebook_downloads
       WHERE ebook_id = ?
       ORDER BY criado_em DESC`,
      [id]
    );
    return Response.json({ success: true, data: rows });
  } catch {
    return Response.json({ success: false, message: "Erro ao buscar downloads." }, { status: 500 });
  }
}
