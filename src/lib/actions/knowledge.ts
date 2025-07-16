"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";

export async function getKnowledges(topicId: number) {
  const topic = await prisma.topic.findFirst({
    where: {
      id: topicId,
    },
  });

  if (!topic) {
    throw new Error("Topic not found");
  }

  const knowledges = await prisma.knowledge.findMany({
    where: { topicId: topicId },
    orderBy: { createdAt: "desc" },
  });

  return knowledges;
}

export async function createKnowledge(
  topicId: number,
  content: string,
  score?: number,
  reviewAt?: Date
) {
  const topic = await prisma.topic.findFirst({
    where: {
      id: topicId,
    },
  });

  if (!topic) {
    throw new Error("Topic not found");
  }

  const knowledge = await prisma.knowledge.create({
    data: {
      content,
      topicId: topicId,
      ...(score !== undefined && { score }),
      ...(reviewAt !== undefined && { reviewAt }),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/topics/${topicId}`);

  return knowledge;
}

export async function updateKnowledge(
  knowledgeId: number,
  content: string,
  score?: number,
  reviewAt?: Date
) {
  const existingKnowledge = await prisma.knowledge.findFirst({
    where: {
      id: knowledgeId,
    },
    include: {
      topic: true,
    },
  });

  if (!existingKnowledge) {
    throw new Error("Knowledge not found");
  }

  const knowledge = await prisma.knowledge.update({
    where: { id: knowledgeId },
    data: {
      content,
      ...(score !== undefined && { score }),
      ...(reviewAt !== undefined && { reviewAt }),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/topics/${existingKnowledge.topicId}`);

  return knowledge;
}

export async function deleteKnowledge(knowledgeId: number) {
  const knowledge = await prisma.knowledge.findFirst({
    where: {
      id: knowledgeId,
    },
    include: {
      topic: true,
    },
  });

  if (!knowledge) {
    throw new Error("Knowledge not found");
  }

  await prisma.knowledge.delete({
    where: { id: knowledgeId },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/topics/${knowledge.topicId}`);
}
