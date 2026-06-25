import { promises as dns } from "dns";

export function isValidFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export async function isValidMx(email: string): Promise<boolean> {
  try {
    const domain = email.trim().split("@")[1];
    if (!domain) return false;
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}
