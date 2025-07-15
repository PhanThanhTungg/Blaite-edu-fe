'use server'

import { auth } from '@clerk/nextjs/server'
import prisma from '../prisma'

export async function getOrCreateUser(timezone: string) {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized - No user ID found')
    }

    // Tìm user hiện tại
    let user = await prisma.user.findUnique({ 
      where: { clerkUserId: userId } 
    })
    
    if (!user) {
      if (!timezone) throw new Error('Missing timezone');
      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          timezone,
        },
      })
    }

    return user
  } catch (error) {
    console.error('Error in getOrCreateUser:', error)
    throw error
  }
}

export async function updateUserProfile(name?: string, email?: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name

    const user = await prisma.user.update({
      where: { clerkUserId: userId },
      data: updateData
    })

    return user
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export async function getUserProfile() {
  try {
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

    return user
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw error
  }
}

export async function updateTimezone(timezone: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  if (!timezone) throw new Error('Missing timezone');
  const user = await prisma.user.update({
    where: { clerkUserId: userId },
    data: { timezone },
  });
  return user;
}

