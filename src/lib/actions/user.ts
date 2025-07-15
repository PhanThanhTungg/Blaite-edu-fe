'use server'

import prisma from '../prisma'
import { verifyTokenAndGetUserId } from '../../utils/helpers';

export async function getOrCreateUser(token: string, timezone?: string | null) {
  try {
    const userId = await verifyTokenAndGetUserId(token);
    if (!userId) throw new Error('User not found');
    // Tìm user hiện tại
    let user = await prisma.user.findUnique({ 
      where: { clerkUserId: userId } 
    })
    
    if (!user) {
      if (!timezone || typeof timezone !== 'string') throw new Error('Missing timezone');
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

