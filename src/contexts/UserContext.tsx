"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser } from '@/services/auth.service';

// Define User type
interface User {
  id: string;
  clerkId: string;
  telegramId: string;
  intervalSendMessage: number; // tính theo phút
  scheduleKnowledgeId: string;
  prompt: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  // Add other user properties as needed
  [key: string]: any;
}

// Define Context type
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const userData = await getUser();
      setUser(userData);
      console.log('👤 User loaded successfully:', userData);
    } catch (error) {
      console.error('❌ Failed to load user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user on component mount
  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Export context for direct access if needed
export { UserContext }; 