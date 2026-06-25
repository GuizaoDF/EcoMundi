import db from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [rows]: any = await db.execute(
    `SELECT imagem FROM noticias WHERE slug = ? AND publicado = 1 AND imagem IS NOT NULL AND imagem != ''`,
    [slug]
  );

  if (rows.length === 0 || !rows[0].imagem) {
    return new Response(null, { status: 404 });
  }

  const dataUrl: string = rows[0].imagem;
  const commaIdx = dataUrl.indexOf(",");
  const meta = dataUrl.substring(5, dataUrl.indexOf(";"));
  const base64 = dataUrl.substring(commaIdx + 1);
  const buffer = Buffer.from(base64, "base64");

  return new Response(buffer, {
    headers: {
      "Content-Type": meta,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
