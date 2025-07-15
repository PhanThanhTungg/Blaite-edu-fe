'use client';

import { Card, Typography, Tag, Space, Button, Tooltip, Descriptions, Popconfirm, Dropdown, Menu, Switch, Divider } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  MoreOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation'

const { Text } = Typography;

interface KnowledgeCardProps {
  knowledge: {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    topicId: number;
    questionsCount?: number;
    answersCount?: number;
    avgScore?: number;
  };
  onView?: (knowledge: any) => void;
  onEdit?: (knowledge: any) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: (id: number, status: string) => void;
  className?: string;
}

export default function KnowledgeCard({
  knowledge,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  className = ""
}: KnowledgeCardProps) {
  const router = useRouter();
  // Truncate content for display
  const truncatedContent = knowledge.content.length > 100 
    ? knowledge.content.substring(0, 100) + '...' 
    : knowledge.content;

  // Status switch handler
  const handleStatusToggle = () => {
    if (onStatusChange) {
      onStatusChange(knowledge.id, 'Active')
    }
  }

  return (
    <Card
      className={className}
      styles={{ body: { paddingBottom: 12 } }}
      variant='outlined'
      style={{ borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2' }}
      title={<Text strong style={{ fontSize: 16 }}>Knowledge #{knowledge.id}</Text>}
      extra={
        <Switch
          checked={true}
          size="small"
          onChange={handleStatusToggle}
        />
      }
    >
      {/* Content preview */}
      <div style={{ marginBottom: 12 }}>
        <Text>{truncatedContent}</Text>
      </div>

      {/* Số liệu chính và thông tin phụ trong body, dùng Descriptions 1 cột */}
      <Descriptions
        column={1}
        size="middle"
        style={{ marginBottom: 12, marginTop: 4 }}
        labelStyle={{ fontWeight: 500, color: '#888' }}
        contentStyle={{ fontWeight: 600, fontSize: 16, textAlign: 'right' }}
      >
        <Descriptions.Item label="Questions">
          {knowledge.questionsCount || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Answers">
          {knowledge.answersCount || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Avg Score">
          {knowledge.avgScore || 0}%
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          <Text>{new Date(knowledge.createdAt).toLocaleDateString()}</Text>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 12, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tooltip title="Luyện tập">
          <Button
            type="text"
            icon={<ThunderboltOutlined />}
            size="small"
            onClick={() => router.push(`/dashboard/topics/${knowledge.topicId}/knowledges/${knowledge.id}/practice`)}
          />
        </Tooltip>
        <Divider type="vertical" style={{ height: 18, margin: '0 4px' }} />
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={onView ? () => onView(knowledge) : undefined}
            disabled={!onView}
          />
        </Tooltip>
        <Divider type="vertical" style={{ height: 18, margin: '0 4px' }} />
        <Tooltip title="Add Questions">
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            size="small"
            // onClick={() => ...}
            disabled
          />
        </Tooltip>
        <Divider type="vertical" style={{ height: 18, margin: '0 4px' }} />
        <Tooltip title="Edit Knowledge">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={onEdit ? () => onEdit(knowledge) : undefined}
            disabled={!onEdit}
          />
        </Tooltip>
        <Divider type="vertical" style={{ height: 18, margin: '0 4px' }} />
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="duplicate">Duplicate</Menu.Item>
              <Menu.Item key="export">Export</Menu.Item>
            </Menu>
          }
          trigger={['click']}
          placement="bottomRight"
        >
          <Tooltip title="More">
            <Button
              type="text"
              icon={<MoreOutlined />}
              size="small"
            />
          </Tooltip>
        </Dropdown>
        <Divider type="vertical" style={{ height: 18, margin: '0 4px' }} />
        <Tooltip title="Delete Knowledge">
          <span>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={onDelete ? () => onDelete(knowledge.id) : undefined}
              disabled={!onDelete}
            />
          </span>
        </Tooltip>
      </div>
    </Card>
  );
} 