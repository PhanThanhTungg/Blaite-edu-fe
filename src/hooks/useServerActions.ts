'use client'

import { getOrCreateUser, getTopics } from '@/lib/actions'
import { createTopic, deleteTopic, updateTopic, getTopic, getTopicKnowledges } from '@/lib/actions/topic'
import { getKnowledges, getKnowledge, createKnowledge, updateKnowledge, deleteKnowledge } from '@/lib/actions/knowledge'
import { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion } from '@/lib/actions/question'
import { updateUserProfile } from '@/lib/actions/user'
import { getActivities, getActivitiesByYear, updateActivityCount, syncActivitiesFromAnswers } from '@/lib/actions/activity'
import { createAnswer } from '@/lib/actions/question';
import { generateQuestionWithGemini, evaluateAnswerWithGemini } from '@/lib/actions/question';

// Đã xoá toàn bộ các hàm, biến, wrapper liên quan đến answers/Answer

// Activity actions
export const serverActions = {
  // User actions
  getUser: async (timezone = 'UTC') => {
    try {
      return await getOrCreateUser(timezone)
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  updateUserProfile: async (name: string, email: string) => {
    try {
      return await updateUserProfile(name, email)
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  // Topic actions
  getTopics: async () => {
    try {
      return await getTopics()
    } catch (error) {
      console.error('Error fetching topics:', error)
      throw error
    }
  },

  getTopic: async (topicId: number) => {
    try {
      return await getTopic(topicId)
    } catch (error) {
      console.error('Error fetching topic:', error)
      throw error
    }
  },

  getTopicKnowledges: async (topicId: number) => {
    try {
      return await getTopicKnowledges(topicId)
    } catch (error) {
      console.error('Error fetching topic knowledges:', error)
      throw error
    }
  },

  createTopic: async (values: { name: string; description?: string }) => {
    try {
      return await createTopic(values.name, values.description)
    } catch (error) {
      console.error('Error creating topic:', error)
      throw error
    }
  },

  updateTopic: async (topicId: number, name: string) => {
    try {
      return await updateTopic(topicId, name)
    } catch (error) {
      console.error('Error updating topic:', error)
      throw error
    }
  },

  deleteTopic: async (topicId: number) => {
    try {
      return await deleteTopic(topicId)
    } catch (error) {
      console.error('Error deleting topic:', error)
      throw error
    }
  },

  // Knowledge actions
  getKnowledges: async (topicId: number) => {
    try {
      return await getKnowledges(topicId)
    } catch (error) {
      console.error('Error fetching knowledges:', error)
      throw error
    }
  },

  getKnowledge: async (knowledgeId: number) => {
    try {
      return await getKnowledge(knowledgeId)
    } catch (error) {
      console.error('Error fetching knowledge:', error)
      throw error
    }
  },

  createKnowledge: async (topicId: number, content: string) => {
    try {
      return await createKnowledge(topicId, content)
    } catch (error) {
      console.error('Error creating knowledge:', error)
      throw error
    }
  },

  updateKnowledge: async (knowledgeId: number, content: string) => {
    try {
      return await updateKnowledge(knowledgeId, content)
    } catch (error) {
      console.error('Error updating knowledge:', error)
      throw error
    }
  },

  deleteKnowledge: async (knowledgeId: number) => {
    try {
      return await deleteKnowledge(knowledgeId)
    } catch (error) {
      console.error('Error deleting knowledge:', error)
      throw error
    }
  },

  // Question actions
  getQuestions: async (knowledgeId: number) => {
    try {
      return await getQuestions(knowledgeId)
    } catch (error) {
      console.error('Error fetching questions:', error)
      throw error
    }
  },

  getQuestion: async (questionId: number) => {
    try {
      return await getQuestion(questionId)
    } catch (error) {
      console.error('Error fetching question:', error)
      throw error
    }
  },

  createQuestion: async (data: {
    topicId: number
    knowledgeId: number | null
    content: string
  }) => {
    try {
      return await createQuestion(
        data.topicId,
        data.knowledgeId,
        data.content,
      )
    } catch (error) {
      console.error('Error creating question:', error)
      throw error
    }
  },

  updateQuestion: async (data: {
    questionId: number;
    content: string;
    answer?: string;
    score?: number;
    aiFeedback?: string;
    aiAnswer?: string;
  }) => {
    try {
      return await updateQuestion(
        data.questionId,
        data.content,
        data.answer,
        data.score,
        data.aiFeedback,
        data.aiAnswer
      );
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  deleteQuestion: async (questionId: number) => {
    try {
      return await deleteQuestion(questionId)
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  },

  createAnswer: async (data: { questionId: number; answer: string; score?: number }) => {
    return await createAnswer(data.questionId, data.answer, data.score);
  },

  generateQuestionWithGemini: async (data: { content: string }) => {
    return await generateQuestionWithGemini(data);
  },

  evaluateAnswerWithGemini: async (data: { question: string; answer: string }) => {
    return await evaluateAnswerWithGemini(data.question, data.answer);
  },

  // Activity actions
  getActivities: async () => {
    try {
      return await getActivities()
    } catch (error) {
      console.error('Error fetching activities:', error)
      throw error
    }
  },

  getActivitiesByYear: async (year: number) => {
    try {
      return await getActivitiesByYear(year)
    } catch (error) {
      console.error('Error fetching activities by year:', error)
      throw error
    }
  },

  updateActivityCount: async (date: Date) => {
    try {
      return await updateActivityCount(date)
    } catch (error) {
      console.error('Error updating activity count:', error)
      throw error
    }
  },

  syncActivitiesFromAnswers: async () => {
    try {
      return await syncActivitiesFromAnswers()
    } catch (error) {
      console.error('Error syncing activities from answers:', error)
      throw error
    }
  },
} 