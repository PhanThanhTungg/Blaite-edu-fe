import api from "./axios-customize.service";

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

export async function genTopicByAi(classId: string) {
  const res = await api.post(`/topics/class/${classId}/generate`);
  return res.data;
}

export async function updateTopicStatus(topicId: string, status: string) {
  const res = await api.patch(`/topics/${topicId}/status`, { status });
  return res.data;
}

export async function deleteTopic(topicId: string) {
  const res = await api.delete(`/topics/${topicId}`);
  return res.data;
}