"use client";

import { useEffect } from "react";
import { getUser } from "@/hooks/api";

export default function UserBootstrap() {
  useEffect(() => {
    getUser().catch(() => {});
  }, []);
  return null;
}
