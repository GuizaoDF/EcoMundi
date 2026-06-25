import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ success: false }, { status: 401 });
  }

  return Response.json({ success: true, usuario: session });
}
