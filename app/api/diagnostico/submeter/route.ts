import nodemailer from "nodemailer";
import db from "@/lib/db";
import { isValidFormat, isValidMx } from "@/lib/email-validator";
import { verifyHcaptcha } from "@/lib/hcaptcha";
import {
  calcularClassificacao,
  classificacaoCores,
  classificacaoBarCor,
  classificacaoAnalise,
  getAnaliseCategoria,
  type Classificacao,
} from "@/lib/diagnostico-email-copy";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendDiagnosticoEmails(params: {
  resultadoId: number;
  nome: string;
  email: string;
  razaoSocial: string;
  cnpj: string;
  pontuacaoTotal: number;
  pontuacaoMaxima: number;
  percentual: number;
  classificacao: Classificacao;
  categorias: { nome: string; pontuacao: number; pontuacaoMax: number; percentual: number }[];
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const siteUrl = process.env.SITE_URL || "https://ecomundi.com.br";
    const cores = classificacaoCores[params.classificacao];
    const barCor = classificacaoBarCor[params.classificacao];
    const analiseGlobal = classificacaoAnalise[params.classificacao];
    const safeNome = escapeHtml(params.nome);
    const safeEmpresa = escapeHtml(params.razaoSocial || "Não informado");
    const safeCnpj = escapeHtml(params.cnpj || "Não informado");

    const categoriasHtml = params.categorias
      .map((cat) => {
        const catCor = classificacaoBarCor[calcularClassificacao(cat.percentual)];
        const analise = getAnaliseCategoria(cat.nome, params.classificacao);
        return `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #e5e0d8;">
              <p style="margin:0 0 6px 0;font-weight:bold;color:#0f3d2e;font-size:14px;">${escapeHtml(cat.nome)}</p>
              <div style="background:#e5e0d8;border-radius:4px;height:8px;margin-bottom:6px;">
                <div style="background:${catCor};width:${cat.percentual.toFixed(0)}%;height:8px;border-radius:4px;"></div>
              </div>
              <p style="margin:0;font-size:12px;color:#555555;">${cat.percentual.toFixed(0)}% — ${escapeHtml(analise)}</p>
            </td>
          </tr>
        `;
      })
      .join("");

    const clienteHtml = `
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
                  <h2 style="margin:0 0 10px 0;color:#0f3d2e;font-size:22px;">Olá, ${safeNome}!</h2>
                  <p style="margin:0 0 24px 0;color:#555555;font-size:15px;line-height:1.6;">Seu Diagnóstico Preliminar de Conformidade Regulatória e Sustentabilidade Corporativa foi concluído.</p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background:${cores.bg};border:2px solid ${cores.border};border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
                    <tr>
                      <td>
                        <p style="margin:0 0 4px 0;font-size:13px;color:${cores.text};font-weight:bold;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(params.classificacao)}</p>
                        <p style="margin:0 0 4px 0;font-size:48px;font-weight:bold;color:${cores.text};">${params.percentual.toFixed(0)}%</p>
                        <p style="margin:0;font-size:14px;color:${cores.text};">${params.pontuacaoTotal} de ${params.pontuacaoMaxima} pontos possíveis</p>
                        <div style="background:rgba(0,0,0,0.1);border-radius:4px;height:8px;margin:12px auto 0;max-width:300px;">
                          <div style="background:${barCor};width:${params.percentual.toFixed(0)}%;height:8px;border-radius:4px;"></div>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 8px 0;color:#0f3d2e;font-weight:bold;font-size:15px;">Análise Geral</p>
                  <p style="margin:0 0 24px 0;color:#333333;font-size:14px;line-height:1.7;">${escapeHtml(analiseGlobal.trim())}</p>

                  <p style="margin:0 0 12px 0;color:#0f3d2e;font-weight:bold;font-size:15px;">Resultado por Categoria</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${categoriasHtml}
                  </table>

                  <div style="margin-top:30px;text-align:center;">
                    <a href="${siteUrl}/#contato" style="display:inline-block;background:#0f3d2e;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;">
                      Falar com um especialista
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background:#f1eee8;padding:18px 32px;text-align:center;font-size:12px;color:#777777;">
                  Este e-mail foi gerado automaticamente pelo sistema de diagnóstico da ECO MUNDI. Não é necessário responder.
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    const adminHtml = `
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
                  <h2 style="margin:0 0 10px 0;color:#0f3d2e;font-size:22px;">Novo diagnóstico recebido</h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;border-radius:12px;padding:18px 22px;margin-bottom:16px;">
                    <tr><td style="color:#333333;font-size:15px;line-height:2;">
                      <p style="margin:0;"><strong>Nome:</strong> ${safeNome}</p>
                      <p style="margin:0;"><strong>E-mail:</strong> ${escapeHtml(params.email)}</p>
                      <p style="margin:0;"><strong>Empresa:</strong> ${safeEmpresa}</p>
                      <p style="margin:0;"><strong>CNPJ:</strong> ${safeCnpj}</p>
                      <p style="margin:0;"><strong>Resultado:</strong> ${escapeHtml(params.classificacao)} — ${params.percentual.toFixed(0)}% (${params.pontuacaoTotal}/${params.pontuacaoMaxima} pts)</p>
                    </td></tr>
                  </table>
                  <div style="text-align:center;">
                    <a href="${siteUrl}/admin/diagnostico/resultados/${params.resultadoId}" style="display:inline-block;background:#0f3d2e;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;">
                      Ver resultado no painel
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background:#f1eee8;padding:18px 32px;text-align:center;font-size:12px;color:#777777;">
                  Diagnóstico recebido automaticamente pelo site ECO MUNDI.
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await Promise.all([
      transporter.sendMail({
        from: `"ECO MUNDI" <${process.env.EMAIL_USER}>`,
        to: params.email,
        subject: `Seu Diagnóstico de Conformidade Regulatória | ECO MUNDI`,
        html: clienteHtml,
      }),
      transporter.sendMail({
        from: `"Site ECO MUNDI" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        subject: `Novo diagnóstico — ${params.nome} (${params.razaoSocial || "sem empresa"}) | ${params.classificacao} ${params.percentual.toFixed(0)}%`,
        html: adminHtml,
      }),
    ]);

    await db.execute(
      "UPDATE diagnostico_resultados SET email_enviado = 1 WHERE id = ?",
      [params.resultadoId]
    );
  } catch (error) {
    console.error("Erro ao enviar e-mails do diagnóstico:", error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      formulario_id,
      nome,
      email,
      telefone,
      razao_social,
      cnpj,
      dados_perfil,
      hcaptchaToken,
      respostas,
      convite_token,
    } = body;

    if (!hcaptchaToken || !(await verifyHcaptcha(hcaptchaToken))) {
      return Response.json(
        { success: false, message: "Verificação de segurança inválida." },
        { status: 400 }
      );
    }

    if (!nome || !email || !razao_social || !cnpj) {
      return Response.json(
        { success: false, message: "Nome, e-mail, razão social e CNPJ são obrigatórios." },
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

    if (!formulario_id || !Array.isArray(respostas) || respostas.length === 0) {
      return Response.json(
        { success: false, message: "Dados do formulário inválidos." },
        { status: 400 }
      );
    }

    // Validate formulario (via convite or active check)
    let conviteId: number | null = null;
    if (convite_token) {
      const [convites] = await db.execute(
        "SELECT id, formulario_id, status FROM diagnostico_convites WHERE token = ?",
        [convite_token]
      ) as any[];
      if (!convites.length || convites[0].status !== "pendente") {
        return Response.json(
          { success: false, message: "Convite inválido ou já utilizado." },
          { status: 400 }
        );
      }
      if (Number(convites[0].formulario_id) !== Number(formulario_id)) {
        return Response.json(
          { success: false, message: "Convite não corresponde a este formulário." },
          { status: 400 }
        );
      }
      conviteId = convites[0].id;
      const [forms] = await db.execute(
        "SELECT id FROM diagnostico_formularios WHERE id = ?",
        [formulario_id]
      ) as any[];
      if (!forms.length) {
        return Response.json(
          { success: false, message: "Formulário não encontrado." },
          { status: 400 }
        );
      }
    } else {
      const [forms] = await db.execute(
        "SELECT id FROM diagnostico_formularios WHERE id = ? AND ativo = 1",
        [formulario_id]
      ) as any[];
      if (!forms.length) {
        return Response.json(
          { success: false, message: "Formulário não encontrado ou inativo." },
          { status: 400 }
        );
      }
    }

    // Check for duplicate submission by email or CNPJ
    const [dup] = await db.execute(
      `SELECT id FROM diagnostico_resultados
       WHERE formulario_id = ? AND desbloqueado = 0
         AND (email = ? OR (cnpj IS NOT NULL AND cnpj != '' AND cnpj = ?))
       LIMIT 1`,
      [formulario_id, email, cnpj || ""]
    ) as any[];
    if ((dup as any[]).length > 0) {
      return Response.json(
        { success: false, message: "Já existe um diagnóstico concluído para este e-mail ou CNPJ. Entre em contato para solicitar uma nova avaliação." },
        { status: 409 }
      );
    }

    // Load all active questions + alternatives for this formulario
    const [activeData] = await db.execute(
      `SELECT
         p.id AS pergunta_id,
         p.categoria_id,
         c.nome AS categoria_nome,
         a.id AS alternativa_id,
         a.pontuacao
       FROM diagnostico_perguntas p
       JOIN diagnostico_categorias c ON c.id = p.categoria_id
       JOIN diagnostico_alternativas a ON a.pergunta_id = p.id
       WHERE c.formulario_id = ? AND p.ativo = 1 AND c.ativo = 1
       ORDER BY c.ordem ASC, p.ordem ASC`,
      [formulario_id]
    ) as any[];

    // Build lookup maps
    const perguntaMap: Record<number, { categoria_id: number; categoria_nome: string }> = {};
    const alternativaMap: Record<number, { pergunta_id: number; pontuacao: number }> = {};
    const perguntasPerCategoria: Record<number, { nome: string; perguntaIds: Set<number> }> = {};

    for (const row of activeData) {
      if (!perguntaMap[row.pergunta_id]) {
        perguntaMap[row.pergunta_id] = {
          categoria_id: row.categoria_id,
          categoria_nome: row.categoria_nome,
        };
      }
      alternativaMap[row.alternativa_id] = {
        pergunta_id: row.pergunta_id,
        pontuacao: row.pontuacao,
      };
      if (!perguntasPerCategoria[row.categoria_id]) {
        perguntasPerCategoria[row.categoria_id] = {
          nome: row.categoria_nome,
          perguntaIds: new Set(),
        };
      }
      perguntasPerCategoria[row.categoria_id].perguntaIds.add(row.pergunta_id);
    }

    // Validate submitted respostas
    for (const r of respostas) {
      if (!perguntaMap[r.pergunta_id]) {
        return Response.json(
          { success: false, message: `Pergunta inválida: ${r.pergunta_id}.` },
          { status: 400 }
        );
      }
      const alt = alternativaMap[r.alternativa_id];
      if (!alt || alt.pergunta_id !== r.pergunta_id) {
        return Response.json(
          { success: false, message: `Alternativa inválida para pergunta ${r.pergunta_id}.` },
          { status: 400 }
        );
      }
    }

    // Calculate scores
    const totalPerguntas = Object.keys(perguntaMap).length;
    const pontuacaoMaxima = totalPerguntas * 4;
    let pontuacaoTotal = 0;

    const scoresPorCategoria: Record<
      number,
      { nome: string; pontuacao: number; pontuacaoMax: number }
    > = {};

    for (const [catId, cat] of Object.entries(perguntasPerCategoria)) {
      scoresPorCategoria[Number(catId)] = {
        nome: cat.nome,
        pontuacao: 0,
        pontuacaoMax: cat.perguntaIds.size * 4,
      };
    }

    const respostasComPontuacao: { pergunta_id: number; alternativa_id: number; pontuacao: number }[] = [];

    for (const r of respostas) {
      const pontuacao = alternativaMap[r.alternativa_id].pontuacao;
      pontuacaoTotal += pontuacao;
      respostasComPontuacao.push({ ...r, pontuacao });

      const catId = perguntaMap[r.pergunta_id].categoria_id;
      scoresPorCategoria[catId].pontuacao += pontuacao;
    }

    const percentual = pontuacaoMaxima > 0
      ? parseFloat(((pontuacaoTotal / pontuacaoMaxima) * 100).toFixed(2))
      : 0;
    const classificacao = calcularClassificacao(percentual);

    // DB transaction
    const conn = await (db as any).getConnection();
    let resultadoId: number;
    try {
      await conn.beginTransaction();

      const [inserted] = await conn.execute(
        `INSERT INTO diagnostico_resultados
           (formulario_id, nome, email, telefone, razao_social, cnpj, dados_perfil,
            pontuacao_total, pontuacao_maxima, percentual, classificacao)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          formulario_id, nome, email, telefone || null,
          razao_social || null, cnpj || null,
          dados_perfil ? JSON.stringify(dados_perfil) : null,
          pontuacaoTotal, pontuacaoMaxima, percentual, classificacao,
        ]
      );
      resultadoId = (inserted as any).insertId;

      if (respostasComPontuacao.length > 0) {
        const respostasPlaceholders = respostasComPontuacao.map(() => "(?, ?, ?, ?)").join(",");
        const respostasValues = respostasComPontuacao.flatMap((r) => [
          resultadoId, r.pergunta_id, r.alternativa_id, r.pontuacao,
        ]);
        await conn.execute(
          `INSERT INTO diagnostico_respostas (resultado_id, pergunta_id, alternativa_id, pontuacao) VALUES ${respostasPlaceholders}`,
          respostasValues
        );
      }

      const scoresEntries = Object.entries(scoresPorCategoria);
      if (scoresEntries.length > 0) {
        const scoresPlaceholders = scoresEntries.map(() => "(?, ?, ?, ?, ?)").join(",");
        const scoresValues = scoresEntries.flatMap(([catId, s]) => [
          resultadoId,
          Number(catId),
          s.pontuacao,
          s.pontuacaoMax,
          s.pontuacaoMax > 0
            ? parseFloat(((s.pontuacao / s.pontuacaoMax) * 100).toFixed(2))
            : 0,
        ]);
        await conn.execute(
          `INSERT INTO diagnostico_scores_categoria (resultado_id, categoria_id, pontuacao, pontuacao_max, percentual) VALUES ${scoresPlaceholders}`,
          scoresValues
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const categoriasResult = Object.entries(scoresPorCategoria).map(([, s]) => ({
      nome: s.nome,
      pontuacao: s.pontuacao,
      pontuacaoMax: s.pontuacaoMax,
      percentual:
        s.pontuacaoMax > 0
          ? parseFloat(((s.pontuacao / s.pontuacaoMax) * 100).toFixed(2))
          : 0,
    }));

    // Mark convite as completed (fire and forget)
    if (conviteId) {
      Promise.resolve().then(() =>
        db.execute(
          "UPDATE diagnostico_convites SET status = 'concluido', resultado_id = ?, concluido_em = NOW() WHERE id = ?",
          [resultadoId, conviteId]
        ).catch((err) => console.error("Erro ao concluir convite:", err))
      );
    }

    // Send emails async — do not await
    Promise.resolve().then(() =>
      sendDiagnosticoEmails({
        resultadoId,
        nome,
        email,
        razaoSocial: razao_social,
        cnpj,
        pontuacaoTotal,
        pontuacaoMaxima,
        percentual,
        classificacao,
        categorias: categoriasResult,
      })
    );

    return Response.json({
      success: true,
      data: {
        resultado_id: resultadoId,
        pontuacao_total: pontuacaoTotal,
        pontuacao_maxima: pontuacaoMaxima,
        percentual,
        classificacao,
        categorias: categoriasResult,
      },
    });
  } catch (error) {
    console.error("Erro ao processar diagnóstico:", error);
    return Response.json(
      { success: false, message: "Erro ao processar diagnóstico." },
      { status: 500 }
    );
  }
}
