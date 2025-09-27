"use client";

import { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Form, Input, Typography, Space, Alert, Divider, Tag, Row, Col, InputNumber, Descriptions, Select } from 'antd';
import { RobotOutlined, SendOutlined, CheckCircleOutlined, InfoCircleOutlined, ClockCircleOutlined, SettingOutlined, ExclamationCircleOutlined, UserOutlined, QuestionCircleOutlined, BookOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/components/providers/HappyThemeProvider';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import { changeIntervalSendQuestion, setScheduleTypeQuestion } from '@/services/bot.service';

const { Title, Text, Paragraph } = Typography;

export default function TeleBotSetupPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isUpdatingInterval, setIsUpdatingInterval] = useState(false);
  const [tempInterval, setTempInterval] = useState<number | null>(null);
  
  // State for question type
  const [isUpdatingQuestionType, setIsUpdatingQuestionType] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<"theory" | "practice">("theory");

  const { user, refreshUser, isLoading: isUserLoading } = useUser();
  const { colorScheme } = useTheme();
  const { isLoaded: isClerkLoaded } = useAuth();

  // Load question type from localStorage when component mounts
  useEffect(() => {
    const savedQuestionType = localStorage.getItem('botQuestionType') as "theory" | "practice";
    if (savedQuestionType && (savedQuestionType === "theory" || savedQuestionType === "practice")) {
      setSelectedQuestionType(savedQuestionType);
    }
  }, []);

  const handleConnect = async (values: any) => {
    // Double check user data is available
    if (!user?.id) {
      toast.error('Please wait for user data to load, or try refreshing the page');
      return;
    }
    
    const linkDirectToTelegram = `https://t.me/${process.env.NEXT_PUBLIC_BOT_TELE_NAME}?start=${user.id}`;
    window.open(linkDirectToTelegram, '_blank');
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      toast.success('Status refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing status:', error);
      toast.error('Error refreshing status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleIntervalChange = async (value: number | null) => {
    if (value && value !== user?.intervalSendMessage) {
      try {
        setIsUpdatingInterval(true);
        await changeIntervalSendQuestion(value);
        toast.success('Interval updated successfully!');
        await refreshUser(); // Refresh user data
        setTempInterval(null); // Reset temp value after successful save
      } catch (error) {
        console.error('Error updating interval:', error);
        toast.error('Error occurred while updating interval');
        // Reset to old value if error occurs
        setTempInterval(user?.intervalSendMessage || 60);
      } finally {
        setIsUpdatingInterval(false);
      }
    }
  };

  // Handler for question type change
  const handleQuestionTypeChange = async (questionType: "theory" | "practice") => {
    if (questionType !== selectedQuestionType) {
      try {
        setIsUpdatingQuestionType(true);
        await setScheduleTypeQuestion({ typeQuestion: questionType });
        setSelectedQuestionType(questionType);
        localStorage.setItem('botQuestionType', questionType);
        toast.success(`Question type "${questionType === 'theory' ? 'Theory' : 'Practice'}" set for bot successfully!`);
      } catch (error) {
        console.error('Error updating question type:', error);
        toast.error('Error occurred while updating question type');
      } finally {
        setIsUpdatingQuestionType(false);
      }
    }
  };

  // Show loading state while Clerk or user data is being fetched
  if (!isClerkLoaded || isUserLoading) {
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
          background: colorScheme === 'dark' ? '#141414' : '#f5f5f5',
          minHeight: '100vh',
          padding: '24px'
        }}
      >
        <div style={{ 
          maxWidth: 800, 
          margin: '0 auto',
          background: colorScheme === 'dark' ? '#1f1f1f' : '#ffffff',
          borderRadius: '8px',
          boxShadow: colorScheme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: colorScheme === 'dark' ? '#303030' : '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <RobotOutlined style={{ fontSize: 24, color: colorScheme === 'dark' ? '#fff' : '#666' }} />
          </div>
          <Title level={2} style={{ color: colorScheme === 'dark' ? '#fff' : '#333', margin: '0 0 8px 0', fontSize: 24 }}>
            Loading Bot Setup...
          </Title>
          <Text style={{ color: colorScheme === 'dark' ? '#ccc' : '#666', fontSize: 14 }}>
            Please wait while we load your bot configuration
          </Text>
        </div>
      </PageContainer>
    );
  }

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
        background: colorScheme === 'dark' ? '#141414' : '#f5f5f5',
        minHeight: '100vh',
        padding: '24px'
      }}
    >
      <div style={{ 
        maxWidth: 800, 
        margin: '0 auto',
        background: colorScheme === 'dark' ? '#1f1f1f' : '#ffffff',
        borderRadius: '8px',
        boxShadow: colorScheme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header Section */}
        <div style={{
          background: colorScheme === 'dark' ? '#1f1f1f' : '#ffffff',
          padding: '32px',
          textAlign: 'center',
          borderBottom: `1px solid ${colorScheme === 'dark' ? '#303030' : '#e8e8e8'}`
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: colorScheme === 'dark' ? '#303030' : '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <RobotOutlined style={{ fontSize: 24, color: colorScheme === 'dark' ? '#fff' : '#666' }} />
          </div>
          <Title level={2} style={{ color: colorScheme === 'dark' ? '#fff' : '#333', margin: '0 0 8px 0', fontSize: 24 }}>
            Telegram Bot Setup
          </Title>
          <Text style={{ color: colorScheme === 'dark' ? '#ccc' : '#666', fontSize: 14 }}>
            Connect your bot to receive notifications and interact with the learning system
          </Text>
        </div>

        {/* Content Section */}
        <div style={{ padding: '40px' }}>
          {/* Connection Status Card */}
          <div style={{
            background: colorScheme === 'dark' ? '#262626' : '#fafafa',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '24px',
            border: `1px solid ${colorScheme === 'dark' ? '#303030' : '#e8e8e8'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: user?.telegramId ? '#52c41a' : '#ff4d4f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  {user?.telegramId ? (
                    <CheckCircleOutlined style={{ fontSize: 16, color: 'white' }} />
                  ) : (
                    <ExclamationCircleOutlined style={{ fontSize: 16, color: 'white' }} />
                  )}
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, fontSize: 16, color: colorScheme === 'dark' ? '#fff' : '#333' }}>
                    {user?.telegramId ? 'Bot Connected' : 'Bot Not Connected'}
                  </Title>
                  <Text style={{ color: colorScheme === 'dark' ? '#ccc' : '#666', fontSize: 12 }}>
                    {user?.telegramId 
                      ? `Connected as: ${user.telegramId}` 
                      : 'Connect your Telegram bot to get started'
                    }
                  </Text>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="default"
                  size="middle"
                  onClick={handleRefreshStatus}
                  loading={isRefreshing}
                  icon={<ReloadOutlined />}
                  style={{
                    background: colorScheme === 'dark' ? '#262626' : '#fff',
                    borderColor: colorScheme === 'dark' ? '#303030' : '#d9d9d9',
                    color: colorScheme === 'dark' ? '#fff' : '#666',
                    height: 32,
                    fontSize: 12,
                    borderRadius: 4
                  }}
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                
                {!user?.telegramId ? (
                  <Button
                    type="primary"
                    size="middle"
                    onClick={handleConnect}
                    loading={isConnecting}
                    icon={<SendOutlined />}
                    style={{
                      background: '#1890ff',
                      borderColor: '#1890ff',
                      color: 'white',
                      height: 32,
                      fontSize: 12,
                      borderRadius: 4
                    }}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Bot'}
                  </Button>
                ) : (
                  <Button
                    type="default"
                    size="middle"
                    onClick={handleConnect}
                    style={{
                      background: colorScheme === 'dark' ? '#262626' : '#fff',
                      borderColor: colorScheme === 'dark' ? '#303030' : '#d9d9d9',
                      color: colorScheme === 'dark' ? '#fff' : '#666',
                      height: 32,
                      fontSize: 12,
                      borderRadius: 4
                    }}
                  >
                    Connect New Bot
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Settings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Telegram ID */}
            <div style={{
              background: colorScheme === 'dark' ? '#262626' : '#fafafa',
              borderRadius: '6px',
              padding: '16px',
              border: `1px solid ${colorScheme === 'dark' ? '#303030' : '#e8e8e8'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <UserOutlined style={{ fontSize: 16, color: colorScheme === 'dark' ? '#fff' : '#666', marginRight: '8px' }} />
                <Title level={5} style={{ margin: 0, fontSize: 14, color: colorScheme === 'dark' ? '#fff' : '#333' }}>
                  Telegram ID
                </Title>
              </div>
              
              <div style={{
                background: colorScheme === 'dark' ? '#1f1f1f' : 'white',
                borderRadius: '4px',
                padding: '12px',
                border: `1px solid ${colorScheme === 'dark' ? '#303030' : '#d9d9d9'}`,
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: 13,
                color: user?.telegramId ? (colorScheme === 'dark' ? '#fff' : '#333') : (colorScheme === 'dark' ? '#999' : '#999')
              }}>
                <Text copyable={!!user?.telegramId}>
                  {user?.telegramId || 'Not connected to telegram bot'}
                </Text>
              </div>
            </div>

            {/* Message Interval */}
            <div style={{
              background: colorScheme === 'dark' ? '#262626' : '#fafafa',
              borderRadius: '6px',
              padding: '16px',
              border: `1px solid ${colorScheme === 'dark' ? '#303030' : '#e8e8e8'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <ClockCircleOutlined style={{ fontSize: 16, color: colorScheme === 'dark' ? '#fff' : '#666', marginRight: '8px' }} />
                <Title level={5} style={{ margin: 0, fontSize: 14, color: colorScheme === 'dark' ? '#fff' : '#333' }}>
                  Message Interval
                </Title>
              </div>
              
              <div style={{
                background: colorScheme === 'dark' ? '#1f1f1f' : 'white',
                borderRadius: '4px',
                padding: '8px',
                border: `1px solid ${colorScheme === 'dark' ? '#303030' : '#d9d9d9'}`,
                marginBottom: '8px'
              }}>
                <InputNumber
                  value={tempInterval !== null ? tempInterval : (user?.intervalSendMessage || 0)}
                  onChange={(value) => setTempInterval(value)}
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
                  disabled={!user?.telegramId || isUpdatingInterval}
                  addonAfter="minutes"
                  style={{
                    width: '100%',
                    border: 'none',
                    fontSize: 14,
                    background: 'transparent',
                    boxShadow: 'none',
                    color: colorScheme === 'dark' ? '#fff' : '#333'
                  }}
                  placeholder="Enter minutes"
                />
              </div>
              
              {isUpdatingInterval && (
                <Text style={{ fontSize: 12, color: '#1890ff', display: 'block', marginBottom: '4px' }}>
                  Updating...
                </Text>
              )}
              <Text style={{ fontSize: 11, color: colorScheme === 'dark' ? '#999' : '#999' }}>
                Press Enter or click outside to save 
              </Text>
            </div>

            {/* Question Type */}
            <div style={{
              background: colorScheme === 'dark' ? '#262626' : '#fafafa',
              borderRadius: '6px',
              padding: '16px',
              border: `1px solid ${colorScheme === 'dark' ? '#303030' : '#e8e8e8'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <QuestionCircleOutlined style={{ fontSize: 16, color: colorScheme === 'dark' ? '#fff' : '#666', marginRight: '8px' }} />
                <Title level={5} style={{ margin: 0, fontSize: 14, color: colorScheme === 'dark' ? '#fff' : '#333' }}>
                  Question Type
                </Title>
              </div>
              
              <div style={{
                background: colorScheme === 'dark' ? '#1f1f1f' : 'white',
                borderRadius: '4px',
                padding: '8px',
                border: `1px solid ${colorScheme === 'dark' ? '#303030' : '#d9d9d9'}`,
                marginBottom: '8px'
              }}>
                <Select
                  value={selectedQuestionType}
                  onChange={handleQuestionTypeChange}
                  disabled={!user?.telegramId || isUpdatingQuestionType}
                  loading={isUpdatingQuestionType}
                  style={{
                    width: '100%',
                    border: 'none',
                    fontSize: 14,
                    background: 'transparent',
                    boxShadow: 'none',
                    color: colorScheme === 'dark' ? '#fff' : '#333'
                  }}
                  size="middle"
                  options={[
                    { value: 'theory', label: '📖 Theory Questions', style: { fontSize: 14 } },
                    { value: 'practice', label: '🎯 Practice Questions', style: { fontSize: 14 } }
                  ]}
                />
              </div>
              
              {isUpdatingQuestionType && (
                <Text style={{ fontSize: 12, color: '#1890ff', display: 'block', marginBottom: '4px' }}>
                  Updating...
                </Text>
              )}
              <Text style={{ fontSize: 11, color: colorScheme === 'dark' ? '#999' : '#999' }}>
                Select the type of questions the bot will send periodically
              </Text>
            </div>

            {/* Knowledge ID */}
            <div style={{
              background: colorScheme === 'dark' ? '#262626' : '#fafafa',
              borderRadius: '6px',
              padding: '16px',
              border: `1px solid ${colorScheme === 'dark' ? '#303030' : '#e8e8e8'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <BookOutlined style={{ fontSize: 16, color: colorScheme === 'dark' ? '#fff' : '#666', marginRight: '8px' }} />
                <Title level={5} style={{ margin: 0, fontSize: 14, color: colorScheme === 'dark' ? '#fff' : '#333' }}>
                  Knowledge ID
                </Title>
              </div>
              
              <div style={{
                background: colorScheme === 'dark' ? '#1f1f1f' : 'white',
                borderRadius: '4px',
                padding: '12px',
                border: `1px solid ${colorScheme === 'dark' ? '#303030' : '#d9d9d9'}`,
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: 13,
                color: user?.scheduleKnowledgeId ? (colorScheme === 'dark' ? '#fff' : '#333') : (colorScheme === 'dark' ? '#999' : '#999')
              }}>
                <Text copyable={!!user?.scheduleKnowledgesId}>
                  {user?.scheduleKnowledgesId || 'No study schedule set'}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 