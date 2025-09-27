"use client";
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import ProLayoutWrapper from '@/components/layout/ProLayoutWrapper';
import { Button, Card, Typography } from 'antd';

const { Title } = Typography;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <ProLayoutWrapper>
          {children}
        </ProLayoutWrapper>
      </SignedIn>
      <SignedOut>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Card 
            style={{ 
              maxWidth: 400, 
              width: '100%', 
              textAlign: 'center',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Title level={3} style={{ marginBottom: 16 }}>
              You need to sign in to access Dashboard
            </Title>
            <SignInButton mode="modal">
              <Button type="primary" size="large">
                Sign In
              </Button>
            </SignInButton>
          </Card>
        </div>
      </SignedOut>
    </>
  );
} 