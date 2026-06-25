import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`
  );
  return response;
}
