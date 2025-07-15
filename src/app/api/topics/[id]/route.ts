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
  const topic = await prisma.topic.findFirst({ where: { id: Number(params.id), userId: user.id } });
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(topic);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  const { name, description } = await request.json();
  const topic = await prisma.topic.update({
    where: { id: Number(params.id), userId: user.id },
    data: { name, description },
  });
  return NextResponse.json(topic);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const userId = await verifyTokenAndGetUserId(token!);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const timezone = request.headers.get('x-timezone') || 'UTC';
  const user = await findOrCreateUser(userId, timezone);
  await prisma.topic.delete({ where: { id: Number(params.id), userId: user.id } });
  return NextResponse.json({ success: true });
} 