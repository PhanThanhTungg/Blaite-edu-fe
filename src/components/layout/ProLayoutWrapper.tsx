'use client';

import { ProLayout } from '@ant-design/pro-components'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Dropdown, Button, message } from 'antd'
import { DownOutlined, SettingOutlined, BulbOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useEffect } from 'react'

interface ProLayoutWrapperProps {
  children: React.ReactNode
}

export default function ProLayoutWrapper({ children }: ProLayoutWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Add click handler to title after component mounts
  useEffect(() => {
    let titleElement = null;
    let clickHandler = null;
    
    // Wait for DOM to be ready then find title element
    const timer = setTimeout(() => {
      // Try multiple possible selectors for the title
      const selectors = [
        '.ant-pro-layout-page-header-title',
        '.ant-pro-layout-page-header .ant-typography',
        '.ant-pro-layout-header .ant-pro-layout-header-content .ant-pro-layout-header-title',
        '[class*="title"]',
        'h1'
      ];
      
      for (const selector of selectors) {
        titleElement = document.querySelector(selector);
        if (titleElement && titleElement.textContent?.includes('AStudy')) {
          break;
        }
      }
      
      if (titleElement) {
        titleElement.style.cursor = 'pointer';
        clickHandler = () => {
          router.push('/dashboard');
        };
        titleElement.addEventListener('click', clickHandler);
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (titleElement && clickHandler) {
        titleElement.removeEventListener('click', clickHandler);
      }
    };
  }, [router, pathname]);

  // Handle menu clicks
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'teleSetup') {
      router.push('/dashboard/tele');
    } else if (e.key === 'darkMode') {
      message.info('Dark Mode - Chức năng đang phát triển');
      // TODO: Implement dark mode toggle
    }
  };

  // Menu items
  const menuItems: MenuProps['items'] = [
    {
      key: 'teleSetup',
      label: 'Telegram Setup',
      icon: <SettingOutlined />,
    },
    {
      key: 'darkMode',
      label: 'Dark Mode',
      icon: <BulbOutlined />,
    },
  ];

  return (
    <ProLayout
      title="AStudy"
      location={{
        pathname,
      }}
      layout="top"
      rightContentRender={() => (
        <div style={{ 
          marginRight: 16,
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          gap: 8
        }}>
          <UserButton />
          <Dropdown
            menu={{ 
              items: menuItems,
              onClick: handleMenuClick 
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button 
              type="text" 
              icon={<DownOutlined />}
              style={{
                border: 'none',
                boxShadow: 'none',
                color: '#666'
              }}
            />
          </Dropdown>
        </div>
      )}
    >
      {children}
    </ProLayout>
  )
} 