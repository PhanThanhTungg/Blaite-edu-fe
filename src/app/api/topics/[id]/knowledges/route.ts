import { NextRequest, NextResponse } from "next/server";
import { verifyTokenAndGetUserId, findOrCreateUser } from "@/utils/helpers";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const timezone = request.headers.get("x-timezone") || "UTC";
  const user = await findOrCreateUser(userId, timezone);

  // Lấy tất cả knowledge thuộc topic này của user
  const knowledges = await prisma.knowledge.findMany({
    where: {
      topicId: Number(params.id),
      topic: { userId: user.id },
    },
  });
  return NextResponse.json(knowledges);
}
