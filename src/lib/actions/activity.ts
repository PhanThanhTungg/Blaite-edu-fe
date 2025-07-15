'use server'

import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/actions'

export async function getActivities() {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
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

export async function getActivitiesByYear(year: number) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
    if (!user) throw new Error('User not found')
    
    const startDate = new Date(year, 0, 1) // January 1st
    const endDate = new Date(year, 11, 31) // December 31st
    
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return activities
  } catch (error) {
    console.error('Error fetching activities by year:', error)
    throw error
  }
}

export async function updateActivityCount(date: Date, timezone: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
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

export async function syncActivitiesFromAnswers() {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
    if (!user) throw new Error('User not found')
    
    // Get all answers for the user
    const answers = await prisma.answer.findMany({
      where: {
        userId: user.id,
      },
      select: {
        createdAt: true,
      },
    })

    // Group answers by date
    const activityMap = new Map<string, number>()
    
    answers.forEach((answer: { createdAt: Date }) => {
      const dateKey = answer.createdAt.toISOString().split('T')[0]
      activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1)
    })

    // Upsert activity records
    const activities = []
    for (const [dateKey, count] of activityMap) {
      const date = new Date(dateKey)
      date.setHours(0, 0, 0, 0)
      
      const activity = await prisma.activity.upsert({
        where: {
          userId_date_timezone: {
            userId: user.id,
            date: date,
            timezone: user.timezone || 'UTC',
          },
        },
        update: {
          count: count,
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          date: date,
          count: count,
          timezone: user.timezone || 'UTC',
        },
      })
      
      activities.push(activity)
    }

    return activities
  } catch (error) {
    console.error('Error syncing activities from answers:', error)
    throw error
  }
} 