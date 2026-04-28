/**
 * Central place for the NextAuth signing secret so Middleware (Edge) and Route Handlers
 * resolve the same env keys. Auth.js reads AUTH_SECRET; NextAuth v4/v5 also accept NEXTAUTH_SECRET.
 */
export function resolveAuthSecret(): string {
  const raw =
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "";
  return raw.replace(/\r$/, "");
}
