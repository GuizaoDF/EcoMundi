import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();

    if (body.ativo !== undefined && Object.keys(body).length === 1) {
      await db.execute("UPDATE usuarios SET ativo = ? WHERE id = ?", [
        body.ativo ? 1 : 0,
        id,
      ]);
      return Response.json({ success: true, message: "Status atualizado." });
    }

    const { nome, login, senha } = body;

    if (!nome?.trim() || !login?.trim()) {
      return Response.json(
        { success: false, message: "Nome e login são obrigatórios." },
        { status: 400 }
      );
    }

    if (senha) {
      if (senha.length < 6) {
        return Response.json(
          { success: false, message: "A senha deve ter pelo menos 6 caracteres." },
          { status: 400 }
        );
      }
      const hash = await bcrypt.hash(senha, 10);
      await db.execute(
        "UPDATE usuarios SET nome = ?, login = ?, senha_hash = ? WHERE id = ?",
        [nome.trim(), login.trim(), hash, id]
      );
    } else {
      await db.execute(
        "UPDATE usuarios SET nome = ?, login = ? WHERE id = ?",
        [nome.trim(), login.trim(), id]
      );
    }

    return Response.json({ success: true, message: "Usuário atualizado." });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return Response.json(
        { success: false, message: "Esse login já está em uso." },
        { status: 409 }
      );
    }
    return Response.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  const { id } = await params;

  if (Number(id) === session.id) {
    return Response.json(
      { success: false, message: "Você não pode excluir sua própria conta." },
      { status: 400 }
    );
  }

  await db.execute("DELETE FROM usuarios WHERE id = ?", [id]);
  return Response.json({ success: true, message: "Usuário removido." });
}
