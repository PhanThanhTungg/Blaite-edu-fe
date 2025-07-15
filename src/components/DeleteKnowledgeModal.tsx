'use client';

import { Modal, Typography } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serverActions } from '@/hooks/useServerActions';
import { App } from 'antd';

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
  onSuccess 
}: DeleteKnowledgeModalProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const deleteKnowledgeMutation = useMutation({
    mutationFn: serverActions.deleteKnowledge,
    onSuccess: () => {
      message.success('Knowledge deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['knowledges', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topic-knowledges', topicId] });
      onSuccess?.();
    },
    onError: (error) => {
      message.error('Failed to delete knowledge. Please try again.');
      console.error('Error deleting knowledge:', error);
    },
  });

  const handleDelete = async () => {
    if (knowledgeId) {
      await deleteKnowledgeMutation.mutateAsync(knowledgeId);
    }
  };

  // Truncate content for display
  const truncatedContent = knowledgeContent.length > 50 
    ? knowledgeContent.substring(0, 50) + '...' 
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
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Text>
          Are you sure you want to delete this knowledge?
        </Text>
      </div>
      <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
        <Text type="secondary" style={{ fontStyle: 'italic' }}>
          "{truncatedContent}"
        </Text>
      </div>
      <Text type="secondary">
        This action cannot be undone. All questions and answers associated with this knowledge will be permanently deleted.
      </Text>
    </Modal>
  );
} 