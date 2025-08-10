"use client";

import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Form, Input, Typography, Space, Alert, Divider, Tag } from 'antd';
import { RobotOutlined, SendOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

export default function TeleBotSetupPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async (values: any) => {
    setIsConnecting(true);
    
  };

  return (
    <PageContainer
      title="Telegram Bot Setup"
      subTitle="Configure your telegram bot for notifications and interactions"
      breadcrumb={{
        items: [
          { title: '🏠', href: '/dashboard' },
          { title: 'Telegram Setup' },
        ],
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <RobotOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={2}>Thiết lập Telegram Bot</Title>
            <Text type="secondary">
              Kết nối bot telegram để nhận thông báo và tương tác với hệ thống học tập
            </Text>
          </div>

          {!isConnected ? (
            <>
              <Alert
                message="Hướng dẫn thiết lập"
                description={
                  <div>
                    <ol style={{ paddingLeft: 20, margin: '8px 0' }}>
                      <li>Click vào nút bên dưới</li>
                      <li>Click vào nút "Connect Telegram Bot"</li>
                      <li>Khi kết nối thành công hay refresh trang để cập nhật kết quả</li>
                    </ol>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleConnect}
                size="large"
              >
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isConnecting}
                    block
                    size="large"
                    icon={<CheckCircleOutlined />}
                  >
                    {isConnecting ? 'Đang kết nối...' : 'Kết nối Telegram Bot'}
                  </Button>
                </Form.Item>
              </Form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined 
                style={{ 
                  fontSize: 64, 
                  color: '#52c41a',
                  marginBottom: 16 
                }} 
              />
              
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
} 