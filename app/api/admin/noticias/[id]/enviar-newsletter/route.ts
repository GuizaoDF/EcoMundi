import { NextRequest } from "next/server";
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

function emailHtml(noticia: {
  titulo: string;
  resumo: string | null;
  slug: string;
  criado_em: string;
}) {
  const titulo = escapeHtml(noticia.titulo);
  const resumo = noticia.resumo ? escapeHtml(noticia.resumo) : "";
  const data = new Date(noticia.criado_em).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const url = `${process.env.SITE_URL ?? "https://ecomundi.com.br"}/noticias/${noticia.slug}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f7f5f0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e0d8;">

          <!-- Cabeçalho -->
          <tr>
            <td style="background:#ffffff;padding:22px;text-align:center;border-bottom:4px solid #0f3d2e;">
              <img src="https://ecomundi.com.br/logo.png" alt="ECO MUNDI" width="200" style="max-width:200px;width:200px;height:auto;display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding:36px 36px 28px 36px;">
              <span style="display:inline-block;background:#0f3d2e;color:#ffffff;font-size:11px;font-weight:bold;letter-spacing:0.1em;padding:4px 12px;border-radius:20px;text-transform:uppercase;margin-bottom:20px;">
                Nova publicação
              </span>
              <p style="margin:0 0 8px 0;font-size:13px;color:#9ca3af;">${data}</p>
              <h1 style="margin:0 0 20px 0;font-size:24px;line-height:1.35;color:#0f3d2e;font-family:Georgia,serif;">${titulo}</h1>
              ${resumo ? `<p style="margin:0 0 28px 0;font-size:15px;line-height:1.75;color:#555555;border-left:3px solid #0f3d2e;padding-left:16px;">${resumo}</p>` : ""}
              <div style="text-align:center;margin-top:8px;">
                <a href="${url}" style="display:inline-block;background:#0f3d2e;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:15px;">
                  Ler artigo completo →
                </a>
              </div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background:#f1eee8;padding:18px 36px;text-align:center;font-size:12px;color:#888888;line-height:1.6;">
              Você recebe este e-mail por estar inscrito na newsletter da <strong>ECO MUNDI</strong>.<br/>
              Para cancelar sua inscrição, responda este e-mail com o assunto "Descadastrar".
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function enviarEmLotes(
  transporter: nodemailer.Transporter,
  emails: string[],
  html: string,
  assunto: string
) {
  const LOTE = 8;
  let enviados = 0;
  for (let i = 0; i < emails.length; i += LOTE) {
    const lote = emails.slice(i, i + LOTE);
    const resultados = await Promise.allSettled(
      lote.map((email) =>
        transporter.sendMail({
          from: `"ECO MUNDI" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: assunto,
          html,
        })
      )
    );
    for (let j = 0; j < resultados.length; j++) {
      const r = resultados[j];
      if (r.status === "fulfilled") {
        console.log(`[newsletter] ✓ enviado para ${lote[j]} — messageId: ${r.value.messageId} — response: ${r.value.response}`);
        enviados++;
      } else {
        console.error(`[newsletter] ✗ falhou para ${lote[j]}:`, r.reason);
      }
    }
  }
  return enviados;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  const { id } = await params;

  const [[noticiaRows], [subscriberRows]]: any = await Promise.all([
    db.execute(
      "SELECT id, titulo, slug, publicado, newsletter_enviado_em FROM noticias WHERE id = ?",
      [id]
    ),
    db.execute("SELECT COUNT(*) AS total FROM newsletter WHERE ativo = 1"),
  ]);

  if ((noticiaRows as any[]).length === 0) {
    return Response.json({ success: false, message: "Notícia não encontrada." }, { status: 404 });
  }

  return Response.json({
    success: true,
    noticia: (noticiaRows as any[])[0],
    totalInscritos: (subscriberRows as any[])[0].total,
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  const { id } = await params;

  try {
    const [[noticiaRows], [subscriberRows]]: any = await Promise.all([
      db.execute(
        "SELECT id, titulo, slug, resumo, publicado, criado_em, newsletter_enviado_em FROM noticias WHERE id = ?",
        [id]
      ),
      db.execute("SELECT email FROM newsletter WHERE ativo = 1"),
    ]);

    const noticia = (noticiaRows as any[])[0];
    if (!noticia) {
      return Response.json({ success: false, message: "Notícia não encontrada." }, { status: 404 });
    }
    if (!noticia.publicado) {
      return Response.json(
        { success: false, message: "Publique a notícia antes de enviar a newsletter." },
        { status: 400 }
      );
    }
    if (noticia.newsletter_enviado_em) {
      return Response.json(
        { success: false, message: "Newsletter já foi enviada para esta notícia." },
        { status: 409 }
      );
    }

    const emails = (subscriberRows as any[]).map((r: any) => r.email);
    if (emails.length === 0) {
      return Response.json(
        { success: false, message: "Nenhum inscrito ativo para enviar." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const html = emailHtml(noticia);
    const assunto = `Nova publicação: ${noticia.titulo} | ECO MUNDI`;
    const enviados = await enviarEmLotes(transporter, emails, html, assunto);

    await db.execute(
      "UPDATE noticias SET newsletter_enviado_em = NOW() WHERE id = ?",
      [id]
    );

    return Response.json({
      success: true,
      message: `Newsletter enviada para ${enviados} inscrito${enviados !== 1 ? "s" : ""}.`,
      enviados,
    });
  } catch (error) {
    console.error("Erro ao enviar newsletter:", error);
    return Response.json({ success: false, message: "Erro ao enviar newsletter." }, { status: 500 });
  }
}
