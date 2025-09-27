"use client";

import { Modal, Typography } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import api from "@/services/axios-customize.service";
import { getContextualErrorMessage } from "@/lib/utils/error.utils";

const { Text } = Typography;

interface DeleteTopicModalProps {
  open: boolean;
  topicId: string | number | null;
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

  const deleteTopicMutation = useMutation({
    mutationFn: (id: string | number) => {
      console.log('🔍 Deleting topic with ID:', id);
      return api.delete(`/topics/${id}`).then((res) => {
        console.log('🔍 Delete response:', res.data);
        return res.data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      message.success("Topic deleted successfully!");
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = getContextualErrorMessage(error, 'deleting topic');
      message.error(errorMessage);
      console.error('Error deleting topic:', error);
    },
  });

  const handleDelete = async () => {
    console.log('🔍 Handle delete called with topicId:', topicId);
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
      destroyOnHidden
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
