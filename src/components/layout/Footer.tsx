"use client";

import { Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTheme } from '@/components/providers/HappyThemeProvider';

export default function Footer() {
  const { colorScheme } = useTheme();

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: colorScheme === 'dark' ? '#141414' : '#fafafa',
      borderTop: `1px solid ${colorScheme === 'dark' ? '#303030' : '#e8e8e8'}`,
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <Alert
        message="Thông báo"
        description="Nền tảng đang trong quá trình thử nghiệm dùng API Gemini free, thỉnh thoảng sẽ có lỗi overload model, vui lòng thử lại nếu gặp lỗi"
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{
          fontSize: '12px',
          backgroundColor: colorScheme === 'dark' ? '#111b26' : '#e6f7ff',
          border: `1px solid ${colorScheme === 'dark' ? '#177ddc' : '#91d5ff'}`,
        }}
        banner
      />
    </div>
  );
}
