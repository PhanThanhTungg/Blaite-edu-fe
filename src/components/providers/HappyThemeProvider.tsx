"use client";

import { HappyProvider } from "@ant-design/happy-work-theme";
import { PropsWithChildren } from "react";
import { UserProvider } from "@/contexts/UserContext";

export default function AStudyAppProvider({ children }: PropsWithChildren) {
  return (
    <UserProvider>
      <HappyProvider>
        {children}
      </HappyProvider>
    </UserProvider>
  );
}
