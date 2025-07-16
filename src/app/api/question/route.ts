import { NextRequest, NextResponse } from "next/server";
import { verifyTokenAndGetUserId } from "@/utils/helpers";
import prisma from "@/lib/prisma";
import { generateQuestionWithGemini } from "@/lib/actions/question";
import { evaluateAnswerWithGemini } from "@/lib/actions/question";

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Lấy knowledgeId từ query
  const { searchParams } = new URL(request.url);
  const knowledgeId = searchParams.get("knowledgeId");

  const where: any = {
    knowledge: {
      topic: {
        userId: user.id,
      },
    },
  };
  if (knowledgeId) {
    where.knowledgeId = Number(knowledgeId);
  }

  const questions = await prisma.question.findMany({ where });
  return NextResponse.json(questions);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { knowledgeId, content, answer } = await request.json();

  if (!knowledgeId) {
    return NextResponse.json(
      { error: "knowledgeId is required" },
      { status: 400 }
    );
  }

  // Kiểm tra knowledge có thuộc user không
  const knowledge = await prisma.knowledge.findFirst({
    where: {
      id: knowledgeId,
      topic: { userId: user.id },
    },
    include: { topic: true },
  });
  if (!knowledge)
    return NextResponse.json(
      { error: "Knowledge not found or not allowed" },
      { status: 404 }
    );

  let finalContent = content;
  if (typeof finalContent !== "string" || !finalContent.trim()) {
    // Nếu không có content, tự động sinh câu hỏi từ knowledge.content
    try {
      const gen = await generateQuestionWithGemini({
        content: knowledge.content,
      });
      finalContent = gen.question;
    } catch (e: any) {
      return NextResponse.json(
        { error: e.message || "Failed to generate question" },
        { status: 500 }
      );
    }
    if (!finalContent) {
      return NextResponse.json(
        { error: "Could not generate question from knowledge" },
        { status: 500 }
      );
    }
  }

  const data: any = {
    topicId: knowledge.topicId,
    knowledgeId: knowledge.id,
    content: finalContent,
  };
  if (typeof answer === "string" && answer.trim()) {
    data.answer = answer;
  }

  const question = await prisma.question.create({
    data,
  });

  return NextResponse.json(question);
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { questionId, answer } = await request.json();
  if (!questionId || typeof answer !== "string" || !answer.trim()) {
    return NextResponse.json(
      { error: "questionId và answer là bắt buộc" },
      { status: 400 }
    );
  }

  // Lấy câu hỏi và kiểm tra quyền
  const question = await prisma.question.findFirst({
    where: { id: questionId, knowledge: { topic: { userId: user.id } } },
  });
  if (!question)
    return NextResponse.json(
      { error: "Question not found or not allowed" },
      { status: 404 }
    );

  // Gọi AI chấm điểm
  let score = 0;
  let aiFeedback = "";
  let aiAnswer = "";
  try {
    const result = await evaluateAnswerWithGemini(question.content, answer);
    score = result.score;
    aiFeedback = result.aiFeedback;
    aiAnswer = result.aiAnswer;
  } catch (e: any) {
    aiFeedback = e.message || "Không thể chấm điểm tự động.";
  }

  // Cập nhật lại câu hỏi với answer, score, aiFeedback
  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      answer,
      score,
      aiFeedback,
    },
  });

  // Update knowledge avgScore: (current avgScore + new score) / 2
  if (question.knowledgeId && typeof score === 'number') {
    const knowledge = await prisma.knowledge.findUnique({ where: { id: question.knowledgeId } });
    if (knowledge) {
      const currentAvg = typeof knowledge.avgScore === 'number' ? knowledge.avgScore : 0;
      const newAvg = Math.round((currentAvg + score) / 2);
      await prisma.knowledge.update({
        where: { id: question.knowledgeId },
        data: { avgScore: newAvg },
      });
    }
  }

  return NextResponse.json({ question: updated, score, aiFeedback, aiAnswer });
}
