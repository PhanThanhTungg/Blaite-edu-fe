import axios from 'axios';

const api = axios.create();

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('__session='))?.split('=')[1];
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  // Gửi timezone lên server qua header
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  config.headers = config.headers || {};
  config.headers['X-Timezone'] = timezone;
  return config;
});

export const apiClient = api;
export default api;

export async function getTopics() {
  const res = await api.get('/api/topics');
  return res.data;
}

export async function getUser() {
  const res = await api.get('/api/user');
  return res.data;
}

export async function getActivities() {
  const res = await api.get('/api/activity');
  return res.data;
}

export async function getKnowledges() {
  const res = await api.get('/api/knowledge');
  return res.data;
}

export async function getQuestions(knowledgeId: number) {
  const res = await api.get('/api/question', { params: { knowledgeId } });
  return res.data;
}

export async function createQuestion({ knowledgeId, content, answer }: { knowledgeId: number, content: string, answer?: string }) {
  const res = await api.post('/api/question', { knowledgeId, content, answer });
  return res.data;
}

export async function submitAnswer({ questionId, answer }: { questionId: number, answer: string }) {
  const res = await api.put('/api/question', { questionId, answer });
  return res.data;
}

export async function getKnowledgeDetail(id: number) {
  const res = await api.get(`/api/knowledge/${id}`);
  return res.data;
}

export async function generateQuestionWithGemini({ content }: { content: string }) {
  const res = await api.post('/api/question/generate', { content });
  return res.data;
} 