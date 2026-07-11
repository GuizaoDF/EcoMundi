import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const [rows] = await db.execute(
      `SELECT c.id, c.formulario_id, c.email, c.nome_empresa, c.nome_contato, c.status,
              f.nome AS formulario_nome
       FROM diagnostico_convites c
       JOIN diagnostico_formularios f ON f.id = c.formulario_id
       WHERE c.token = ?`,
      [token]
    ) as any[];

    if (!rows.length) {
      return NextResponse.json(
        { success: false, message: "Convite não encontrado." },
        { status: 404 }
      );
    }

    const convite = rows[0];

    if (convite.status === "concluido") {
      return NextResponse.json(
        { success: false, message: "Este convite já foi utilizado." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        formulario_id: convite.formulario_id,
        email: convite.email,
        nome_empresa: convite.nome_empresa,
        nome_contato: convite.nome_contato,
      },
    });
  } catch (error) {
    console.error("Erro ao validar convite:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno." },
      { status: 500 }
    );
  }
}
