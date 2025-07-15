'use client';

import { Modal, Typography } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serverActions } from '@/hooks/useServerActions';
import { App } from 'antd';

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
  onSuccess 
}: DeleteTopicModalProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const deleteTopicMutation = useMutation({
    mutationFn: serverActions.deleteTopic,
    onSuccess: () => {
      message.success('Topic deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess?.();
    },
    onError: (error) => {
      message.error('Failed to delete topic. Please try again.');
      console.error('Error deleting topic:', error);
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
          Are you sure you want to delete the topic <Text strong>"{topicName}"</Text>?
        </Text>
      </div>
      <Text type="secondary">
        This action cannot be undone. All knowledges, questions, and answers associated with this topic will be permanently deleted.
      </Text>
    </Modal>
  );
} 