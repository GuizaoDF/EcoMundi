import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isValidFormat, isValidMx } from "@/lib/email-validator";

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT
        id,
        email,
        criado_em AS createdAt
      FROM newsletter
      ORDER BY criado_em DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Erro ao listar newsletter:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao listar newsletter.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !isValidFormat(email)) {
      return NextResponse.json(
        { success: false, message: "Endereço de e-mail inválido." },
        { status: 400 }
      );
    }

    const mxValido = await isValidMx(email);
    if (!mxValido) {
      return NextResponse.json(
        { success: false, message: "O domínio deste e-mail não existe ou não aceita mensagens." },
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