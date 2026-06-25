import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  const [rows] = await db.execute(
    "SELECT id, nome, login, ativo, criado_em FROM usuarios ORDER BY criado_em DESC"
  );

  return Response.json({ success: true, data: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  try {
    const { nome, login, senha } = await request.json();

    if (!nome?.trim() || !login?.trim() || !senha?.trim()) {
      return Response.json(
        { success: false, message: "Nome, login e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return Response.json(
        { success: false, message: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(senha, 10);

    await db.execute(
      "INSERT INTO usuarios (nome, login, senha_hash) VALUES (?, ?, ?)",
      [nome.trim(), login.trim(), hash]
    );

    return Response.json({ success: true, message: "Usuário criado." }, { status: 201 });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return Response.json(
        { success: false, message: "Esse login já está em uso." },
        { status: 409 }
      );
    }
    console.error("Erro ao criar usuário:", error);
    return Response.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}
