"use client";

import { Modal, Button, Typography, Space } from 'antd';
import { InfoCircleOutlined, BulbOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Welcome to AStudy!</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="understand" type="primary" size="large" onClick={onClose}>
          I Understand
        </Button>
      ]}
      centered
      maskClosable={false}
      closable={true}
      destroyOnClose
      width={600}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #bae6fd'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <BulbOutlined style={{ color: '#0ea5e9', fontSize: '24px', marginTop: '4px' }} />
            <div>
              <Title level={4} style={{ margin: '0 0 12px 0', color: '#0c4a6e' }}>
                This is an AI-powered learning website
              </Title>
              <Paragraph style={{ margin: '0 0 16px 0', fontSize: '15px', lineHeight: '1.6', color: '#0c4a6e' }}>
                AI will generate learning questions based on your prompt requirements. 
                The quality of lessons and questions will depend partly on the prompt you provide.
              </Paragraph>
              <div style={{ 
                background: '#fff', 
                padding: '12px', 
                borderRadius: '8px',
                border: '1px solid #7dd3fc'
              }}>
                <Paragraph style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#0369a1'
                }}>
                  💡 Tip: Write detailed and specific prompts to achieve the best results!
                </Paragraph>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '0 8px' }}>
          <Title level={5} style={{ margin: '0 0 12px 0', color: '#374151' }}>
            How to use effectively:
          </Title>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#6b7280'
          }}>
            <li>Write clear, specific prompts about the topic you want to learn</li>
            <li>Describe in detail the difficulty level and type of questions you want</li>
            <li>Specify the learning style that suits you</li>
            <li>Use accurate keywords so AI understands your intent correctly</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
