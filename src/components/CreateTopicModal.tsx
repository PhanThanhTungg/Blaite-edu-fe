"use client";

import { Modal } from 'antd';
import TopicForm from './TopicForm';

interface CreateTopicModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function CreateTopicModal({ open, onCancel, onSuccess }: CreateTopicModalProps) {
  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title="Create New Topic"
      open={open}
      onCancel={handleCancel}
      footer={null}
      maskClosable={true}
      closable={true}
      destroyOnHidden
    >
      <TopicForm
        mode="create"
        onSuccess={onSuccess}
        onCancel={handleCancel}
      />
    </Modal>
  );
}
