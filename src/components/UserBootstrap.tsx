"use client"

import { useEffect } from "react";
import { serverActions } from "@/hooks/useServerActions";

export default function UserBootstrap() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    serverActions.getUser(timezone).catch(() => {});
  }, []);
  return null;
} 