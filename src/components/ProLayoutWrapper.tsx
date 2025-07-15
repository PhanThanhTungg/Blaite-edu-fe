'use client';

import { ProLayout } from '@ant-design/pro-components'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

interface ProLayoutWrapperProps {
  children: React.ReactNode
}

export default function ProLayoutWrapper({ children }: ProLayoutWrapperProps) {
  const pathname = usePathname()

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
          height: '100%'
        }}>
          <UserButton />
        </div>
      )}
    >
      {children}
    </ProLayout>
  )
} 