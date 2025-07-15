import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

/**
 * Xác thực token Clerk bằng jsonwebtoken và trả về userId nếu hợp lệ, ngược lại trả về null.
 */
export async function verifyTokenAndGetUserId(token: string): Promise<string | null> {
  try {
    if (!token) return null;
    const publicKey = process.env.CLERK_JWT_KEY!;
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as any;
    return payload.sub || null;
  } catch(e) {
    console.log(e)
    return null;
  }
}

/**
 * Tìm user theo clerkUserId, nếu không thấy thì tạo mới.
 */
export async function findOrCreateUser(clerkUserId: string, timezone: string) {
  let user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkUserId, timezone },
    });
  }
  return user;
}

// Color utility functions
export const getScoreColor = (score: number) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'success';
    case 'Intermediate': return 'processing';
    case 'Advanced': return 'error';
    default: return 'default';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Inactive': return 'default';
    case 'Archived': return 'error';
    default: return 'default';
  }
};

// Date formatting utilities
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Data filtering utilities
export const filterTopics = (
  topics: any[], 
  searchText: string, 
  filterCategory: string, 
  filterDifficulty: string
) => {
  return topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === 'all' || topic.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || topic.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
};

export const filterHistory = (
  history: any[], 
  searchText: string, 
  filterTopic: string, 
  filterDifficulty: string,
  dateRange?: any
) => {
  return history.filter(session => {
    const matchesSearch = session.topic.toLowerCase().includes(searchText.toLowerCase()) ||
                         session.question.toLowerCase().includes(searchText.toLowerCase()) ||
                         session.answer.toLowerCase().includes(searchText.toLowerCase());
    const matchesTopic = filterTopic === 'all' || session.topic === filterTopic;
    const matchesDifficulty = filterDifficulty === 'all' || session.difficulty === filterDifficulty;
    
    let matchesDate = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const sessionDate = new Date(session.date);
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      matchesDate = sessionDate >= startDate && sessionDate <= endDate;
    }
    
    return matchesSearch && matchesTopic && matchesDifficulty && matchesDate;
  });
};

// Validation utilities
export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateApiKey = (apiKey: string) => {
  return apiKey.length >= 20 && apiKey.startsWith('sk-');
};

// Time utilities
export const formatTimeSpent = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
};

export const calculateProgress = (current: number, total: number) => {
  return total > 0 ? Math.round((current / total) * 100) : 0;
};

// Local storage utilities
export const saveToLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// Debounce utility
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}; 