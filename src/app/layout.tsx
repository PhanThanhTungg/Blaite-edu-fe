import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

import AStudyAppProvider from "@/components/HappyThemeProvider";
import TanstackProvider from "@/components/TanstackProvider";
import { PropsWithChildren } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import UserBootstrap from '@/components/UserBootstrap';

export const metadata: Metadata = {
  title: "AStudy - AI-Powered Learning Platform",
  description:
    "Modern learning application with AI-powered questions and spaced repetition",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <ClerkProvider>
      <ConfigProvider>
        <AntdRegistry>
          <AStudyAppProvider>
            <TanstackProvider>
              <html lang="en">
                <body>
                  <UserBootstrap />
                  <App>{children}</App>
                </body>
              </html>
            </TanstackProvider>
          </AStudyAppProvider>
        </AntdRegistry>
      </ConfigProvider>
    </ClerkProvider>
  );
}
