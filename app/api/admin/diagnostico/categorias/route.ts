import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { searchParams } = new URL(req.url);
  const formularioId = searchParams.get("formulario_id");

  if (!formularioId) {
    return NextResponse.json(
      { success: false, message: "formulario_id é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const [rows] = await db.execute(
      `SELECT c.id, c.nome, c.descricao, c.ordem, c.ativo, c.criado_em,
              COUNT(p.id) AS total_perguntas
       FROM diagnostico_categorias c
       LEFT JOIN diagnostico_perguntas p ON p.categoria_id = c.id
       WHERE c.formulario_id = ?
       GROUP BY c.id
       ORDER BY c.ordem ASC`,
      [formularioId]
    ) as any[];

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  try {
    const { formulario_id, nome, descricao, ordem } = await req.json();
    if (!formulario_id || !nome) {
      return NextResponse.json(
        { success: false, message: "formulario_id e nome são obrigatórios." },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      "INSERT INTO diagnostico_categorias (formulario_id, nome, descricao, ordem) VALUES (?, ?, ?, ?)",
      [formulario_id, nome, descricao || null, ordem ?? 0]
    ) as any[];

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
