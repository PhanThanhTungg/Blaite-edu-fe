import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

import AStudyAppProvider from "@/components/providers/HappyThemeProvider";
import TanstackProvider from "@/components/providers/TanstackProvider";
import { PropsWithChildren } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import UserBootstrap from "@/components/features/user/UserBootstrap";
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
          <ConfigProvider>
            <AntdRegistry>
              <AStudyAppProvider>
                <TanstackProvider>
                  <UserBootstrap />
                  <App>{children}</App>
                </TanstackProvider>
              </AStudyAppProvider>
            </AntdRegistry>
          </ConfigProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
