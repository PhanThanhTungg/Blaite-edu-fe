"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useWelcomeModal() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Chỉ hiển thị modal khi người dùng đã đăng nhập và Clerk đã load xong
    if (isLoaded && isSignedIn) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  return {
    showWelcomeModal,
    handleCloseWelcomeModal
  };
}
