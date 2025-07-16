"use client";

import { Modal, Typography } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import api from "@/hooks/api";

const { Text } = Typography;

interface DeleteKnowledgeModalProps {
  open: boolean;
  knowledgeId: number | null;
  knowledgeContent: string;
  topicId: number;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function DeleteKnowledgeModal({
  open,
  knowledgeId,
  knowledgeContent,
  topicId,
  onCancel,
  onSuccess,
}: DeleteKnowledgeModalProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // TODO: Thay thế các chỗ gọi serverActions.deleteKnowledge bằng API tương ứng khi đã có.
  const deleteKnowledgeMutation = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/knowledge/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledges", topicId] });
      queryClient.invalidateQueries({
        queryKey: ["topic-knowledges", topicId],
      });
      message.success("Knowledge deleted successfully!");
      onSuccess?.();
    },
    onError: () => {
      message.error("Failed to delete knowledge.");
    },
  });

  const handleDelete = async () => {
    if (knowledgeId) {
      await deleteKnowledgeMutation.mutateAsync(knowledgeId);
    }
  };

  // Truncate content for display
  const truncatedContent =
    knowledgeContent.length > 50
      ? knowledgeContent.substring(0, 50) + "..."
      : knowledgeContent;

  return (
    <Modal
      title="Delete Knowledge"
      open={open}
      onCancel={onCancel}
      onOk={handleDelete}
      okText="Delete"
      cancelText="Cancel"
      okType="danger"
      confirmLoading={deleteKnowledgeMutation.isPending}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <Text>Are you sure you want to delete this knowledge?</Text>
      </div>
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          backgroundColor: "#f5f5f5",
          borderRadius: 6,
        }}
      >
        <Text type="secondary" style={{ fontStyle: "italic" }}>
          &quot;{truncatedContent}&quot;
        </Text>
      </div>
      <Text type="secondary">
        This action cannot be undone. All questions and answers associated with
        this knowledge will be permanently deleted.
      </Text>
    </Modal>
  );
}
