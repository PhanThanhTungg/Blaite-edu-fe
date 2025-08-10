"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button, Card, Typography, Space } from 'antd';
import ClientOnly from '@/components/ui/ClientOnly';

const { Title, Paragraph } = Typography;

function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  return null;
}

export default function Home() {
  return (
    <ClientOnly>
      <SignedIn>
        <RedirectToDashboard />
      </SignedIn>
      <SignedOut>
        <main style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Card 
            style={{ 
              maxWidth: 500, 
              width: '100%', 
              textAlign: 'center',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Title level={2} style={{ marginBottom: 16 }}>
              AStudy - Nền tảng học tập cá nhân hóa
            </Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: 32, color: '#666' }}>
              Quản lý chủ đề, theo dõi tiến trình, luyện tập thông minh và phân tích hiệu suất học tập của bạn. Đăng nhập để bắt đầu hành trình học tập hiệu quả!
            </Paragraph>
            <Space size="middle">
              <SignInButton mode="modal">
                <Button type="primary" size="large">
                  Đăng nhập
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="large">
                  Đăng ký
                </Button>
              </SignUpButton>
            </Space>
          </Card>
        </main>
      </SignedOut>
    </ClientOnly>
  );
}
