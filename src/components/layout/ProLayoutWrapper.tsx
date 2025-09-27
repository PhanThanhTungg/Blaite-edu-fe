'use client';

import { ProLayout } from '@ant-design/pro-components'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Dropdown, Button, Switch } from 'antd'
import { DownOutlined, SettingOutlined, BulbOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useEffect } from 'react'
import { useTheme } from '@/components/providers/HappyThemeProvider'
import Footer from './Footer'

interface ProLayoutWrapperProps {
  children: React.ReactNode
}

export default function ProLayoutWrapper({ children }: ProLayoutWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { colorScheme, toggleTheme } = useTheme()

  // Add click handler to title after component mounts
  useEffect(() => {
    let titleElement: HTMLElement | null = null;
    let clickHandler: (() => void) | null = null;
    
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
      toggleTheme();
    }
  };

  // Menu items
  const menuItems: MenuProps['items'] = [
    {
      key: 'teleSetup',
      label: 'Bot Setup',
      icon: <SettingOutlined />,
    },
    {
      key: 'darkMode',
      label: (
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
            checked={colorScheme === 'dark'}
            onChange={toggleTheme}
          />
        </div>
      ),
      icon: <BulbOutlined />,
    },
  ];

  return (
    <>
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
        <div style={{ paddingBottom: '60px' }}>
          {children}
        </div>
      </ProLayout>
      <Footer />
    </>
  )
} 