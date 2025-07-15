import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenAndGetUserId, findOrCreateUser } from '@/utils/helpers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  const knowledges = await prisma.knowledge.findMany({
    where: {
      topic: {
        userId: user.id
      }
    }
  });
  return NextResponse.json(knowledges);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  const { topicId, content } = await request.json();
  if (!topicId || !content) return NextResponse.json({ error: 'topicId and content are required' }, { status: 400 });
  // Đảm bảo topic thuộc về user
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId: user.id } });
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  const knowledge = await prisma.knowledge.create({
    data: {
      topicId,
      content,
    },
  });
  return NextResponse.json(knowledge);
} 