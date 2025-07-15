'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import prisma from '../prisma'

export async function getTopics() {
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

  const topics = await prisma.topic.findMany({
    where: { userId: user.id },
    include: {
      knowledges: {
        include: {
          questions: true,
          _count: {
            select: {
              questions: true
            }
          }
        }
      },
      _count: {
        select: {
          knowledges: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return topics
}

export async function getTopic(topicId: number) {
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

  const topic = await prisma.topic.findFirst({
    where: { 
      id: topicId,
      userId: user.id 
    }
  })

  if (!topic) {
    throw new Error('Topic not found')
  }

  return topic
}

export async function getTopicKnowledges(topicId: number) {
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

export async function createTopic(name: string, description?: string) {
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

  const topic = await prisma.topic.create({
    data: {
      name,
      userId: user.id,
      ...(description !== undefined && { description }),
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/topics')
  
  return topic
}

export async function updateTopic(topicId: number, name: string) {
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

  // Kiểm tra topic thuộc về user
  const existingTopic = await prisma.topic.findFirst({
    where: { 
      id: topicId,
      userId: user.id 
    }
  })

  if (!existingTopic) {
    throw new Error('Topic not found')
  }

  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: {
      name,
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/topics')
  
  return topic
}

export async function deleteTopic(topicId: number) {
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

  // Kiểm tra topic thuộc về user
  const topic = await prisma.topic.findFirst({
    where: { 
      id: topicId,
      userId: user.id 
    }
  })

  if (!topic) {
    throw new Error('Topic not found')
  }

  await prisma.topic.delete({
    where: { id: topicId }
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/topics')
} 