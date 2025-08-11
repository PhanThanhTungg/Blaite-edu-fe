import api from "./axios-customize.service";


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
  const res = await api.post('/knowledges', { topicId, prompt: content });
  return res.data;
}

export async function generateKnowledge(topicId: string, maxTokens: number = 1000, temperature: number = 0.5) {
  const res = await api.post(`/knowledges/topic/${topicId}/generate?maxTokens=${maxTokens}&temperature=${temperature}`);
  return res.data;
}

export async function generateTheory(knowledgeId: string, maxTokens: number = 1000, temperature: number = 0.5) {
  const res = await api.post(`/knowledges/${knowledgeId}/generate-theory?maxTokens=${maxTokens}&temperature=${temperature}`);
  return res.data;
}


export async function editKnowledge(knowledgeId: string, content: string) {
  const res = await api.patch(`/knowledges/${knowledgeId}`, { prompt: content });
  return res.data;
}

export async function deleteKnowledge(knowledgeId: string) {
  const res = await api.delete(`/knowledges/${knowledgeId}`);
  return res.data;
}


