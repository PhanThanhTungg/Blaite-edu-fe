'use server'

import prisma from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/actions'
import { verifyTokenAndGetUserId } from '../../utils/helpers';

export async function getActivities(token: string) {
  try {
    const userId = await verifyTokenAndGetUserId(token);
    if (!userId) throw new Error('User not found')
    
    const user = await getOrCreateUser(userId)
    if (!user) throw new Error('User not found')
    
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return activities
  } catch (error) {
    console.error('Error fetching activities:', error)
    throw error
  }
}

export async function updateActivityCount(date: Date, timezone: string, token: string) {
  try {
    const userId = await verifyTokenAndGetUserId(token);
    if (!userId) throw new Error('User not found')
    
    const user = await getOrCreateUser(userId)
    if (!user) throw new Error('User not found')
    
    // Set time to midnight to ensure consistent date comparison
    const activityDate = new Date(date)
    activityDate.setHours(0, 0, 0, 0)
    
    // Upsert activity record
    const activity = await prisma.activity.upsert({
      where: {
        userId_date_timezone: {
          userId: user.id,
          date: activityDate,
          timezone,
        },
      },
      update: {
        count: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        date: activityDate,
        count: 1,
        timezone,
      },
    })

    return activity
  } catch (error) {
    console.error('Error updating activity count:', error)
    throw error
  }
} 