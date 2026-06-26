import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token : null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token inválido." },
        { status: 400 }
      );
    }

    const email = await verifyUnsubscribeToken(token);

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Link de cancelamento inválido ou expirado." },
        { status: 400 }
      );
    }

    await db.execute("UPDATE newsletter SET ativo = 0 WHERE email = ?", [email]);

    return NextResponse.json({ success: true, message: "Inscrição cancelada com sucesso." });
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao cancelar inscrição." },
      { status: 500 }
    );
  }
}
