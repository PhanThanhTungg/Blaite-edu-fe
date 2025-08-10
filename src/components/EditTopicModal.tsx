'use client';

import { Modal, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import TopicForm from './TopicForm';
import { getTopic } from '@/services/topic.service';

interface TopicData {
  id: string | number;
  name: string;
  prompt?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
}

interface EditTopicModalProps {
  open: boolean;
  topic: any;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function EditTopicModal({ open, topic, onCancel, onSuccess }: EditTopicModalProps) {
  const handleCancel = () => {
    onCancel();
  };

  // Fetch topic details when modal opens
  const {
    data: topicData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['topic', topic?.id],
    queryFn: () => getTopic(topic?.id as string),
    enabled: open && !!topic?.id,
  });

  if (!topic) {
    return null;
  }

  if (isLoading) {
    return (
      <Modal
        title="Edit Topic"
        open={open}
        onCancel={handleCancel}
        footer={null}
        maskClosable={true}
        closable={true}
        destroyOnHidden
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        title="Edit Topic"
        open={open}
        onCancel={handleCancel}
        footer={null}
        maskClosable={true}
        closable={true}
        destroyOnHidden
      >
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          Failed to load topic data. Please try again.
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Edit Topic"
      open={open}
      onCancel={handleCancel}
      footer={null}
      maskClosable={true}
      closable={true}
      destroyOnHidden
    >
      <TopicForm
        mode="edit"
        topicId={topic.id}
        initialValues={{
          name: topicData?.name || topic.name,
          description: topicData?.prompt || '',
        }}
        onSuccess={onSuccess}
        onCancel={handleCancel}
      />
    </Modal>
  );
} 