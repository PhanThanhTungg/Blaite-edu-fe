"use client";

import { useEffect } from "react";
import { getUser } from "@/services/auth.service";

export default function UserBootstrap() {
  useEffect(() => {
    getUser().catch(() => {});
  }, []);
  return null;
}
