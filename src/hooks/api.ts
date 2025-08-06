import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Helper function to get cookie by name
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  
  // Get session token from cookie
  const token = getCookie('__session');
  
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
    config.headers['accept'] = '*/*';
  }
  
  // Send timezone to server via header
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  config.headers = config.headers || {};
  config.headers['X-Timezone'] = timezone;
  
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const apiClient = api;
export default api;

// User APIs
export async function getUser() {
  const res = await api.post('/users/auth');
  return res.data;
}

// Classes APIs
export async function getClasses() {
  const res = await api.get('/classes');
  return res.data;
}

export async function getClass(classId: string) {
  const res = await api.get(`/classes/${classId}`);
  return res.data;
}

export async function createClass(name: string, description?: string) {
  const res = await api.post('/classes', { 
    name, 
    prompt: description || `This is a class about ${name}`,
    status: 'private'
  });
  return res.data;
}

export async function editClass(classId: string, name: string, description?: string) {
  const res = await api.patch(`/classes/${classId}`, { 
    name, 
    prompt: description || `This is a class about ${name}`,
    status: 'private'
  });
  return res.data;
}

export async function deleteClass(classId: string) {
  const res = await api.delete(`/classes/${classId}`);
  return res.data;
}

// Topics APIs - These require a classId parameter
export async function getTopics(classId: string) {
  const res = await api.get(`/topics/class/${classId}`);
  return res.data;
}

export async function getTopic(topicId: string) {
  const res = await api.get(`/topics/${topicId}`);
  return res.data;
}

export async function createTopic(classId: string, name: string, prompt?: string) {
  const res = await api.post(`/topics/class/${classId}`, { name, prompt });
  return res.data;
}

export async function editTopic(topicId: string, name: string, prompt?: string) {
  const res = await api.patch(`/topics/${topicId}`, { name, prompt });
  return res.data;
}

export async function deleteTopic(topicId: string) {
  const res = await api.delete(`/topics/${topicId}`);
  return res.data;
}

// Knowledges APIs
export async function getKnowledges(topicId: string) {
  const res = await api.get(`/knowledges/topic/${topicId}`);
  return res.data;
}

export async function getKnowledgeDetail(knowledgeId: string) {
  const res = await api.get(`/knowledges/detail/${knowledgeId}`);
  return res.data;
}

export async function createKnowledge(topicId: string, content: string) {
  const res = await api.post('/knowledges', { topicId, content });
  return res.data;
}

export async function editKnowledge(knowledgeId: string, content: string) {
  const res = await api.patch(`/knowledges/${knowledgeId}`, { content });
  return res.data;
}

export async function deleteKnowledge(knowledgeId: string) {
  const res = await api.delete(`/knowledges/${knowledgeId}`);
  return res.data;
}

// Questions APIs
export async function getQuestions(knowledgeId: string) {
  // Since there's no direct GET endpoint for questions, we'll get them through knowledge detail
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

// Gemini AI APIs
export async function generateQuestionWithGemini(content: string) {
  const res = await api.post('/gemini/generate', { 
    prompt: `Generate a practice question based on this content: ${content}`,
    maxTokens: 1000,
    temperature: 0.7
  });
  return { question: res.data.text };
}

// Activity/Statistics APIs - These might need to be implemented on your backend
export async function getActivities() {
  // This endpoint doesn't exist in your current backend
  // You might need to implement it or use a different approach
  return [];
} 