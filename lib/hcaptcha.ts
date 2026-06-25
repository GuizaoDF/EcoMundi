export async function verifyHcaptcha(token: string): Promise<boolean> {
  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      response: token,
      secret: process.env.HCAPTCHA_SECRET_KEY!,
    }),
  });
  const data = await res.json();
  return data.success === true;
}
