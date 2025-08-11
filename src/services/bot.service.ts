import api from "./axios-customize.service";

export async function changeIntervalSendQuestion(interval: number) {
  const res = await api.post('/schedule/change-interval', { interval });
  return res.data;
}

export async function setScheduleKnowledge(knowledgeId: string) {
  const res = await api.post('/schedule/schedule-knowledgeId', { knowledgeId });
  return res.data;
}

export interface ScheduleTypeQuestion {
  typeQuestion: "theory" | "practice";
}

export async function setScheduleTypeQuestion(typeQuestion: ScheduleTypeQuestion) {
  const res = await api.post('/schedule/schedule-type-question', { typeQuestion });
  return res.data;
}
