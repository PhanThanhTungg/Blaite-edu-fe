import api from "./axios-customize.service";

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
    prompt: description || `This is a class about ${name}`
  });
  return res.data;
}

export async function editClass(classId: string, name: string, description?: string, status?: "active" | "inactive") {
  console.log('🔍 Editing class:', classId, name, description, status);
  const res = await api.patch(`/classes/${classId}`, { 
    name, 
    prompt: description || `This is a class about ${name}`,
    status
  });
  return res.data;
}

export async function deleteClass(classId: string) {
  const res = await api.delete(`/classes/${classId}`);
  return res.data;
}