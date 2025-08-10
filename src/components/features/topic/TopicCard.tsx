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
import { getDifficultyColor } from "@/helpers/common.helper";
import { useQueryClient } from "@tanstack/react-query";
import { getTopic } from "@/services/topic.service";
import { getKnowledges } from "@/services/knowledge.service";

const { Text } = Typography;

interface TopicCardProps {
  topic: {
    id: string | number;
    name: string;
    prompt?: string;
    status?: string;
    totalKnowledge?: number;
    totalQuestion?: number;
    avgScorePractice?: number | null;
    avgScoreTheory?: number | null;
    createdAt?: string;
    updatedAt?: string;
  };
  onView?: (topic: any) => void;
  onEdit?: (topic: any) => void;
  onDelete?: (id: string | number) => void;
  onStatusChange?: (id: string | number, status: string) => void;
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
  const queryClient = useQueryClient();

  // Prefetch data on hover
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['topic', topic.id],
      queryFn: () => getTopic(topic.id.toString()),
    });
    queryClient.prefetchQuery({
      queryKey: ['topic-knowledges', topic.id],
      queryFn: () => getKnowledges(topic.id.toString()),
    });
  };
  // Status switch handler
  const handleStatusToggle = (checked: boolean) => {
    if (onStatusChange) {
      const newStatus = checked ? "active" : "inactive";
      onStatusChange(topic.id, newStatus);
    }
  };

  // Calculate average score
  const getAverageScore = () => {
    const practice = topic.avgScorePractice || 0;
    const theory = topic.avgScoreTheory || 0;
    if (practice === 0 && theory === 0) return 0;
    if (practice === 0) return theory;
    if (theory === 0) return practice;
    return Math.round((practice + theory) / 2);
  };

  return (
    <Card
      className={className}
      styles={{ body: { paddingBottom: 12 } }}
      variant="outlined"
      style={{ borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2" }}
      onMouseEnter={handleMouseEnter}
      title={
        <Text strong style={{ fontSize: 16 }}>
          {topic.name}
        </Text>
      }
      extra={
        <Switch
          checked={topic.status === "active"}
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
        styles={{
          label: { fontWeight: 500, color: "#888" },
          content: { fontWeight: 600, fontSize: 16, textAlign: "right" }
        }}
      >
        <Descriptions.Item label="Knowledge">
          {topic.totalKnowledge || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Questions">
          {topic.totalQuestion || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Practice Score">
          {topic.avgScorePractice
            ? `${Number(topic.avgScorePractice).toFixed(2)}%`
            : "0.00%"}
        </Descriptions.Item>

        <Descriptions.Item label="Theory Score">
          {topic.avgScoreTheory
            ? `${Number(topic.avgScoreTheory).toFixed(2)}%`
            : "0.00%"}
        </Descriptions.Item>

        {/* <Descriptions.Item label="Avg Score">
          {getAverageScore()}%
        </Descriptions.Item> */}
        <Descriptions.Item label="Status">
          <Tag color={topic.status === "active" ? "green" : "red"}>
            {topic.status === "active" ? "Active" : "Inactive"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          <Text>{topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : "N/A"}</Text>
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
