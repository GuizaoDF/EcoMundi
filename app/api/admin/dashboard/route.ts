import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ success: false }, { status: 401 });

  const [[statsContatos], [statsNewsletter], [statsNoticias], [statsUsuarios], [contatosRecentes], [noticiasRecentes]] =
    await Promise.all([
      db.execute(`
        SELECT
          COUNT(*) AS total,
          SUM(lido = 0) AS nao_lidos
        FROM contatos
      `),
      db.execute(`
        SELECT
          COUNT(*) AS total,
          SUM(ativo = 1) AS ativos
        FROM newsletter
      `),
      db.execute(`
        SELECT
          COUNT(*) AS total,
          SUM(publicado = 1) AS publicadas,
          SUM(publicado = 0) AS rascunhos
        FROM noticias
      `),
      db.execute(`
        SELECT
          COUNT(*) AS total,
          SUM(ativo = 1) AS ativos
        FROM usuarios
      `),
      db.execute(`
        SELECT id, nome, empresa, email, lido, criado_em
        FROM contatos
        ORDER BY criado_em DESC
        LIMIT 6
      `),
      db.execute(`
        SELECT id, titulo, slug, publicado, criado_em
        FROM noticias
        ORDER BY criado_em DESC
        LIMIT 6
      `),
    ]);

  return Response.json({
    success: true,
    stats: {
      contatos: (statsContatos as any[])[0],
      newsletter: (statsNewsletter as any[])[0],
      noticias: (statsNoticias as any[])[0],
      usuarios: (statsUsuarios as any[])[0],
    },
    contatos_recentes: contatosRecentes,
    noticias_recentes: noticiasRecentes,
  });
}
