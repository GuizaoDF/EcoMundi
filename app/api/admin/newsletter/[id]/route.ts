import db from "@/lib/db";

//
// Alternar status ativo do inscrito ({ ativo: 0|1 } no body)
//
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const ativo = body.ativo ? 1 : 0;

    await db.execute(`UPDATE newsletter SET ativo = ? WHERE id = ?`, [ativo, id]);

    return Response.json({ success: true, message: "Status atualizado." });
  } catch (error) {
    console.error("Erro ao atualizar inscrito:", error);
    return Response.json(
      { success: false, message: "Erro ao atualizar inscrito." },
      { status: 500 }
    );
  }
}

//
// Excluir inscrito
//
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.execute(`DELETE FROM newsletter WHERE id = ?`, [id]);

    return Response.json({ success: true, message: "Inscrito removido." });
  } catch (error) {
    console.error("Erro ao excluir inscrito:", error);
    return Response.json(
      { success: false, message: "Erro ao excluir inscrito." },
      { status: 500 }
    );
  }
}
