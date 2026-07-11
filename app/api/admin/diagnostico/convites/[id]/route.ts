import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const [rows] = await db.execute(
      "SELECT id, status FROM diagnostico_convites WHERE id = ?",
      [id]
    ) as any[];

    if (!rows.length) {
      return NextResponse.json({ success: false, message: "Não encontrado." }, { status: 404 });
    }

    await db.execute("DELETE FROM diagnostico_convites WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir convite:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
