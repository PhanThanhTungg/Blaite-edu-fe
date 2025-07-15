'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import prisma from '../prisma'

export async function getKnowledges(topicId: number) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({ 
    where: { clerkUserId: userId } 
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  // Verify topic belongs to user
  const topic = await prisma.topic.findFirst({
    where: { 
      id: topicId,
      userId: user.id 
    }
  })

  if (!topic) {
    throw new Error('Topic not found')
  }

  const knowledges = await prisma.knowledge.findMany({
    where: { topicId: topicId },
    orderBy: { createdAt: 'desc' }
  })

  return knowledges
}

export async function getKnowledge(knowledgeId: number) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({ 
    where: { clerkUserId: userId } 
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  const knowledge = await prisma.knowledge.findFirst({
    where: { 
      id: knowledgeId,
      topic: {
        userId: user.id
      }
    },
    include: {
      topic: true
    }
  })

  if (!knowledge) {
    throw new Error('Knowledge not found')
  }

  return knowledge
}

export async function createKnowledge(topicId: number, content: string, score?: number, reviewAt?: Date) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({ 
    where: { clerkUserId: userId } 
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  // Verify topic belongs to user
  const topic = await prisma.topic.findFirst({
    where: { 
      id: topicId,
      userId: user.id 
    }
  })

  if (!topic) {
    throw new Error('Topic not found')
  }

  const knowledge = await prisma.knowledge.create({
    data: {
      content,
      topicId: topicId,
      ...(score !== undefined && { score }),
      ...(reviewAt !== undefined && { reviewAt }),
    },
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/topics/${topicId}`)
  
  return knowledge
}

export async function updateKnowledge(knowledgeId: number, content: string, score?: number, reviewAt?: Date) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({ 
    where: { clerkUserId: userId } 
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  // Get knowledge and verify ownership through topic
  const existingKnowledge = await prisma.knowledge.findFirst({
    where: { 
      id: knowledgeId,
      topic: {
        userId: user.id
      }
    },
    include: {
      topic: true
    }
  })

  if (!existingKnowledge) {
    throw new Error('Knowledge not found')
  }

  const knowledge = await prisma.knowledge.update({
    where: { id: knowledgeId },
    data: {
      content,
      ...(score !== undefined && { score }),
      ...(reviewAt !== undefined && { reviewAt }),
    },
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/topics/${existingKnowledge.topicId}`)
  
  return knowledge
}

export async function deleteKnowledge(knowledgeId: number) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({ 
    where: { clerkUserId: userId } 
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  // Get knowledge and verify ownership through topic
  const knowledge = await prisma.knowledge.findFirst({
    where: { 
      id: knowledgeId,
      topic: {
        userId: user.id
      }
    },
    include: {
      topic: true
    }
  })

  if (!knowledge) {
    throw new Error('Knowledge not found')
  }

  await prisma.knowledge.delete({
    where: { id: knowledgeId }
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/topics/${knowledge.topicId}`)
} 