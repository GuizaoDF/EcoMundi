import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, company, message } = await req.json();

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
        <head>
          <meta charset="utf-8" />
        </head>

        <body style="margin:0;padding:0;background-color:#f7f5f0;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f0;padding:40px 20px;">
            <tr>
              <td align="center">

                <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e0d8;">
                  
                  <tr>
                    <td style="background:#ffffff;padding:32px;text-align:center;border-bottom:4px solid #0f3d2e;">
                      <img
                        src="https://ecomundi.com.br/logo.png"
                        alt="ECO MUNDI"
                        style="max-width:420px;width:100%;height:auto;display:block;margin:0 auto;"
                      />
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
                            <p style="margin:0;"><strong>Nome:</strong> ${name}</p>
                            <p style="margin:0;"><strong>E-mail:</strong> ${email}</p>
                            <p style="margin:0;"><strong>Empresa/Organização:</strong> ${company || "Não informado"}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 12px 0;font-weight:bold;color:#0f3d2e;">
                        Mensagem:
                      </p>

                      <div style="background:#ffffff;border:1px solid #e5e0d8;border-radius:12px;padding:20px;line-height:1.7;color:#333333;white-space:pre-wrap;">
                        ${message}
                      </div>

                      <div style="margin-top:30px;text-align:center;">
                        <a
                          href="mailto:${email}"
                          style="display:inline-block;background:#0f3d2e;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;"
                        >
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

    return Response.json({
      success: true,
      message: "E-mail enviado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);

    return Response.json(
      {
        success: false,
        message: "Erro ao enviar e-mail.",
      },
      {
        status: 500,
      }
    );
  }
}