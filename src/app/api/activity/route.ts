import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenAndGetUserId } from '@/utils/helpers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Lấy user nội bộ
  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const activities = await prisma.activity.findMany({ where: { userId: user.id } });
  return NextResponse.json(activities);
} 