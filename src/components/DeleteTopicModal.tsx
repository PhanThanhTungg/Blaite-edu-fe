"use client";

import { Modal, Typography } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import api from "@/hooks/api";

const { Text } = Typography;

interface DeleteTopicModalProps {
  open: boolean;
  topicId: number | null;
  topicName: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function DeleteTopicModal({
  open,
  topicId,
  topicName,
  onCancel,
  onSuccess,
}: DeleteTopicModalProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // TODO: Thay thế các chỗ gọi serverActions.deleteTopic bằng API tương ứng khi đã có.
  const deleteTopicMutation = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/topics/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      message.success("Topic deleted successfully!");
      onSuccess?.();
    },
    onError: () => {
      message.error("Failed to delete topic.");
    },
  });

  const handleDelete = async () => {
    if (topicId) {
      await deleteTopicMutation.mutateAsync(topicId);
    }
  };

  return (
    <Modal
      title="Delete Topic"
      open={open}
      onCancel={onCancel}
      onOk={handleDelete}
      okText="Delete"
      cancelText="Cancel"
      okType="danger"
      confirmLoading={deleteTopicMutation.isPending}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Text>
          Are you sure you want to delete the topic{" "}
          <Text strong>&quot;{topicName}&quot;</Text>?
        </Text>
      </div>
      <Text type="secondary">
        This action cannot be undone. All knowledges, questions, and answers
        associated with this topic will be permanently deleted.
      </Text>
    </Modal>
  );
}
