import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import db from "@/lib/db";
import { isValidFormat, isValidMx } from "@/lib/email-validator";

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT
        id,
        email,
        criado_em AS createdAt
      FROM newsletter
      ORDER BY criado_em DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Erro ao listar newsletter:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao listar newsletter.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !isValidFormat(email)) {
      return NextResponse.json(
        { success: false, message: "Endereço de e-mail inválido." },
        { status: 400 }
      );
    }

    const mxValido = await isValidMx(email);
    if (!mxValido) {
      return NextResponse.json(
        { success: false, message: "O domínio deste e-mail não existe ou não aceita mensagens." },
        { status: 400 }
      );
    }

    await db.execute(
      `
        INSERT INTO newsletter (email)
        VALUES (?)
      `,
      [email]
    );

    try {
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
        from: `"ECO MUNDI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Bem-vindo(a) à newsletter da ECO MUNDI",
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <body style="margin:0;padding:0;background-color:#f7f5f0;font-family:Arial,Helvetica,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f0;padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e0d8;">
                    <tr>
                      <td style="background:#ffffff;padding:22px;text-align:center;border-bottom:4px solid #0f3d2e;">
                        <img src="https://ecomundi.com.br/logo.png" alt="ECO MUNDI" width="200" style="max-width:200px;width:200px;height:auto;display:block;margin:0 auto;" />
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:36px 36px 28px 36px;">
                        <h2 style="margin:0 0 12px 0;color:#0f3d2e;font-size:24px;font-weight:bold;">
                          Inscrição confirmada!
                        </h2>

                        <p style="margin:0 0 20px 0;color:#333333;font-size:15px;line-height:1.8;">
                          Obrigado por se inscrever na newsletter da <strong>ECO MUNDI</strong>.
                          A partir de agora você receberá em primeira mão nossos conteúdos sobre:
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                          <tr>
                            <td style="color:#333333;font-size:15px;line-height:2;">
                              <p style="margin:0;">🌿 &nbsp;Direito ambiental</p>
                              <p style="margin:0;">📊 &nbsp;Sustentabilidade e ESG</p>
                              <p style="margin:0;">💼 &nbsp;Oportunidades de negócios sustentáveis</p>
                              <p style="margin:0;">⚖️ &nbsp;Regulação e licenciamento ambiental</p>
                            </td>
                          </tr>
                        </table>

                        <div style="text-align:center;">
                          <a href="https://ecomundi.com.br" style="display:inline-block;background:#0f3d2e;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:15px;">
                            Visitar o site
                          </a>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style="background:#f1eee8;padding:18px 36px;text-align:center;font-size:12px;color:#888888;line-height:1.6;">
                        Você recebeu este e-mail porque se inscreveu na newsletter da ECO MUNDI.<br/>
                        Caso não queira mais receber nossos conteúdos, entre em contato pelo site.
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
    } catch (emailErr) {
      console.error("Erro ao enviar e-mail de boas-vindas:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Inscrição realizada com sucesso!",
    });
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    console.error("Erro ao cadastrar newsletter:", error);

    return NextResponse.json(
      { success: false, message: "Erro ao cadastrar newsletter." },
      { status: 500 }
    );
  }
}