import api from "./axios-customize.service";

export async function getDashboardStatistics() {
  const res = await api.get('/dashboard/statistics');
  return res.data;
}

export async function getDashboardCalendar(year: number = new Date().getFullYear()) {
  const res = await api.get(`/dashboard/calendar?year=${year}`);
  return res.data;
} 