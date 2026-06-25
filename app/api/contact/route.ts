import nodemailer from "nodemailer";
import db from "@/lib/db";
import { isValidFormat, isValidMx } from "@/lib/email-validator";
import { verifyHcaptcha } from "@/lib/hcaptcha";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const { name, email, company, message, hcaptchaToken } = await req.json();

    if (!hcaptchaToken || !(await verifyHcaptcha(hcaptchaToken))) {
      return Response.json(
        { success: false, message: "Verificação de segurança inválida." },
        { status: 400 }
      );
    }

    if (!name || !email || !message) {
      return Response.json(
        { success: false, message: "Nome, e-mail e mensagem são obrigatórios." },
        { status: 400 }
      );
    }

    if (!isValidFormat(email)) {
      return Response.json(
        { success: false, message: "Endereço de e-mail inválido." },
        { status: 400 }
      );
    }

    const mxValido = await isValidMx(email);
    if (!mxValido) {
      return Response.json(
        { success: false, message: "O domínio deste e-mail não existe ou não aceita mensagens." },
        { status: 400 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company || "Não informado");
    const safeMessage = escapeHtml(message);

    await db.execute(
      `
        INSERT INTO contatos
          (nome, email, empresa, mensagem)
        VALUES
          (?, ?, ?, ?)
      `,
      [name, email, company || null, message]
    );

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Site ECO MUNDI" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: "Novo contato recebido pelo site",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <body style="margin:0;padding:0;background-color:#f7f5f0;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f0;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e0d8;">
                  <tr>
                    <td style="background:#ffffff;padding:22px;text-align:center;border-bottom:4px solid #0f3d2e;">
                      <img src="https://ecomundi.com.br/logo.png" alt="ECO MUNDI" width="220" style="max-width:220px;width:220px;height:auto;display:block;margin:0 auto;" />
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:34px 32px;">
                      <h2 style="margin:0 0 10px 0;color:#0f3d2e;font-size:24px;">
                        Novo contato recebido pelo site
                      </h2>

                      <p style="margin:0 0 24px 0;color:#555555;font-size:15px;line-height:1.6;">
                        Um visitante preencheu o formulário de contato da ECO MUNDI.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;border-radius:12px;padding:18px 22px;margin-bottom:24px;">
                        <tr>
                          <td style="color:#333333;font-size:15px;line-height:1.8;">
                            <p style="margin:0;"><strong>Nome:</strong> ${safeName}</p>
                            <p style="margin:0;"><strong>E-mail:</strong> ${safeEmail}</p>
                            <p style="margin:0;"><strong>Empresa/Organização:</strong> ${safeCompany}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 12px 0;font-weight:bold;color:#0f3d2e;">
                        Mensagem:
                      </p>

                      <div style="background:#ffffff;border:1px solid #e5e0d8;border-radius:12px;padding:20px;line-height:1.7;color:#333333;white-space:pre-wrap;">
                        ${safeMessage}
                      </div>

                      <div style="margin-top:30px;text-align:center;">
                        <a href="mailto:${safeEmail}" style="display:inline-block;background:#0f3d2e;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;">
                          Responder cliente
                        </a>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#f1eee8;padding:18px 32px;text-align:center;font-size:12px;color:#777777;">
                      Este e-mail foi enviado automaticamente pelo formulário de contato do site ECO MUNDI.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    await transporter.sendMail({
      from: `"ECO MUNDI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recebemos sua mensagem | ECO MUNDI",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <body style="margin:0;padding:0;background-color:#f7f5f0;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f0;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e0d8;">
                  <tr>
                    <td style="background:#ffffff;padding:22px;text-align:center;border-bottom:4px solid #0f3d2e;">
                      <img src="https://ecomundi.com.br/logo.png" alt="ECO MUNDI" width="220" style="max-width:220px;width:220px;height:auto;display:block;margin:0 auto;" />
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:34px 32px;">
                      <h2 style="margin:0 0 15px 0;color:#0f3d2e;font-size:24px;">
                        Olá, ${safeName}!
                      </h2>

                      <p style="margin:0 0 18px 0;color:#333333;font-size:15px;line-height:1.8;">
                        Recebemos sua mensagem com sucesso.
                      </p>

                      <p style="margin:0 0 18px 0;color:#555555;font-size:15px;line-height:1.8;">
                        Agradecemos o interesse na ECO MUNDI.
                        Nossa equipe analisará sua solicitação e retornará o mais breve possível.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;border-radius:12px;padding:18px 22px;margin:24px 0;">
                        <tr>
                          <td style="color:#333333;font-size:15px;line-height:1.8;">
                            <p style="margin:0;"><strong>Nome:</strong> ${safeName}</p>
                            <p style="margin:0;"><strong>E-mail:</strong> ${safeEmail}</p>
                            <p style="margin:0;"><strong>Empresa:</strong> ${safeCompany}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 12px 0;font-weight:bold;color:#0f3d2e;">
                        Sua mensagem:
                      </p>

                      <div style="background:#ffffff;border:1px solid #e5e0d8;border-radius:12px;padding:20px;line-height:1.7;color:#333333;white-space:pre-wrap;">
                        ${safeMessage}
                      </div>

                      <div style="margin-top:30px;text-align:center;">
                        <a href="https://ecomundi.com.br" style="display:inline-block;background:#0f3d2e;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;">
                          Visitar nosso site
                        </a>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#f1eee8;padding:18px 32px;text-align:center;font-size:12px;color:#777777;">
                      Este é um e-mail automático de confirmação. Não é necessário responder esta mensagem.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return Response.json({
      success: true,
      message: "Contato salvo e e-mails enviados com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao processar contato:", error);

    return Response.json(
      {
        success: false,
        message: "Erro ao enviar mensagem.",
      },
      { status: 500 }
    );
  }
}