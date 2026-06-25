import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 dias
  path: "/",
};

async function seedFirstAdmin() {
  const login = process.env.ADMIN_USER;
  const senha = process.env.ADMIN_PASSWORD;
  if (!login || !senha) return;

  const [rows]: any = await db.execute("SELECT COUNT(*) AS cnt FROM usuarios");
  if (rows[0].cnt > 0) return;

  const hash = await bcrypt.hash(senha, 10);
  await db.execute(
    "INSERT INTO usuarios (nome, login, senha_hash) VALUES (?, ?, ?)",
    ["Administrador", login, hash]
  );
}

export async function POST(request: NextRequest) {
  try {
    const { login, senha } = await request.json();

    if (!login || !senha) {
      return Response.json(
        { success: false, message: "Login e senha são obrigatórios." },
        { status: 400 }
      );
    }

    await seedFirstAdmin();

    const [rows]: any = await db.execute(
      "SELECT id, nome, login, senha_hash, ativo FROM usuarios WHERE login = ?",
      [login]
    );

    if (rows.length === 0) {
      return Response.json(
        { success: false, message: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    const usuario = rows[0];

    if (!usuario.ativo) {
      return Response.json(
        { success: false, message: "Usuário inativo." },
        { status: 403 }
      );
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return Response.json(
        { success: false, message: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    const token = await signToken({ id: usuario.id, nome: usuario.nome, login: usuario.login });

    const response = Response.json({
      success: true,
      usuario: { id: usuario.id, nome: usuario.nome, login: usuario.login },
    });

    const cookieHeader = `${COOKIE_NAME}=${token}; HttpOnly; ${COOKIE_OPTS.secure ? "Secure; " : ""}SameSite=Lax; Max-Age=${COOKIE_OPTS.maxAge}; Path=/`;
    response.headers.set("Set-Cookie", cookieHeader);

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return Response.json(
      { success: false, message: "Erro interno." },
      { status: 500 }
    );
  }
}
