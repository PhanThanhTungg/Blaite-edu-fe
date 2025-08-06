'use client';

import { Card } from 'antd';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  suffix?: string;
  className?: string;
  icon?: ReactNode;
  iconColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  prefix, 
  suffix, 
  className = "",
  icon,
  iconColor = "#1677ff"
}: StatsCardProps) {
  return (
    <Card className={className} styles={{ body: { padding: 16 } }}>
      <div className="font-medium text-gray-400 text-sm mb-3">{title}</div>
      <div className="flex justify-between items-center w-full">
        {icon && (
          <span className="text-2xl" style={{ color: iconColor }}>{icon}</span>
        )}
        <div className="flex items-baseline">
          {prefix && <span className="text-lg mr-1" style={{ color: iconColor }}>{prefix}</span>}
          <span className="text-2xl font-bold" style={{ color: iconColor }}>{value}</span>
          {suffix && <span className="text-xs text-gray-400 ml-1">{suffix}</span>}
        </div>
      </div>
    </Card>
  );
} 