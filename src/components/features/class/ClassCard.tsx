'use client';

import { Card, Button, Space, Typography, Progress, Switch, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface ClassCardProps {
  class: {
    id: string;
    name: string;
    prompt?: string;
    status?: string;
    topicsCount?: number;
    knowledgesCount?: number;
    questionsCount?: number;
    avgScore?: number;
    lastActive?: string;
  };
  onView: (classItem: any) => void;
  onEdit: (classItem: any) => void;
  onDelete: (classId: string) => void;
  onStatusChange?: (classId: string, status: string) => void;
}

export default function ClassCard({ class: classItem, onView, onEdit, onDelete, onStatusChange }: ClassCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  // Status switch handler
  const handleStatusToggle = (checked: boolean) => {
    if (onStatusChange) {
      const newStatus = checked ? "active" : "inactive";
      onStatusChange(classItem.id, newStatus);
    }
  };

  return (
    <Card
      hoverable
      className="h-full"
      bordered={false}
      styles={{ 
        body: {
          padding: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      actions={[
        <Button
          key="view"
          type="text"
          icon={<EyeOutlined />}
          onClick={() => onView(classItem)}
        >
          View
        </Button>,
        <Button
          key="edit"
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit(classItem)}
        >
          Edit
        </Button>,
        <Button
          key="delete"
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(classItem.id)}
        >
          Delete
        </Button>,
      ]}
    >
      {/* Header với tên class và toggle */}
      <div className="mb-4">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 8 
        }}>
          <Title level={4} style={{ margin: 0, marginBottom: 8, flex: 1 }}>
            {classItem.name}
          </Title>
          {onStatusChange && (
            <Switch
              checked={classItem.status === "active"}
              size="small"
              onChange={handleStatusToggle}
            />
          )}
        </div>
        {classItem.prompt && (
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {classItem.prompt}
          </Text>
        )}
      </div>

      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div className="flex justify-between items-center">
          <Text type="secondary">Topics:</Text>
          <Text strong>{classItem.topicsCount || 0}</Text>
        </div>
        
        <div className="flex justify-between items-center">
          <Text type="secondary">Knowledges:</Text>
          <Text strong>{classItem.knowledgesCount || 0}</Text>
        </div>
        
        <div className="flex justify-between items-center">
          <Text type="secondary">Questions:</Text>
          <Text strong>{classItem.questionsCount || 0}</Text>
        </div>

        {classItem.avgScore !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Text type="secondary">Avg Score:</Text>
              <Text strong style={{ color: getScoreColor(classItem.avgScore) }}>
                {classItem.avgScore}%
              </Text>
            </div>
            <Progress
              percent={classItem.avgScore}
              strokeColor={getScoreColor(classItem.avgScore)}
              showInfo={false}
              size="small"
            />
          </div>
        )}

        {classItem.status && (
          <div className="flex justify-between items-center">
            <Text type="secondary">Status:</Text>
            <Tag color={classItem.status === "active" ? "green" : "red"}>
              {classItem.status === "active" ? "Active" : "Inactive"}
            </Tag>
          </div>
        )}

        {classItem.lastActive && (
          <div className="flex justify-between items-center">
            <Text type="secondary">Last Active:</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {new Date(classItem.lastActive).toLocaleDateString()}
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
} 