import { NextResponse } from "next/server";
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

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  try {
    const [rows] = await db.execute(
      `SELECT c.email, c.nome_empresa, c.nome_contato, c.mensagem, c.token, c.status
       FROM diagnostico_convites c WHERE c.id = ?`,
      [id]
    ) as any[];

    if (!rows.length) {
      return NextResponse.json({ success: false, message: "Não encontrado." }, { status: 404 });
    }

    const c = rows[0];
    if (c.status === "concluido") {
      return NextResponse.json(
        { success: false, message: "Este convite já foi concluído." },
        { status: 409 }
      );
    }

    const siteUrl = process.env.SITE_URL || "https://ecomundi.com.br";
    const link = `${siteUrl}/diagnostico?convite=${c.token}`;
    const safeEmpresa = escapeHtml(c.nome_empresa || "sua empresa");
    const safeContato = c.nome_contato ? escapeHtml(c.nome_contato) : null;
    const safeMensagem = c.mensagem ? escapeHtml(c.mensagem) : null;
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
                  </p>
                  <div style="text-align:center;margin-bottom:28px;">
                    <a href="${link}" style="display:inline-block;background:#0f3d2e;color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:bold;font-size:16px;">
                      Iniciar Diagnóstico
                    </a>
                  </div>
                  <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
                    Ou acesse: <a href="${link}" style="color:#0f3d2e;">${link}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f1eee8;padding:18px 32px;text-align:center;font-size:12px;color:#777777;">
                  Este convite é de uso único e foi enviado exclusivamente para ${escapeHtml(c.email)}.
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
      to: c.email,
      subject: `Convite | Diagnóstico de Conformidade Regulatória — ECO MUNDI`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao reenviar convite:", error);
    return NextResponse.json({ success: false, message: "Erro ao reenviar e-mail." }, { status: 500 });
  }
}
