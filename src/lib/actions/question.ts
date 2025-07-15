'use server'

import { revalidatePath } from 'next/cache'
import prisma from '../prisma'
import { verifyTokenAndGetUserId } from '../../utils/helpers';

export async function getQuestions(knowledgeId: number) {
  const token = await verifyTokenAndGetUserId();
  const userId = token.userId;
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({ 
    where: { clerkUserId: userId } 
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  // Verify knowledge belongs to user through topic
  const knowledge = await prisma.knowledge.findFirst({
    where: { 
      id: knowledgeId,
      topic: {
        userId: user.id
      }
    }
  })

  if (!knowledge) {
    throw new Error('Knowledge not found')
  }

  const questions = await prisma.question.findMany({
    where: { knowledgeId: knowledgeId },
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' }
    ]
  })

  return questions
}

export async function createQuestion(
  topicId: number, 
  knowledgeId: number | null,
  content: string, 
  answer?: string,
  score?: number,
  aiFeedback?: string,
) {
  const token = await verifyTokenAndGetUserId();
  const userId = token.userId;
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({ 
    where: { clerkUserId: userId } 
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  // Verify topic belongs to user
  const topic = await prisma.topic.findFirst({
    where: { 
      id: topicId,
      userId: user.id 
    }
  })

  if (!topic) {
    throw new Error('Topic not found')
  }

  // Verify knowledge if provided
  if (knowledgeId) {
    const knowledge = await prisma.knowledge.findFirst({
      where: { 
        id: knowledgeId,
        topicId: topicId
      }
    })

    if (!knowledge) {
      throw new Error('Knowledge not found')
    }
  }

  const question = await prisma.question.create({
    data: {
      content,
      topicId: topicId,
      knowledgeId: knowledgeId,
      ...(answer !== undefined && { answer }),
      ...(score !== undefined && { score }),
      ...(aiFeedback !== undefined && { aiFeedback }),
    },
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/topics/${topicId}`)
  
  return question
}

export async function updateQuestion(
  questionId: number, 
  content: string, 
  answer?: string,
  score?: number,
  aiFeedback?: string
) {
  const token = await verifyTokenAndGetUserId();
  const userId = token.userId;
  if (!userId) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error('User not found');

  // Get question and verify ownership through topic
  const existingQuestion = await prisma.question.findFirst({
    where: { id: questionId, topic: { userId: user.id } },
    include: { topic: true }
  });
  if (!existingQuestion) throw new Error('Question not found');

  // Update question
  const question = await prisma.question.update({
    where: { id: questionId },
    data: {
      content,
      ...(answer !== undefined && { answer }),
      ...(score !== undefined && { score }),
      ...(aiFeedback !== undefined && { aiFeedback }),
    },
  });

  // Update avgScore for knowledge
  if (existingQuestion.knowledgeId) {
    const allQuestions = await prisma.question.findMany({ where: { knowledgeId: existingQuestion.knowledgeId } });
    const validScores = allQuestions.map(q => q.score).filter(s => typeof s === 'number');
    const avgScore = validScores.length > 0 ? validScores.reduce((sum, s) => sum + (s || 0), 0) / validScores.length : 0;
    await prisma.knowledge.update({
      where: { id: existingQuestion.knowledgeId },
      data: { avgScore: Math.round(avgScore) }
    });
  }

  // Update activity (the timezone should be user.timezone)
  const now = new Date();
  await import('./activity').then(mod => mod.updateActivityCount(now, user.timezone));

  // Update streak
  const today = new Date(now.toLocaleString('en-US', { timeZone: user.timezone || 'UTC' }));
  today.setHours(0, 0, 0, 0);
  let newStreak = user.streak || 0;
  if (user.lastActiveDate) {
    const last = new Date(user.lastActiveDate);
    last.setHours(0, 0, 0, 0);
    const diff = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) newStreak += 1;
    else if (diff > 1) newStreak = 1;
  } else {
    newStreak = 1;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { streak: newStreak, lastActiveDate: today }
  });

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/topics/${existingQuestion.topicId}`);
  return question;
}

export async function deleteQuestion(questionId: number) {
  const token = await verifyTokenAndGetUserId();
  const userId = token.userId;
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({ 
    where: { clerkUserId: userId } 
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  // Get question and verify ownership through topic
  const question = await prisma.question.findFirst({
    where: { 
      id: questionId,
      topic: {
        userId: user.id
      }
    },
    include: {
      topic: true
    }
  })

  if (!question) {
    throw new Error('Question not found')
  }

  await prisma.question.delete({
    where: { id: questionId }
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/topics/${question.topicId}`)
} 

export async function   generateQuestionWithGemini({ content }: { content: string }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Gemini API key');
  const prompt = `Dựa trên nội dung sau, hãy tạo ra một câu hỏi luyện tập tự luận NGẮN GỌN, súc tích, để người học có thể trả lời nhanh. Chỉ trả về nội dung câu hỏi trong thẻ <question>...</question>, không giải thích thêm.\nNội dung: ${content}`;
  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        { parts: [ { text: prompt } ] }
      ]
    })
  });
  const geminiData = await geminiRes.json();
  let question = '';
  try {
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    const match = text.match(/<question>([\s\S]*?)<\/question>/i);
    question = match ? match[1].trim() : '';
  } catch (e) {
    question = '';
  }
  return { question };
}

// Hàm evaluateAnswerWithGemini assume đã có sẵn logic gọi Gemini API ở nơi khác
export async function evaluateAnswerWithGemini(question: string, answer: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Gemini API key');
  const prompt = `Câu hỏi: ${question}\nCâu trả lời của học viên: ${answer}\nBạn hãy đóng vai giáo viên, chấm điểm câu trả lời này trên thang 0-100 và nhận xét ngắn gọn, khách quan, chỉ tập trung vào kiến thức.\nTrả về kết quả trong thẻ <feedback><score>...</score><text>...</text><answer>...</answer></feedback>`;
  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        { parts: [ { text: prompt } ] }
      ]
    })
  });
  const geminiData = await geminiRes.json();
  let score = 0;
  let aiFeedback = '';
  let aiAnswer = '';
  try {
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    const scoreMatch = text.match(/<score>([\s\S]*?)<\/score>/i);
    const feedbackMatch = text.match(/<text>([\s\S]*?)<\/text>/i);
    const answerMatch = text.match(/<answer>([\s\S]*?)<\/answer>/i);
    score = scoreMatch ? parseInt(scoreMatch[1].trim()) : 0;
    aiFeedback = feedbackMatch ? feedbackMatch[1].trim() : '';
    aiAnswer = answerMatch ? answerMatch[1].trim() : '';
  } catch (e) {
    score = 0;
    aiFeedback = 'Không thể chấm điểm tự động.';
    aiAnswer = '';
  }
  return { score, aiFeedback, aiAnswer };
} 