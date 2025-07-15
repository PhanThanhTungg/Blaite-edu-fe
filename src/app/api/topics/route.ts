import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenAndGetUserId, findOrCreateUser } from '@/utils/helpers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  const topics = await prisma.topic.findMany({ where: { userId: user.id } });
  return NextResponse.json(topics);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  const { name, description } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const topic = await prisma.topic.create({
    data: {
      name,
      description,
      userId: user.id,
    },
  });
  return NextResponse.json(topic);
} 