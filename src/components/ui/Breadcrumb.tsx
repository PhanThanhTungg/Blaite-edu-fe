'use client';

import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumb from pathname if no items provided
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [
      {
        title: 'Home',
        href: '/',
        icon: <HomeOutlined />,
      },
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const title = path.charAt(0).toUpperCase() + path.slice(1);
      
      // Don't make the last item clickable
      const isLast = index === paths.length - 1;
      
      breadcrumbItems.push({
        title,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = items || generateBreadcrumbItems();

  return (
    <AntBreadcrumb className={`mb-4 ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <AntBreadcrumb.Item key={index}>
          {item.href ? (
            <Link href={item.href} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
              {item.icon && <span>{item.icon}</span>}
              <span>{item.title}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-gray-600">
              {item.icon && <span>{item.icon}</span>}
              <span>{item.title}</span>
            </span>
          )}
        </AntBreadcrumb.Item>
      ))}
    </AntBreadcrumb>
  );
} 