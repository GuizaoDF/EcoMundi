import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    await db.execute("UPDATE diagnostico_formularios SET ativo = 0 WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao inativar formulário:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
