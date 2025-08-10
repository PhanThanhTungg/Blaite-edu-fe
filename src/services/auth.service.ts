import api from "./axios-customize.service";

// User APIs
export async function getUser() {
  const res = await api.post('/users/auth');
  return res.data;
}