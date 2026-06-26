import { SignJWT, jwtVerify } from "jose";

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);
const PURPOSE = "newsletter-unsubscribe" as const;

export async function generateUnsubscribeToken(email: string): Promise<string> {
  return new SignJWT({ email, purpose: PURPOSE })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("365d")
    .sign(secret());
}

export async function verifyUnsubscribeToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== PURPOSE) return null;
    if (typeof payload.email !== "string") return null;
    return payload.email;
  } catch {
    return null;
  }
}
