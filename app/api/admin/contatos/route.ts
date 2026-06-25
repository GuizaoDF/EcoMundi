import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT
        id,
        nome,
        email,
        empresa,
        mensagem,
        lido,
        criado_em
      FROM contatos
      ORDER BY criado_em DESC
    `);

    return Response.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    console.error("Erro ao buscar contatos:", error);

    return Response.json(
      {
        success: false,
        message: "Erro ao buscar contatos.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}