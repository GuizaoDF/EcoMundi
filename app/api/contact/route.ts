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
      subject: "🌿 Novo contato recebido pelo site",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body style="margin:0;padding:0;background-color:#f7f5f0;font-family:Arial,Helvetica,sans-serif;">
          
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f0;padding:40px 20px;">
            <tr>
              <td align="center">

                <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e0d8;">
                  
                  <!-- Cabeçalho -->
                  <tr>
                    <td style="background:#0f3d2e;padding:32px;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;">
                        ECO MUNDI
                      </h1>

                      <p style="margin:8px 0 0;color:#d7e8df;font-size:14px;">
                        Consultoria e Gestão Ambiental
                      </p>
                    </td>
                  </tr>

                  <!-- Conteúdo -->
                  <tr>
                    <td style="padding:32px;">

                      <h2 style="margin-top:0;color:#0f3d2e;">
                        Novo contato recebido pelo site
                      </h2>

                      <p style="color:#555555;line-height:1.6;">
                        Um visitante preencheu o formulário de contato.
                      </p>

                      <table width="100%" cellpadding="12" cellspacing="0" style="background:#f7f5f0;border-radius:12px;margin-top:20px;">
                        <tr>
                          <td>
                            <p><strong>Nome:</strong> ${name}</p>

                            <p><strong>E-mail:</strong> ${email}</p>

                            <p>
                              <strong>Empresa/Organização:</strong>
                              ${company || "Não informado"}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <div style="margin-top:25px;">
                        <p style="font-weight:bold;color:#0f3d2e;">
                          Mensagem enviada:
                        </p>

                        <div style="
                          background:#ffffff;
                          border:1px solid #e5e0d8;
                          border-radius:12px;
                          padding:20px;
                          line-height:1.8;
                          color:#333333;
                          white-space:pre-wrap;
                        ">
                          ${message}
                        </div>
                      </div>

                      <div style="margin-top:30px;text-align:center;">
                        <a
                          href="mailto:${email}"
                          style="
                            display:inline-block;
                            background:#0f3d2e;
                            color:#ffffff;
                            text-decoration:none;
                            padding:14px 24px;
                            border-radius:10px;
                            font-weight:bold;
                          "
                        >
                          Responder Cliente
                        </a>
                      </div>

                    </td>
                  </tr>

                  <!-- Rodapé -->
                  <tr>
                    <td style="
                      background:#f1eee8;
                      padding:20px;
                      text-align:center;
                      font-size:12px;
                      color:#777777;
                    ">
                      Este e-mail foi enviado automaticamente pelo formulário
                      de contato do site ECO MUNDI.
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