'use client';

import { PageContainer as AntPageContainer } from '@ant-design/pro-components';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Breadcrumb } from 'antd';
import Link from 'next/link';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subTitle?: string;
  header?: any;
  className?: string;
  breadcrumb?: any;
}

export default function PageContainer({
  children,
  title,
  subTitle,
  header,
  className = '',
  breadcrumb: breadcrumbProp,
}: PageContainerProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumb from pathname if not provided
  const generateBreadcrumb = (): BreadcrumbItemType[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItemType[] = [
      {
        title: 'Home',
        path: '/',
      },
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const title = path.charAt(0).toUpperCase() + path.slice(1);
      
      breadcrumbItems.push({
        title,
        path: currentPath,
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = breadcrumbProp?.items || generateBreadcrumb();

  // Nếu là trang chủ thì không render breadcrumb
  const isHome = pathname === '/';

  return (
    <AntPageContainer
      title={title}
      subTitle={subTitle}
      header={header}
      className={className}
    >
      {breadcrumbProp !== false && !isHome && (
        <div style={{ marginBottom: '8px' }}>
          <Breadcrumb
            items={breadcrumbItems}
            style={{
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          />
          <style jsx>{`
            :global(.ant-breadcrumb-link) {
              max-width: 200px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              display: inline-block;
            }
            :global(.ant-breadcrumb-separator) {
              margin: 0 8px;
            }
          `}</style>
        </div>
      )}
      {children}
    </AntPageContainer>
  );
} 