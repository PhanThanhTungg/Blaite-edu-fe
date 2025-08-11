"use client";

import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

export default function UserBootstrap() {
  const { refreshUser } = useUser();

  useEffect(() => {
    // UserContext đã tự động gọi refreshUser() khi mount
    // Không cần gọi lại ở đây
  }, []);

  return null;
}
