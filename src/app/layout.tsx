import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

import AStudyAppProvider from "@/components/providers/HappyThemeProvider";
import TanstackProvider from "@/components/providers/TanstackProvider";
import { PropsWithChildren } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App } from "antd";
import { ToastContainer } from 'react-toastify';
export const metadata: Metadata = {
  title: "AStudy - AI-Powered Learning Platform",
  description:
    "Modern learning application with AI-powered questions and spaced repetition",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="">
      <body>
        <ToastContainer />
        <ClerkProvider>
          <AntdRegistry>
            <AStudyAppProvider>
              <TanstackProvider>
                <App>{children}</App>
              </TanstackProvider>
            </AStudyAppProvider>
          </AntdRegistry>
        </ClerkProvider>
      </body>
    </html>
  );
}
