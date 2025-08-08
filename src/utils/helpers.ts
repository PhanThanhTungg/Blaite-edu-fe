import jwt from "jsonwebtoken";


/**
 * Xác thực token Clerk bằng jsonwebtoken và trả về userId nếu hợp lệ, ngược lại trả về null.
 */
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

// Color utility functions
export const getScoreColor = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "success";
    case "Intermediate":
      return "processing";
    case "Advanced":
      return "error";
    default:
      return "default";
  }
};
