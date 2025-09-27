"use client";

import { Modal, Typography } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { deleteKnowledge } from "@/services/knowledge.service";
import { getContextualErrorMessage } from "@/lib/utils/error.utils";

const { Text } = Typography;

interface DeleteKnowledgeModalProps {
  open: boolean;
  knowledgeId: string | number | null;
  knowledgeContent: string;
  topicId: string;
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

  const deleteKnowledgeMutation = useMutation({
    mutationFn: (id: string | number) => deleteKnowledge(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledges", topicId] });
      queryClient.invalidateQueries({
        queryKey: ["topic-knowledges", topicId],
      });
      message.success("Knowledge deleted successfully!");
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = getContextualErrorMessage(error, 'deleting knowledge');
      message.error(errorMessage);
      console.error('Error deleting knowledge:', error);
    },
  });

  const handleDelete = async () => {
    if (knowledgeId) {
      await deleteKnowledgeMutation.mutateAsync(knowledgeId);
    }
  };

  // Truncate content for display
  const truncatedContent = knowledgeContent 
    ? (knowledgeContent.length > 50
        ? knowledgeContent.substring(0, 50) + "..."
        : knowledgeContent)
    : "No content available";

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
          backgroundColor: "var(--ant-color-fill-quaternary)",
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
