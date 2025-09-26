"use client";

import { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Form, Input, Typography, Space, Alert, Divider, Tag, Row, Col, InputNumber, Descriptions, Select } from 'antd';
import { RobotOutlined, SendOutlined, CheckCircleOutlined, InfoCircleOutlined, ClockCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-toastify';
import { changeIntervalSendQuestion, setScheduleTypeQuestion } from '@/services/bot.service';

const { Title, Text, Paragraph } = Typography;

export default function TeleBotSetupPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isUpdatingInterval, setIsUpdatingInterval] = useState(false);
  const [tempInterval, setTempInterval] = useState<number | null>(null);
  
  // State cho question type
  const [isUpdatingQuestionType, setIsUpdatingQuestionType] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<"theory" | "practice">("theory");

  const { user, refreshUser } = useUser();

  // Load question type từ localStorage khi component mount
  useEffect(() => {
    const savedQuestionType = localStorage.getItem('botQuestionType') as "theory" | "practice";
    if (savedQuestionType && (savedQuestionType === "theory" || savedQuestionType === "practice")) {
      setSelectedQuestionType(savedQuestionType);
    }
  }, []);

  const handleConnect = async (values: any) => {
    if(user?.id) {
      const linkDirectToTelegram = `https://t.me/${process.env.NEXT_PUBLIC_BOT_TELE_NAME}?start=${user?.id}`;
      window.open(linkDirectToTelegram, '_blank');
      return;
    }
    toast.error('Vui lòng đăng nhập để kết nối bot telegram');
  };

  const handleIntervalChange = async (value: number | null) => {
    if (value && value !== user?.intervalSendMessage && value >= 0 && value <= 1440) {
      try {
        setIsUpdatingInterval(true);
        await changeIntervalSendQuestion(value);
        toast.success('Cập nhật khoảng thời gian thành công!');
        await refreshUser(); // Refresh user data
        setTempInterval(null); // Reset temp value after successful save
      } catch (error) {
        console.error('Error updating interval:', error);
        toast.error('Có lỗi xảy ra khi cập nhật khoảng thời gian');
        // Reset về giá trị cũ nếu có lỗi
        setTempInterval(user?.intervalSendMessage || 60);
      } finally {
        setIsUpdatingInterval(false);
      }
    }
  };

  // Handler cho việc thay đổi loại câu hỏi
  const handleQuestionTypeChange = async (questionType: "theory" | "practice") => {
    if (questionType !== selectedQuestionType) {
      try {
        setIsUpdatingQuestionType(true);
        await setScheduleTypeQuestion({ typeQuestion: questionType });
        setSelectedQuestionType(questionType);
        localStorage.setItem('botQuestionType', questionType);
        toast.success(`Đã set loại câu hỏi "${questionType === 'theory' ? 'Lý thuyết' : 'Thực hành'}" cho bot thành công!`);
      } catch (error) {
        console.error('Error updating question type:', error);
        toast.error('Có lỗi xảy ra khi cập nhật loại câu hỏi');
      } finally {
        setIsUpdatingQuestionType(false);
      }
    }
  };

  return (
    <PageContainer
      title="Telegram Bot Setup"
      breadcrumb={{
        items: [
          { title: '🏠', href: '/dashboard' },
          { title: 'Bot Setup' },
        ],
      }}
      style={{ 
        background: '#fafafa',
        minHeight: '100vh'
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* User Information Card */}
        <Card 
          style={{ 
            marginBottom: 32,
            border: '1px solid #e5e5e5',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          styles={{
            body: { padding: 32 }
          }}
        >
          <Title 
            level={3} 
            style={{ 
              margin: '0 0 24px 0',
              fontSize: 20,
              fontWeight: 600,
              color: '#000',
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: 16
            }}
          >
            Thông tin người dùng
          </Title>
          
          <div style={{ marginBottom: 24 }}>
            <Text 
              style={{ 
                fontSize: 14,
                fontWeight: 500,
                color: '#333',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: 8
              }}
            >
              Telegram ID
            </Text>
            <div style={{
              padding: '12px 16px',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              background: user?.telegramId ? '#f9f9f9' : '#fff',
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: 14,
              color: user?.telegramId ? '#000' : '#999'
            }}>
              <Text copyable={!!user?.telegramId}>
                {user?.telegramId || 'Chưa kết nối với bot telegram'}
              </Text>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Text 
              style={{ 
                fontSize: 14,
                fontWeight: 500,
                color: '#333',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: 8
              }}
            >
              Khoảng thời gian gửi tin nhắn
            </Text>
            <div style={{
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              background: '#f9f9f9',
              overflow: 'hidden'
            }}>
              <InputNumber
                value={tempInterval !== null ? tempInterval : (user?.intervalSendMessage || 0)}
                onChange={(value) => {
                  setTempInterval(value);
                }}
                onBlur={() => {
                  if (tempInterval !== null) {
                    handleIntervalChange(tempInterval);
                  }
                }}
                onPressEnter={() => {
                  if (tempInterval !== null) {
                    handleIntervalChange(tempInterval);
                  }
                }}
                min={1}
                max={1440}
                disabled={!user?.telegramId || isUpdatingInterval}
                addonAfter="phút"
                style={{
                  width: '100%',
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'transparent',
                  boxShadow: 'none',
                  color: '#000',
                  padding: '12px 16px'
                }}
                placeholder="Nhập số phút"
              />
            </div>
            {isUpdatingInterval && (
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Đang cập nhật...
              </Text>
            )}
            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Enter hoặc click ra ngoài để lưu • 1-1440 phút
            </Text>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Text 
              style={{ 
                fontSize: 14,
                fontWeight: 500,
                color: '#333',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: 8
              }}
            >
              Loại câu hỏi bot sẽ gửi
            </Text>
            <div style={{
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              background: '#f9f9f9',
              overflow: 'hidden'
            }}>
              <Select
                value={selectedQuestionType}
                onChange={handleQuestionTypeChange}
                disabled={!user?.telegramId || isUpdatingQuestionType}
                loading={isUpdatingQuestionType}
                style={{
                  width: '100%',
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'transparent',
                  boxShadow: 'none',
                  color: '#000',
                }}
                size="large"
                options={[
                  { value: 'theory', label: '📖 Lý thuyết', style: { fontSize: 16 } },
                  { value: 'practice', label: '🎯 Thực hành', style: { fontSize: 16 } }
                ]}
              />
            </div>
            {isUpdatingQuestionType && (
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Đang cập nhật...
              </Text>
            )}
            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Chọn loại câu hỏi mà bot sẽ gửi định kỳ
            </Text>
          </div>

          <div>
            <Text 
              style={{ 
                fontSize: 14,
                fontWeight: 500,
                color: '#333',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: 8
              }}
            >
              Knowledge ID được lên lịch
            </Text>
            <div style={{
              padding: '12px 16px',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              background: user?.scheduleKnowledgeId ? '#f9f9f9' : '#fff',
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: 14,
              color: user?.scheduleKnowledgeId ? '#000' : '#999'
            }}>
              <Text copyable={!!user?.scheduleKnowledgesId}>
                {user?.scheduleKnowledgesId || 'Chưa thiết lập lịch học'}
              </Text>
            </div>
          </div>
        </Card>


        {/* Bot Connection Card */}
        <Card 
          style={{ 
            border: '1px solid #e5e5e5',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          styles={{
            body: { padding: 32 }
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              background: '#fff'
            }}>
              <RobotOutlined style={{ fontSize: 32, color: '#666' }} />
            </div>
            <Title 
              level={2} 
              style={{ 
                margin: '0 0 8px 0',
                fontSize: 24,
                fontWeight: 600,
                color: '#000'
              }}
            >
              Kết nối Telegram Bot
            </Title>
            <Text style={{ fontSize: 16, color: '#666', lineHeight: 1.5 }}>
              Kết nối bot để nhận thông báo và tương tác với hệ thống học tập
            </Text>
          </div>

          {user?.telegramId ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '24px',
                background: '#f9f9f9',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                marginBottom: 24
              }}>
                <CheckCircleOutlined 
                  style={{ 
                    fontSize: 48, 
                    color: '#000',
                    marginBottom: 16,
                    display: 'block'
                  }} 
                />
                <Text style={{ fontSize: 18, fontWeight: 600, color: '#000' }}>
                  Đã kết nối thành công
                </Text>
                <br />
                <Text style={{ fontSize: 14, color: '#666' }}>
                  Bot telegram đã sẵn sàng gửi thông báo
                </Text>
              </div>
              
              <Button
                type="text"
                onClick={handleConnect}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e5e5',
                  color: '#666',
                  height: 40,
                  paddingLeft: 24,
                  paddingRight: 24
                }}
              >
                Kết nối lại bot mới
              </Button>
            </div>
          ) : (
            <>
              <div style={{
                padding: '24px',
                background: '#f9f9f9',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                marginBottom: 24
              }}>
                <Text style={{ fontSize: 14, fontWeight: 500, color: '#333', display: 'block', marginBottom: 12 }}>
                  HƯỚNG DẪN THIẾT LẬP
                </Text>
                <ol style={{ paddingLeft: 20, margin: 0, color: '#666', fontSize: 14, lineHeight: 1.6 }}>
                  <li>Click nút "Kết nối Bot" bên dưới</li>
                  <li>Trò chuyện với bot và gửi lệnh /start</li>
                  <li>Quay lại trang này để kiểm tra kết quả</li>
                </ol>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleConnect}
              >
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isConnecting}
                    block
                    icon={<SendOutlined />}
                    style={{
                      background: '#000',
                      borderColor: '#000',
                      color: '#fff',
                      height: 48,
                      fontSize: 16,
                      fontWeight: 500
                    }}
                  >
                    {isConnecting ? 'Đang kết nối...' : 'Kết nối Telegram Bot'}
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </Card>
      </div>
    </PageContainer>
  );
} 