import { NextResponse } from "next/server";
import db from "@/lib/db";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "E-mail inválido." },
        { status: 400 }
      );
    }

    await db.execute(
      `
        INSERT INTO newsletter (email)
        VALUES (?)
      `,
      [email]
    );

    return NextResponse.json({
      success: true,
      message: "Inscrição realizada com sucesso!",
    });
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    console.error("Erro ao cadastrar newsletter:", error);

    return NextResponse.json(
      { success: false, message: "Erro ao cadastrar newsletter." },
      { status: 500 }
    );
  }
}