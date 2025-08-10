"use client";

import { HappyProvider } from "@ant-design/happy-work-theme";
import { PropsWithChildren } from "react";


export default function AStudyAppProvider({ children }: PropsWithChildren) {
  return (
 
      <HappyProvider>{children}</HappyProvider>

  );
}
