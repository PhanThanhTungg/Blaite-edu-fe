import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

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

/**
 * Tìm user theo clerkUserId, nếu không thấy thì tạo mới.
 */
export async function findOrCreateUser(clerkUserId: string, timezone: string) {
  let user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkUserId, timezone },
    });
  }
  return user;
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
