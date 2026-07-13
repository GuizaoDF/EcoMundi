import { NextRequest } from "next/server";
import db from "@/lib/db";
import { isValidFormat, isValidMx } from "@/lib/email-validator";
import { verifyHcaptcha } from "@/lib/hcaptcha";

export async function POST(req: NextRequest) {
  try {
    const { ebook_id, nome, email, inscrito_newsletter, hcaptchaToken } = await req.json();

    if (!hcaptchaToken || !(await verifyHcaptcha(hcaptchaToken))) {
      return Response.json(
        { success: false, message: "Verificação de segurança inválida." },
        { status: 400 }
      );
    }

    if (!nome?.trim()) {
      return Response.json({ success: false, message: "Nome é obrigatório." }, { status: 400 });
    }

    if (!email || !isValidFormat(email)) {
      return Response.json({ success: false, message: "E-mail inválido." }, { status: 400 });
    }

    if (!(await isValidMx(email))) {
      return Response.json(
        { success: false, message: "O domínio deste e-mail não existe ou não aceita mensagens." },
        { status: 400 }
      );
    }

    const [ebooks]: any = await db.execute(
      "SELECT id FROM ebooks WHERE id = ? AND ativo = 1",
      [ebook_id]
    );
    if (!(ebooks as any[])[0]) {
      return Response.json({ success: false, message: "E-book não encontrado." }, { status: 404 });
    }

    await db.execute(
      "INSERT INTO ebook_downloads (ebook_id, nome, email, inscrito_newsletter) VALUES (?, ?, ?, ?)",
      [ebook_id, nome.trim(), email.trim().toLowerCase(), inscrito_newsletter ? 1 : 0]
    );

    if (inscrito_newsletter) {
      const [existing]: any = await db.execute(
        "SELECT id, ativo FROM newsletter WHERE email = ?",
        [email.trim().toLowerCase()]
      );
      const row = (existing as any[])[0];
      if (!row) {
        await db.execute("INSERT INTO newsletter (email) VALUES (?)", [email.trim().toLowerCase()]);
      } else if (row.ativo === 0) {
        await db.execute("UPDATE newsletter SET ativo = 1 WHERE email = ?", [email.trim().toLowerCase()]);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erro ao registrar download:", error);
    return Response.json({ success: false, message: "Erro ao processar solicitação." }, { status: 500 });
  }
}
