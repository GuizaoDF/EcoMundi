import { NextResponse } from "next/server";
import db from "@/lib/db";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "E-mail inválido." },
        { status: 400 }
      );
    }

    await db.execute(`INSERT INTO newsletter (email) VALUES (?)`, [email]);

    return NextResponse.json({ success: true, message: "Inscrito adicionado." });
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }
    console.error("Erro ao adicionar inscrito:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao adicionar inscrito." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM newsletter
      ORDER BY id DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao carregar newsletter."
      },
      {
        status: 500
      }
    );

  }
}