"use client"

import { useEffect } from "react";
import { getUser } from '@/hooks/api';

export default function UserBootstrap() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    getUser().catch(() => {});
  }, []);
  return null;
} 