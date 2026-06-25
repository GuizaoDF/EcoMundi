import db from "@/lib/db";

//
// Buscar um contato pelo ID
//
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows]: any = await db.execute(
      `
      SELECT
        id,
        nome,
        email,
        empresa,
        mensagem,
        lido,
        criado_em
      FROM contatos
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Contato não encontrado.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar contato:", error);

    return Response.json(
      {
        success: false,
        message: "Erro ao buscar contato.",
      },
      { status: 500 }
    );
  }
}

//
// Atualizar status lido do contato (aceita { lido: 0|1 } no body, padrão 1)
//
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let lido = 1;
    try {
      const body = await request.json();
      if (body.lido !== undefined) lido = body.lido ? 1 : 0;
    } catch {}

    await db.execute(`UPDATE contatos SET lido = ? WHERE id = ?`, [lido, id]);

    return Response.json({ success: true, message: "Contato atualizado." });
  } catch (error) {
    console.error("Erro ao atualizar contato:", error);

    return Response.json(
      { success: false, message: "Erro ao atualizar contato." },
      { status: 500 }
    );
  }
}

//
// Excluir contato (já vamos deixar pronto)
//
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.execute(
      `
      DELETE FROM contatos
      WHERE id = ?
      `,
      [id]
    );

    return Response.json({
      success: true,
      message: "Contato excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir contato:", error);

    return Response.json(
      {
        success: false,
        message: "Erro ao excluir contato.",
      },
      { status: 500 }
    );
  }
}