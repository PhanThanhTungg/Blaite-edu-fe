import jwt from "jsonwebtoken";

export async function verifyTokenAndGetUserId(
  token: string
): Promise<string | null> {
  try {
    if (!token) return null;
    const publicKey = process.env.CLERK_JWT_KEY!;
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as any;
    return payload.sub || null;
  } catch (e) {
    console.log(e);
    return null;
  }
}