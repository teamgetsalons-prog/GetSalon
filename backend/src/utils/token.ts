import crypto from "crypto";

/**
 * Generates a secure, single-use token pair for flows like password reset:
 * the raw `token` goes in the email link (never stored), while `tokenHash`
 * is what gets saved to the database - so a database leak alone can never
 * be used to reset an account.
 */
export function generateResetToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
