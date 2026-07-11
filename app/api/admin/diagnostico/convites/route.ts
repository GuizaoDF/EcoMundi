import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

function escapeHtml(v: string) {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendConviteEmail(params: {
  email: string;
  nomeEmpresa: string | null;
  nomeContato: string | null;
  mensagem: string | null;
  token: string;
}) {
  const siteUrl = process.env.SITE_URL || "https://ecomundi.com.br";
  const link = `${siteUrl}/diagnostico?convite=${params.token}`;
  const safeEmpresa = escapeHtml(params.nomeEmpresa || "sua empresa");
  const safeContato = params.nomeContato ? escapeHtml(params.nomeContato) : null;
  const safeMensagem = params.mensagem ? escapeHtml(params.mensagem) : null;

  const saudacao = safeContato ? `Olá, ${safeContato}!` : "Olá!";

  const mensagemHtml = safeMensagem
    ? `<p style="margin:0 0 20px 0;color:#333333;font-size:14px;line-height:1.7;background:#f7f5f0;border-left:4px solid #0f3d2e;padding:14px 18px;border-radius:6px;">${safeMensagem}</p>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <body style="margin:0;padding:0;background-color:#f7f5f0;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f0;padding:40px 20px;">
        <tr><td align="center">
          <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e0d8;">
            <tr>
              <td style="background:#ffffff;padding:22px;text-align:center;border-bottom:4px solid #0f3d2e;">
                <img src="https://ecomundi.com.br/logo.png" alt="ECO MUNDI" width="220" style="max-width:220px;width:220px;height:auto;display:block;margin:0 auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:34px 32px;">
                <h2 style="margin:0 0 8px 0;color:#0f3d2e;font-size:22px;">${saudacao}</h2>
                <p style="margin:0 0 20px 0;color:#555555;font-size:15px;line-height:1.6;">
                  A <strong>ECO MUNDI</strong> convida <strong>${safeEmpresa}</strong> para participar do
                  <strong>Diagnóstico Preliminar de Conformidade Regulatória e Sustentabilidade Corporativa</strong>.
                </p>
                ${mensagemHtml}
                <p style="margin:0 0 16px 0;color:#333333;font-size:14px;line-height:1.7;">
                  O diagnóstico é <strong>gratuito, confidencial</strong> e leva apenas alguns minutos.
                  Ao final, você receberá uma análise detalhada por categoria diretamente no seu e-mail.
                </p>
                <ul style="margin:0 0 24px 0;padding-left:20px;color:#555555;font-size:14px;line-height:2;">
                  <li>31 perguntas em 6 categorias</li>
                  <li>Resultado imediato na tela</li>
                  <li>Análise completa enviada por e-mail</li>
                  <li>Link de uso único e exclusivo</li>
                </ul>
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="${link}" style="display:inline-block;background:#0f3d2e;color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:bold;font-size:16px;">
                    Iniciar Diagnóstico
                  </a>
                </div>
                <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
                  Ou acesse diretamente: <a href="${link}" style="color:#0f3d2e;">${link}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f1eee8;padding:18px 32px;text-align:center;font-size:12px;color:#777777;">
                Este convite é de uso único e foi enviado exclusivamente para ${escapeHtml(params.email)}.
                Caso não reconheça este convite, ignore este e-mail.
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"ECO MUNDI" <${process.env.EMAIL_USER}>`,
    to: params.email,
    subject: `Convite | Diagnóstico de Conformidade Regulatória — ECO MUNDI`,
    html,
  });
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const busca = searchParams.get("busca");
  const formularioId = searchParams.get("formulario_id");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") ?? "20", 10)));
  const offset = (page - 1) * perPage;

  try {
    const conditions: string[] = [];
    const values: any[] = [];

    if (status) { conditions.push("c.status = ?"); values.push(status); }
    if (formularioId) { conditions.push("c.formulario_id = ?"); values.push(formularioId); }
    if (busca) {
      conditions.push("(c.email LIKE ? OR c.nome_empresa LIKE ? OR c.nome_contato LIKE ?)");
      const like = `%${busca}%`;
      values.push(like, like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM diagnostico_convites c ${where}`,
      values
    ) as any[];

    const total = countRows[0].total;

    const [rows] = await db.execute(
      `SELECT c.id, c.email, c.nome_empresa, c.nome_contato, c.status,
              c.criado_em, c.concluido_em, c.resultado_id, c.token,
              f.nome AS formulario_nome
       FROM diagnostico_convites c
       JOIN diagnostico_formularios f ON f.id = c.formulario_id
       ${where}
       ORDER BY c.criado_em DESC
       LIMIT ? OFFSET ?`,
      [...values, perPage, offset]
    ) as any[];

    return NextResponse.json({
      success: true,
      data: rows,
      total,
      pagina: page,
      total_paginas: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error("Erro ao listar convites:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  try {
    const { formulario_id, email, nome_empresa, nome_contato, mensagem } = await req.json();

    if (!formulario_id || !email) {
      return NextResponse.json(
        { success: false, message: "Formulário e e-mail são obrigatórios." },
        { status: 400 }
      );
    }

    const [forms] = await db.execute(
      "SELECT id FROM diagnostico_formularios WHERE id = ?",
      [formulario_id]
    ) as any[];
    if (!forms.length) {
      return NextResponse.json(
        { success: false, message: "Formulário não encontrado." },
        { status: 404 }
      );
    }

    const token = randomUUID().replace(/-/g, "");

    await db.execute(
      `INSERT INTO diagnostico_convites (formulario_id, email, nome_empresa, nome_contato, mensagem, token)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [formulario_id, email, nome_empresa || null, nome_contato || null, mensagem || null, token]
    );

    await sendConviteEmail({
      email,
      nomeEmpresa: nome_empresa || null,
      nomeContato: nome_contato || null,
      mensagem: mensagem || null,
      token,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao criar convite:", error);
    return NextResponse.json({ success: false, message: "Erro ao criar convite." }, { status: 500 });
  }
}
