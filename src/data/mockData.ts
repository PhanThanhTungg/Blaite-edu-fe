// Mock data for topics
export const mockTopics = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Core concepts of JavaScript programming language including variables, functions, and ES6+ features',
    category: 'Programming',
    difficulty: 'Beginner',
    status: 'Active',
    questionsGenerated: 15,
    lastReviewed: '2024-01-15',
    avgScore: 85,
    totalQuestions: 45,
    studyTime: 12,
    nextReview: '2024-01-18',
  },
  {
    id: 2,
    title: 'React Hooks',
    description: 'Understanding and using React hooks effectively for state management and side effects',
    category: 'Frontend',
    difficulty: 'Intermediate',
    status: 'Active',
    questionsGenerated: 12,
    lastReviewed: '2024-01-14',
    avgScore: 72,
    totalQuestions: 38,
    studyTime: 8,
    nextReview: '2024-01-16',
  },
  {
    id: 3,
    title: 'Data Structures',
    description: 'Essential data structures and algorithms for efficient problem solving',
    category: 'Computer Science',
    difficulty: 'Advanced',
    status: 'Active',
    questionsGenerated: 20,
    lastReviewed: '2024-01-13',
    avgScore: 68,
    totalQuestions: 52,
    studyTime: 15,
    nextReview: '2024-01-15',
  },
  {
    id: 4,
    title: 'Python Basics',
    description: 'Introduction to Python programming language and basic syntax',
    category: 'Programming',
    difficulty: 'Beginner',
    status: 'Active',
    questionsGenerated: 8,
    lastReviewed: '2024-01-12',
    avgScore: 90,
    totalQuestions: 30,
    studyTime: 6,
    nextReview: '2024-01-17',
  },
  {
    id: 5,
    title: 'CSS Grid & Flexbox',
    description: 'Modern CSS layout techniques for responsive web design',
    category: 'Frontend',
    difficulty: 'Intermediate',
    status: 'Active',
    questionsGenerated: 18,
    lastReviewed: '2024-01-11',
    avgScore: 78,
    totalQuestions: 42,
    studyTime: 10,
    nextReview: '2024-01-14',
  },
];

// Mock history data
export const mockHistory = [
  {
    id: 1,
    topic: 'JavaScript Fundamentals',
    question: 'What is the difference between let, const, and var?',
    answer: 'let and const are block-scoped, var is function-scoped...',
    score: 85,
    date: '2024-01-15 10:30:00',
    feedback: 'Excellent understanding of scope concepts. Good explanation of temporal dead zone.',
    timeSpent: 45,
    difficulty: 'Beginner',
  },
  {
    id: 2,
    topic: 'React Hooks',
    question: 'Explain the useEffect hook and its dependencies',
    answer: 'useEffect runs after every render and can be controlled...',
    score: 72,
    date: '2024-01-14 15:45:00',
    feedback: 'Good understanding of useEffect basics. Need more practice with dependency arrays.',
    timeSpent: 60,
    difficulty: 'Intermediate',
  },
  {
    id: 3,
    topic: 'Data Structures',
    question: 'Compare time complexity of array vs linked list operations',
    answer: 'Arrays have O(1) access but O(n) insertion...',
    score: 68,
    date: '2024-01-13 09:20:00',
    feedback: 'Solid grasp of basic concepts. Consider edge cases more carefully.',
    timeSpent: 90,
    difficulty: 'Advanced',
  },
  {
    id: 4,
    topic: 'Python Basics',
    question: 'What are list comprehensions and when should you use them?',
    answer: 'List comprehensions provide a concise way to create lists...',
    score: 92,
    date: '2024-01-12 14:15:00',
    feedback: 'Excellent understanding of list comprehensions. Great examples provided.',
    timeSpent: 35,
    difficulty: 'Beginner',
  },
  {
    id: 5,
    topic: 'CSS Grid & Flexbox',
    question: 'When would you choose CSS Grid over Flexbox?',
    answer: 'CSS Grid is better for two-dimensional layouts...',
    score: 78,
    date: '2024-01-11 16:30:00',
    feedback: 'Good understanding of layout differences. Consider browser support.',
    timeSpent: 55,
    difficulty: 'Intermediate',
  },
  {
    id: 6,
    topic: 'JavaScript Fundamentals',
    question: 'Explain closures in JavaScript',
    answer: 'A closure is a function that has access to variables in its outer scope...',
    score: 88,
    date: '2024-01-10 11:45:00',
    feedback: 'Excellent explanation of closures. Good practical examples.',
    timeSpent: 70,
    difficulty: 'Intermediate',
  },
];

// Generate fake activity data for the last 365 days
type ActivityData = { date: string; count: number };
export const mockActivityData: ActivityData[] = Array.from({ length: 365 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (364 - i));
  const dateStr = date.toISOString().split('T')[0];
  // Randomly assign 0-12 questions per day, with more 0s for realism
  const count = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 13);
  return { date: dateStr, count };
});

// Utility functions for data processing
export const calculateStats = (topics: typeof mockTopics) => {
  const totalTopics = topics.length;
  const totalQuestions = topics.reduce((sum, topic) => sum + topic.totalQuestions, 0);
  const avgScore = Math.round(topics.reduce((sum, topic) => sum + topic.avgScore, 0) / totalTopics);
  const totalStudyTime = topics.reduce((sum, topic) => sum + topic.studyTime, 0);
  
  return { totalTopics, totalQuestions, avgScore, totalStudyTime };
};

export const calculateHistoryStats = (history: typeof mockHistory) => {
  const totalSessions = history.length;
  const avgScore = Math.round(history.reduce((sum, session) => sum + session.score, 0) / totalSessions);
  const totalTime = history.reduce((sum, session) => sum + session.timeSpent, 0);
  const uniqueTopics = new Set(history.map(session => session.topic)).size;
  
  return { totalSessions, avgScore, totalTime, uniqueTopics };
};

export const calculateAnalyticsData = (activityData: typeof mockActivityData) => {
  const totalDays = activityData.filter(day => day.count > 0).length;
  const totalQuestions = activityData.reduce((sum, day) => sum + day.count, 0);
  const averageQuestionsPerDay = totalDays > 0 ? Math.round(totalQuestions / totalDays) : 0;
  const maxQuestionsInDay = Math.max(...activityData.map(day => day.count));
  
  return { totalDays, totalQuestions, averageQuestionsPerDay, maxQuestionsInDay };
}; 