'use client';

import { Modal } from 'antd';
import TopicForm from './TopicForm';

interface TopicData {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

interface EditTopicModalProps {
  open: boolean;
  topic: TopicData | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function EditTopicModal({ open, topic, onCancel, onSuccess }: EditTopicModalProps) {
  const handleCancel = () => {
    onCancel();
  };

  if (!topic) {
    return null;
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
          name: topic.name,
        }}
        onSuccess={onSuccess}
        onCancel={handleCancel}
      />
    </Modal>
  );
} 