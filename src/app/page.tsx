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
              AStudy - Personalized Learning Platform
            </Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: 32, color: '#666' }}>
              Manage topics, track progress, practice intelligently and analyze your learning performance. Sign in to start your effective learning journey!
            </Paragraph>
            <Space size="middle">
              <SignInButton mode="modal">
                <Button type="primary" size="large">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="large">
                  Sign Up
                </Button>
              </SignUpButton>
            </Space>
          </Card>
        </main>
      </SignedOut>
    </ClientOnly>
  );
}
