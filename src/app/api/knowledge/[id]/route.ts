import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenAndGetUserId, findOrCreateUser } from '@/utils/helpers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  const knowledge = await prisma.knowledge.findFirst({
    where: {
      id: Number(params.id),
      topic: { userId: user.id }
    }
  });
  if (!knowledge) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(knowledge);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  const { content } = await request.json();
  const knowledge = await prisma.knowledge.update({
    where: {
      id: Number(params.id),
      // Đảm bảo knowledge thuộc topic của user
      topic: { userId: user.id }
    },
    data: { content },
  });
  return NextResponse.json(knowledge);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  await prisma.knowledge.delete({
    where: {
      id: Number(params.id),
      // Prisma không hỗ trợ nested where khi delete, nên cần kiểm tra trước
    },
  });
  return NextResponse.json({ success: true });
} 