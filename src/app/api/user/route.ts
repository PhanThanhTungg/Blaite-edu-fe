import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenAndGetUserId, findOrCreateUser } from '@/utils/helpers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  return NextResponse.json(user);
} 