import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  try {
    const [rows] = await db.execute(
      `SELECT f.id, f.nome, f.descricao, f.ativo, f.campos_perfil, f.criado_em,
              COUNT(r.id) AS total_resultados
       FROM diagnostico_formularios f
       LEFT JOIN diagnostico_resultados r ON r.formulario_id = f.id
       GROUP BY f.id
       ORDER BY f.criado_em DESC`
    ) as any[];

    const data = (rows as any[]).map((r) => ({
      ...r,
      campos_perfil: r.campos_perfil
        ? (typeof r.campos_perfil === "string" ? JSON.parse(r.campos_perfil) : r.campos_perfil)
        : [],
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erro ao listar formulários:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  try {
    const { nome, descricao } = await req.json();
    if (!nome) {
      return NextResponse.json({ success: false, message: "Nome é obrigatório." }, { status: 400 });
    }

    const [result] = await db.execute(
      "INSERT INTO diagnostico_formularios (nome, descricao, ativo) VALUES (?, ?, 0)",
      [nome, descricao || null]
    ) as any[];

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Erro ao criar formulário:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
