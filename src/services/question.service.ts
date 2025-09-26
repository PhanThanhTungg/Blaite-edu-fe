import api from "./axios-customize.service";
import { getKnowledgeDetail } from "./knowledge.service";

export async function getQuestions(knowledgeId: string) {
  const knowledge = await getKnowledgeDetail(knowledgeId);
  return knowledge.questions || [];
}

export async function createQuestion(knowledgeId: string, typeQuestion: 'theory' | 'practice' = 'theory') {
  const res = await api.post(`/questions/knowledge/${knowledgeId}/generate/${typeQuestion}`);
  return res.data;
}

export async function submitAnswer(questionId: string, answer: string) {
  const res = await api.post(`/questions/answer/${questionId}`, { answer });
  return res.data;
}

export async function generateQuestionWithGemini(content: string) {
  const res = await api.post('/gemini/generate', { 
    prompt: `Generate a practice question based on this content: ${content}`,
    maxTokens: 1000,
    temperature: 0.7
  });
  return { question: res.data.text };
}

export async function submitQuestionAnswer(questionId: string, answer: string) {
  const res = await api.post(`/questions/answer/${questionId}`, { answer });
  return res.data;
}

export async function generatePracticeQuestion(knowledgeId: string) {
  try {
    const res = await api.post(`/questions/knowledge/${knowledgeId}/generate/practice`);
    // If 201 created, return the new question data directly
    if (res.status === 201) {
      return res.data;
    }
    return res.data;
  } catch (error: any) {
    // If 400 bad request, get the latest unanswered question
    if (error.response?.status === 400) {
      const latestRes = await api.get(`/questions/knowledge/${knowledgeId}/latest-unanswered/practice`);
      return latestRes.data;
    }
    throw error;
  }
}

export async function generateTheoryQuestion(knowledgeId: string) {
  try {
    const res = await api.post(`/questions/knowledge/${knowledgeId}/generate/theory`);
    // If 201 created, return the new question data directly
    if (res.status === 201) {
      return res.data;
    }
    return res.data;
  } catch (error: any) {
    // If 400 bad request, get the latest unanswered question
    if (error.response?.status === 400) {
      const latestRes = await api.get(`/questions/knowledge/${knowledgeId}/latest-unanswered/theory`);
      return latestRes.data;
    }
    throw error;
  }
}

export async function getQuestionsOfKnowledge(knowledgeId: string, typeQuestion: 'theory' | 'practice') {
  const res = await api.get(`/questions/knowledge/${knowledgeId}/${typeQuestion}`);
  return res.data;
}

export async function getLatestUnansweredQuestion(topicId: string) {
  const res = await api.get(`/questions/topic/${topicId}/latest-unanswered`);
  return res.data;
}