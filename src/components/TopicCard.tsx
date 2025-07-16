"use client";

import {
  Card,
  Typography,
  Tag,
  Button,
  Tooltip,
  Descriptions,
  Dropdown,
  Menu,
  Switch,
  Divider,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getDifficultyColor } from "@/utils/helpers";

const { Text } = Typography;

interface TopicCardProps {
  topic: {
    id: number;
    title: string;
    description?: string;
    category?: string;
    difficulty?: string;
    status?: string;
    questionsGenerated: number;
    totalQuestions: number;
    avgScore: number;
    studyTime?: number;
    nextReview?: string;
  };
  onView?: (topic: any) => void;
  onEdit?: (topic: any) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: (id: number, status: string) => void;
  className?: string;
}

export default function TopicCard({
  topic,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  className = "",
}: TopicCardProps) {
  // Status switch handler
  const handleStatusToggle = () => {
    if (onStatusChange) {
      onStatusChange(
        topic.id,
        topic.status === "Active" ? "Inactive" : "Active"
      );
    }
  };

  return (
    <Card
      className={className}
      styles={{ body: { paddingBottom: 12 } }}
      variant="outlined"
      style={{ borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2" }}
      title={
        <Text strong style={{ fontSize: 16 }}>
          {topic.title}
        </Text>
      }
      extra={
        <Switch
          checked={topic.status === "Active"}
          size="small"
          onChange={handleStatusToggle}
        />
      }
    >
      {/* Số liệu chính và thông tin phụ trong body, dùng Descriptions 1 cột */}
      <Descriptions
        column={1}
        size="middle"
        style={{ marginBottom: 12, marginTop: 4 }}
        labelStyle={{ fontWeight: 500, color: "#888" }}
        contentStyle={{ fontWeight: 600, fontSize: 16, textAlign: "right" }}
      >
        <Descriptions.Item label="Questions">
          {topic.questionsGenerated} / {topic.totalQuestions}
        </Descriptions.Item>
        <Descriptions.Item label="Avg">{topic.avgScore}%</Descriptions.Item>
        <Descriptions.Item label="Time">{topic.studyTime}h</Descriptions.Item>
        <Descriptions.Item label="Difficulty">
          <Tag color={getDifficultyColor(topic.difficulty!)}>
            {topic.difficulty || "Not Set"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Next Review">
          <Text>{topic.nextReview || "Not Set"}</Text>
        </Descriptions.Item>
      </Descriptions>

      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          marginTop: 12,
          paddingTop: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={onView ? () => onView(topic) : undefined}
            disabled={!onView}
          />
        </Tooltip>
        <Divider type="vertical" style={{ height: 18, margin: "0 4px" }} />
        <Tooltip title="Edit Topic">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={onEdit ? () => onEdit(topic) : undefined}
            disabled={!onEdit}
          />
        </Tooltip>
        <Divider type="vertical" style={{ height: 18, margin: "0 4px" }} />
        <Tooltip title="Delete Topic">
          <span>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={onDelete ? () => onDelete(topic.id) : undefined}
              disabled={!onDelete}
            />
          </span>
        </Tooltip>
      </div>
    </Card>
  );
}
