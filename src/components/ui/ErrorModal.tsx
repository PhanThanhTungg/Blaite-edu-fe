"use client";

import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ErrorModalProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ 
  open, 
  title = "Error", 
  message, 
  onClose 
}: ErrorModalProps) {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
          <span style={{ color: '#ff4d4f' }}>{title}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="ok" type="primary" onClick={onClose}>
          OK
        </Button>
      ]}
      centered
      maskClosable={true}
      closable={true}
      destroyOnClose
      width={400}
    >
      <div style={{ padding: '16px 0' }}>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
}
