import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const formulario_id = searchParams.get("formulario_id");
  const email = searchParams.get("email");
  const cnpj = searchParams.get("cnpj");

  if (!formulario_id || !email) {
    return NextResponse.json({ bloqueado: false });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id FROM diagnostico_resultados
       WHERE formulario_id = ? AND desbloqueado = 0
         AND (email = ? OR (cnpj IS NOT NULL AND cnpj != '' AND cnpj = ?))
       LIMIT 1`,
      [formulario_id, email, cnpj || ""]
    ) as any[];

    return NextResponse.json({ bloqueado: (rows as any[]).length > 0 });
  } catch (error) {
    console.error("Erro ao verificar trava diagnóstico:", error);
    return NextResponse.json({ bloqueado: false });
  }
}
