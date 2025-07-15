import { NextRequest, NextResponse } from 'next/server';
import { generateQuestionWithGemini } from '@/lib/actions/question';

export async function POST(request: NextRequest) {
  const { content } = await request.json();
  if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });

  try {
    const result = await generateQuestionWithGemini({ content });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error generating question' }, { status: 500 });
  }
} 